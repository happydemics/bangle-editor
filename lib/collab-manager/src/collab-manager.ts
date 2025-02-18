import {
  CollabClientRequestGetDocument,
  CollabClientRequestPullEvents,
  CollabClientRequestPushEvents,
  CollabClientRequestType,
  CollabFail,
  CollabManagerBroadCastType,
  CollabMessageBus,
  DEFAULT_MANAGER_ID,
  ManagerCommunication,
  PullEventsRequestBody,
  PullEventsResponseBody,
  PushEventsRequestBody,
  PushEventsResponseBody,
} from '@bangle.dev/collab-comms';
import { Schema, Step } from '@bangle.dev/pm';
import { Either, EitherType, isTestEnv } from '@bangle.dev/utils';

import { CollabServerState, StepBigger } from './collab-state';
import { InstanceDeleteGuard } from './instance-delete-guard';

type ApplyState = (
  docName: string,
  newCollabState: CollabServerState,
  oldCollabState: CollabServerState,
) => boolean;

const LOG = true;

let log = (isTestEnv ? false : LOG)
  ? console.debug.bind(console, 'collab-manager:')
  : () => {};

export class CollabManager {
  public readonly managerId: string;
  private readonly _abortController = new AbortController();

  private _handleRequest: ConstructorParameters<
    typeof ManagerCommunication
  >[2] = async (request, id) => {
    if (
      !this._instanceDeleteGuard.checkAccess(
        request.body.docName,
        request.body.clientCreatedAt,
      )
    ) {
      return {
        ok: false as const,
        body: CollabFail.HistoryNotAvailable,
        type: request.type,
      };
    }

    log(
      `id=${id} userId=${request.body.userId} received request=${request.type}, `,
    );

    switch (request.type) {
      case CollabClientRequestType.GetDocument: {
        return this._handleGetDocument(request, id);
      }
      case CollabClientRequestType.PullEvents: {
        return this._handlePullEvents(request, id);
      }
      case CollabClientRequestType.PushEvents: {
        return this._handlePushEvents(request, id);
      }
      default: {
        let val: never = request;
        throw new Error('Unknown request type');
      }
    }
  };

  private readonly _instanceDeleteGuard: InstanceDeleteGuard;
  private readonly _instances: Map<string, Instance> = new Map();
  private readonly _serverCom: ManagerCommunication;

  constructor(
    private _options: {
      applyState?: ApplyState;
      // callback to provide the initial collaborate state
      // example: (docName) => new CollabState(fetchDoc(docName))
      getInitialState: (
        docName: string,
      ) => Promise<CollabServerState | undefined>;

      collabMessageBus: CollabMessageBus;
      managerId?: string;
      schema: Schema;
      instanceDeleteGuardOpts?: ConstructorParameters<
        typeof InstanceDeleteGuard
      >[0];
    },
  ) {
    this.managerId = _options.managerId || DEFAULT_MANAGER_ID;

    this._serverCom = new ManagerCommunication(
      this.managerId,
      _options.collabMessageBus,
      this._handleRequest,
      this._abortController.signal,
    );

    this._instanceDeleteGuard = new InstanceDeleteGuard(
      this._options.instanceDeleteGuardOpts || {
        deleteWaitTime: 500,
        maxDurationToKeepRecord: 1000 * 60,
      },
    );
  }

  public destroy() {
    this._abortController.abort();
    this._instanceDeleteGuard.destroy();
  }

  getAllDocNames(): Set<string> {
    return new Set(this._instances.keys());
  }

  getCollabState(docName: string): CollabServerState | undefined {
    return this._instances.get(docName)?.collabState;
  }

  public isDestroyed() {
    return this._abortController.signal.aborted;
  }

  // Requests deletion of instance after a delay if no new clients
  // attempt to connect to the given `docName`. Tweak opts.instanceDeleteGuardOpts
  requestDeleteInstance(docName: string) {
    if (this.isDestroyed()) {
      return;
    }

    // delete the instance after broadcasting
    // since some clients will take a while to terminate
    this._instanceDeleteGuard.addPendingDelete(docName, () => {
      this._instances.delete(docName);
    });
  }

  // removes collab state entry associated with docName.
  // And broadcast to any client with the docName (if any exists)
  // to reset its content and do a fresh fetch of the document.
  // WARNING: this is a destructive operation and will result
  // in loss of any un-pushed client data.
  resetDoc(docName: string): void {
    this._instances.delete(docName);
    this._serverCom.broadcast({
      type: CollabManagerBroadCastType.ResetClient,
      body: {
        docName: docName,
      },
    });
  }

  private async _createInstance(
    docName: string,
  ): Promise<EitherType<CollabFail, Instance>> {
    const initialCollabState = await this._options.getInitialState(docName);

    // this takes care of edge case where another instance is created
    // while we wait on `getInitialState`.
    let instance = this._instances.get(docName);

    if (instance) {
      return Either.right(instance);
    }

    if (!initialCollabState) {
      return Either.left(CollabFail.DocumentNotFound);
    }

    instance = new Instance(
      docName,
      this._options.schema,
      initialCollabState,
      this._options.applyState,
    );
    this._instances.set(docName, instance);

    return Either.right(instance);
  }

  /**
   * Get an instance of a document or creates a new one
   * if none exists.
   * @param docName
   * @returns
   */
  private async _getInstance(docName: string) {
    const instance = this._instances.get(docName);

    if (instance) {
      instance.lastActive = Date.now();
      return Either.right(instance);
    }

    return this._createInstance(docName);
  }

  private async _handleGetDocument(
    request: CollabClientRequestGetDocument['request'],
    uid?: string,
  ): Promise<CollabClientRequestGetDocument['response']> {
    const work = (instance: Instance) => {
      return {
        doc: instance.collabState.doc.toJSON(),
        users: instance.userCount,
        version: instance.collabState.version,
        managerId: this.managerId,
      };
    };

    return this._toResponse(
      Either.map(await this._getInstance(request.body.docName), work),
      request.type,
    );
  }

  private async _handlePullEvents(
    request: CollabClientRequestPullEvents['request'],
    uid?: string,
  ): Promise<CollabClientRequestPullEvents['response']> {
    const work = (instance: Instance) => {
      if (this.managerId !== request.body.managerId) {
        return Either.left(CollabFail.IncorrectManager);
      }

      return instance.getEvents(request.body);
    };

    return this._toResponse(
      Either.flatMap(await this._getInstance(request.body.docName), work),
      request.type,
    );
  }

  private async _handlePushEvents(
    request: CollabClientRequestPushEvents['request'],
    uid?: string,
  ): Promise<CollabClientRequestPushEvents['response']> {
    const work = (instance: Instance) => {
      const { type, body } = request;

      if (this.managerId !== body.managerId) {
        return Either.left(CollabFail.IncorrectManager);
      }

      const result = instance.addEvents(body);

      if (Either.isRight(result)) {
        queueMicrotask(() => {
          this._serverCom.broadcast({
            type: CollabManagerBroadCastType.NewVersion,
            body: {
              docName: instance.docName,
              version: instance.collabState.version,
            },
          });
        });
      }
      return result;
    };

    return this._toResponse(
      Either.flatMap(await this._getInstance(request.body.docName), work),
      request.type,
    );
  }

  private _toResponse<R, P extends CollabClientRequestType>(
    val: EitherType<CollabFail, R>,
    requestType: P,
  ) {
    if (Either.isLeft(val)) {
      return {
        ok: false as const,
        body: val.left,
        type: requestType,
      };
    } else {
      return {
        ok: true as const,
        body: val.right,
        type: requestType,
      };
    }
  }
}

class Instance {
  public lastActive = Date.now();

  constructor(
    public readonly docName: string,
    private readonly schema: Schema,
    private _collabState: CollabServerState,
    private _applyState: ApplyState = (
      docName,
      newCollabState,
      oldCollabState,
    ) => {
      return true;
    },
  ) {}

  get collabState() {
    return this._collabState;
  }

  // TODO add userCount
  get userCount(): number {
    return 1;
  }

  public addEvents({
    clientID,
    version: rawVersion,
    steps,
    userId,
    docName,
  }: PushEventsRequestBody): EitherType<CollabFail, PushEventsResponseBody> {
    this.lastActive = Date.now();

    let version = nonNegInteger(rawVersion);

    if (version === undefined) {
      return Either.left(CollabFail.InvalidVersion);
    }

    const parsedSteps = steps.map((s) => Step.fromJSON(this.schema, s));

    return Either.flatMap(
      CollabServerState.addEvents(
        this._collabState,
        version,
        parsedSteps,
        clientID,
      ),
      (collabState) => {
        if (this._applyState(docName, collabState, this._collabState)) {
          this._collabState = collabState;
        } else {
          return Either.left(CollabFail.ApplyFailed);
        }

        return Either.right({
          empty: null,
        });
      },
    );
  }

  public getEvents({
    docName,
    version,
    userId,
    managerId,
  }: PullEventsRequestBody): EitherType<CollabFail, PullEventsResponseBody> {
    return Either.map(
      CollabServerState.getEvents(this._collabState, version),
      (events) => {
        return {
          version: events.version,
          steps: events.steps.map((step: StepBigger) => step.toJSON()),
          clientIDs: events.steps.map((step: StepBigger) => step.clientID),
          users: this.userCount, // TODO
        };
      },
    );
  }
}

function nonNegInteger(str: any): number | undefined {
  let num = Number(str);
  if (!isNaN(num) && Math.floor(num) === num && num >= 0) {
    return num;
  }
  return undefined;
}
