import { CollabFail, CollabClientRequestType, DEFAULT_MANAGER_ID, ManagerCommunication, CollabManagerBroadCastType } from '@bangle.dev/collab-comms';
import { Step } from '@bangle.dev/pm';
import { isTestEnv, Either } from '@bangle.dev/utils';

const MAX_STEP_HISTORY = 1000;
const LOG$1 = true;
let log$1 = (isTestEnv ? false : LOG$1)
    ? console.debug.bind(console, 'collab-manager/state:')
    : () => { };
class CollabServerState {
    static addEvents(state, version, steps, clientID) {
        if (CollabServerState.isInvalidVersion(state, version)) {
            return Either.left(CollabFail.InvalidVersion);
        }
        const biggerSteps = steps.map((s) => Object.assign(s, { clientID }));
        if (state.version !== version) {
            return Either.left(CollabFail.OutdatedVersion);
        }
        let newDoc = state.doc;
        const maps = [];
        for (const step of biggerSteps) {
            let result;
            try {
                result = step.apply(newDoc);
            }
            catch (error) {
                console.error(error);
                return Either.left(CollabFail.ApplyFailed);
            }
            if (result.doc == null) {
                return Either.left(CollabFail.ApplyFailed);
            }
            newDoc = result.doc;
            maps.push(step.getMap());
        }
        const newVersion = state.version + biggerSteps.length;
        const newSteps = state.steps.concat(biggerSteps);
        log$1(`${clientID}: addEvents version=${newVersion}`);
        return Either.right(new CollabServerState(newDoc, newSteps, newVersion));
    }
    static getEvents(collabState, version) {
        if (CollabServerState.isInvalidVersion(collabState, version)) {
            return Either.left(CollabFail.InvalidVersion);
        }
        let startIndex = collabState.steps.length - (collabState.version - version);
        if (startIndex < 0) {
            return Either.left(CollabFail.HistoryNotAvailable);
        }
        return Either.right({
            version: collabState.version,
            steps: collabState.steps.slice(startIndex),
        });
    }
    static isInvalidVersion(collabState, version) {
        return version < 0 || version > collabState.version;
    }
    constructor(doc, steps = [], version = 0) {
        this.doc = doc;
        this.steps = steps;
        this.version = version;
        // Trim steps if needed
        if (steps.length > MAX_STEP_HISTORY) {
            this.steps = steps.slice(steps.length - MAX_STEP_HISTORY);
        }
    }
}

const maxNoOfPendingRecords = 100;
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
class InstanceDeleteGuard {
    constructor(opts) {
        this.opts = opts;
        this.pendingDeleteRecord = new Map();
        if (this.opts.deleteWaitTime >= this.opts.maxDurationToKeepRecord) {
            throw new Error('deleteWaitTime must be less than maxDurationToKeepRecord');
        }
    }
    addPendingDelete(docName, deleteCallback) {
        var _a;
        // if there is already a delete request pending, abort it
        (_a = this.pendingDeleteRecord.get(docName)) === null || _a === void 0 ? void 0 : _a.abortDelete.abort();
        const abortController = new AbortController();
        this.pendingDeleteRecord.set(docName, {
            deleteTime: Date.now(),
            abortDelete: abortController,
        });
        abortableSetTimeout(deleteCallback, abortController.signal, this.opts.deleteWaitTime);
        this.containSize();
    }
    /**
     * Guard to ensure client is not accessing an instance that is about to be deleted or is deleted
     */
    checkAccess(docName, clientCreatedAt) {
        const record = this.pendingDeleteRecord.get(docName);
        if (!record) {
            return true;
        }
        // if client was created after the delete request
        // we cancel the pending delete instance request. Note that the request may have already
        // been executed, but we don't care about that.
        // we also grant access but we still keep the record around, in case an older client
        // tries to access the instance.
        if (clientCreatedAt > record.deleteTime) {
            record.abortDelete.abort();
            return true;
        }
        return false;
    }
    containSize() {
        const timeNow = Date.now();
        let sorted = Array.from(this.pendingDeleteRecord.entries()).filter((item) => {
            return (timeNow - item[1].deleteTime <= this.opts.maxDurationToKeepRecord);
        });
        if (sorted.length > maxNoOfPendingRecords) {
            sorted = sorted
                .sort((a, b) => {
                return b[1].deleteTime - a[1].deleteTime;
            })
                .slice(0, maxNoOfPendingRecords);
        }
        this.pendingDeleteRecord = new Map(sorted);
    }
    destroy() {
        this.pendingDeleteRecord.forEach((item) => {
            item.abortDelete.abort();
        });
        this.pendingDeleteRecord.clear();
    }
}
function abortableSetTimeout(callback, signal, ms) {
    const timer = setTimeout(callback, ms);
    signal.addEventListener('abort', () => {
        clearTimeout(timer);
    }, { once: true });
}

const LOG = true;
let log = (isTestEnv ? false : LOG)
    ? console.debug.bind(console, 'collab-manager:')
    : () => { };
class CollabManager {
    constructor(_options) {
        this._options = _options;
        this._abortController = new AbortController();
        this._handleRequest = async (request, id) => {
            if (!this._instanceDeleteGuard.checkAccess(request.body.docName, request.body.clientCreatedAt)) {
                return {
                    ok: false,
                    body: CollabFail.HistoryNotAvailable,
                    type: request.type,
                };
            }
            log(`id=${id} userId=${request.body.userId} received request=${request.type}, `);
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
                    throw new Error('Unknown request type');
                }
            }
        };
        this._instances = new Map();
        this.managerId = _options.managerId || DEFAULT_MANAGER_ID;
        this._serverCom = new ManagerCommunication(this.managerId, _options.collabMessageBus, this._handleRequest, this._abortController.signal);
        this._instanceDeleteGuard = new InstanceDeleteGuard(this._options.instanceDeleteGuardOpts || {
            deleteWaitTime: 500,
            maxDurationToKeepRecord: 1000 * 60,
        });
    }
    destroy() {
        this._abortController.abort();
        this._instanceDeleteGuard.destroy();
    }
    getAllDocNames() {
        return new Set(this._instances.keys());
    }
    getCollabState(docName) {
        var _a;
        return (_a = this._instances.get(docName)) === null || _a === void 0 ? void 0 : _a.collabState;
    }
    isDestroyed() {
        return this._abortController.signal.aborted;
    }
    // Requests deletion of instance after a delay if no new clients
    // attempt to connect to the given `docName`. Tweak opts.instanceDeleteGuardOpts
    requestDeleteInstance(docName) {
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
    resetDoc(docName) {
        this._instances.delete(docName);
        this._serverCom.broadcast({
            type: CollabManagerBroadCastType.ResetClient,
            body: {
                docName: docName,
            },
        });
    }
    async _createInstance(docName) {
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
        instance = new Instance(docName, this._options.schema, initialCollabState, this._options.applyState);
        this._instances.set(docName, instance);
        return Either.right(instance);
    }
    /**
     * Get an instance of a document or creates a new one
     * if none exists.
     * @param docName
     * @returns
     */
    async _getInstance(docName) {
        const instance = this._instances.get(docName);
        if (instance) {
            instance.lastActive = Date.now();
            return Either.right(instance);
        }
        return this._createInstance(docName);
    }
    async _handleGetDocument(request, uid) {
        const work = (instance) => {
            return {
                doc: instance.collabState.doc.toJSON(),
                users: instance.userCount,
                version: instance.collabState.version,
                managerId: this.managerId,
            };
        };
        return this._toResponse(Either.map(await this._getInstance(request.body.docName), work), request.type);
    }
    async _handlePullEvents(request, uid) {
        const work = (instance) => {
            if (this.managerId !== request.body.managerId) {
                return Either.left(CollabFail.IncorrectManager);
            }
            return instance.getEvents(request.body);
        };
        return this._toResponse(Either.flatMap(await this._getInstance(request.body.docName), work), request.type);
    }
    async _handlePushEvents(request, uid) {
        const work = (instance) => {
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
        return this._toResponse(Either.flatMap(await this._getInstance(request.body.docName), work), request.type);
    }
    _toResponse(val, requestType) {
        if (Either.isLeft(val)) {
            return {
                ok: false,
                body: val.left,
                type: requestType,
            };
        }
        else {
            return {
                ok: true,
                body: val.right,
                type: requestType,
            };
        }
    }
}
class Instance {
    constructor(docName, schema, _collabState, _applyState = (docName, newCollabState, oldCollabState) => {
        return true;
    }) {
        this.docName = docName;
        this.schema = schema;
        this._collabState = _collabState;
        this._applyState = _applyState;
        this.lastActive = Date.now();
    }
    get collabState() {
        return this._collabState;
    }
    // TODO add userCount
    get userCount() {
        return 1;
    }
    addEvents({ clientID, version: rawVersion, steps, userId, docName, }) {
        this.lastActive = Date.now();
        let version = nonNegInteger(rawVersion);
        if (version === undefined) {
            return Either.left(CollabFail.InvalidVersion);
        }
        const parsedSteps = steps.map((s) => Step.fromJSON(this.schema, s));
        return Either.flatMap(CollabServerState.addEvents(this._collabState, version, parsedSteps, clientID), (collabState) => {
            if (this._applyState(docName, collabState, this._collabState)) {
                this._collabState = collabState;
            }
            else {
                return Either.left(CollabFail.ApplyFailed);
            }
            return Either.right({
                empty: null,
            });
        });
    }
    getEvents({ docName, version, userId, managerId, }) {
        return Either.map(CollabServerState.getEvents(this._collabState, version), (events) => {
            return {
                version: events.version,
                steps: events.steps.map((step) => step.toJSON()),
                clientIDs: events.steps.map((step) => step.clientID),
                users: this.userCount, // TODO
            };
        });
    }
}
function nonNegInteger(str) {
    let num = Number(str);
    if (!isNaN(num) && Math.floor(num) === num && num >= 0) {
        return num;
    }
    return undefined;
}

export { CollabManager, CollabServerState, MAX_STEP_HISTORY };
