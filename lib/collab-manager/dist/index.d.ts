import { CollabFail, CollabMessageBus } from '@bangle.dev/collab-comms';
import { Node, Step, Schema } from '@bangle.dev/pm';
import { EitherType } from '@bangle.dev/utils';

interface StepBigger extends Step {
    clientID: string;
}
declare const MAX_STEP_HISTORY = 1000;
declare class CollabServerState {
    readonly doc: Node;
    readonly steps: StepBigger[];
    readonly version: number;
    static addEvents(state: CollabServerState, version: number, steps: Step[], clientID: string): EitherType<CollabFail, CollabServerState>;
    static getEvents(collabState: CollabServerState, version: number): EitherType<CollabFail, {
        version: number;
        steps: StepBigger[];
    }>;
    static isInvalidVersion(collabState: CollabServerState, version: number): boolean;
    constructor(doc: Node, steps?: StepBigger[], version?: number);
}

/**
 * A class for managing the instance deletion respecting the following conditions:
 * - If no new client connects to the instance, the instance is deleted after a delay.
 * - If a new client connects to the instance, the deletion is aborted.
 *    - Even if deletion was aborted, older clients will continue to see `checkAccess` return `false`.
 * - Older clients will start seeing `checkAccess` return `false`, right after the request to delete is called.
 * - Newer clients will see `checkAccess` return `true`.
 * - If instance was never requested to be deleted, all `checkAccess` calls will return `true`.
 *
 * New client: Any client that was created after the request to delete was called.
 * Old client: Any client that was created before the request to delete was called.
 */
declare class InstanceDeleteGuard {
    opts: {
        deleteWaitTime: number;
        maxDurationToKeepRecord: number;
    };
    pendingDeleteRecord: Map<string, {
        deleteTime: number;
        abortDelete: AbortController;
    }>;
    constructor(opts: {
        deleteWaitTime: number;
        maxDurationToKeepRecord: number;
    });
    addPendingDelete(docName: string, deleteCallback: () => void): void;
    /**
     * Guard to ensure client is not accessing an instance that is about to be deleted or is deleted
     */
    checkAccess(docName: string, clientCreatedAt: number): boolean;
    containSize(): void;
    destroy(): void;
}

type ApplyState = (docName: string, newCollabState: CollabServerState, oldCollabState: CollabServerState) => boolean;
declare class CollabManager {
    private _options;
    readonly managerId: string;
    private readonly _abortController;
    private _handleRequest;
    private readonly _instanceDeleteGuard;
    private readonly _instances;
    private readonly _serverCom;
    constructor(_options: {
        applyState?: ApplyState;
        getInitialState: (docName: string) => Promise<CollabServerState | undefined>;
        collabMessageBus: CollabMessageBus;
        managerId?: string;
        schema: Schema;
        instanceDeleteGuardOpts?: ConstructorParameters<typeof InstanceDeleteGuard>[0];
    });
    destroy(): void;
    getAllDocNames(): Set<string>;
    getCollabState(docName: string): CollabServerState | undefined;
    isDestroyed(): boolean;
    requestDeleteInstance(docName: string): void;
    resetDoc(docName: string): void;
    private _createInstance;
    /**
     * Get an instance of a document or creates a new one
     * if none exists.
     * @param docName
     * @returns
     */
    private _getInstance;
    private _handleGetDocument;
    private _handlePullEvents;
    private _handlePushEvents;
    private _toResponse;
}

export { CollabManager, CollabServerState, MAX_STEP_HISTORY };
