import { getVersion, receiveTransaction, sendableSteps, collab } from 'prosemirror-collab';
import { CollabFail, ClientCommunication, DEFAULT_MANAGER_ID } from '@bangle.dev/collab-comms';
import { sleep, abortableSetTimeout, isTestEnv, uuid } from '@bangle.dev/utils';
import { PluginKey, Step, TextSelection, Selection, Node, Plugin } from '@bangle.dev/pm';

const MAX_STATES_TO_KEEP = 15;
// If there are STUCK_IN_ERROR_THRESHOLD or more states in the history
// the machine will transition to fatal (terminal) error state to prevent
// infinite loops.
const STUCK_IN_ERROR_THRESHOLD = 5;
const collabClientKey = new PluginKey('bangle.dev/collab-client');
const collabMonitorKey = new PluginKey('bangle.dev/collabMonitorKey');
var EventType;
(function (EventType) {
    EventType["Fatal"] = "FATAL_EVENT";
    EventType["HardReset"] = "HARD_RESET_EVENT";
    EventType["InitDoc"] = "INIT_DOC_EVENT";
    EventType["InitError"] = "INIT_ERROR_EVENT";
    EventType["Pull"] = "PULL_EVENT";
    EventType["Push"] = "PUSH_EVENT";
    EventType["PushPullError"] = "PUSH_PULL_ERROR_EVENT";
    EventType["Ready"] = "READY_EVENT";
    EventType["Restart"] = "RESTART_EVENT";
})(EventType || (EventType = {}));
var FatalErrorCode;
(function (FatalErrorCode) {
    FatalErrorCode["InitialDocLoadFailed"] = "INITIAL_DOC_LOAD_FAILED";
    FatalErrorCode["StuckInInfiniteLoop"] = "STUCK_IN_INFINITE_LOOP";
    FatalErrorCode["IncorrectManager"] = "INCORRECT_MANAGER";
    FatalErrorCode["HistoryNotAvailable"] = "HISTORY_NOT_AVAILABLE";
    FatalErrorCode["DocumentNotFound"] = "DOCUMENT_NOT_FOUND";
    FatalErrorCode["UnexpectedState"] = "UNEXPECTED_STATE";
})(FatalErrorCode || (FatalErrorCode = {}));
var CollabStateName;
(function (CollabStateName) {
    CollabStateName["Fatal"] = "FATAL_STATE";
    CollabStateName["Init"] = "INIT_STATE";
    CollabStateName["InitDoc"] = "INIT_DOC_STATE";
    CollabStateName["InitError"] = "INIT_ERROR_STATE";
    CollabStateName["Pull"] = "PULL_STATE";
    CollabStateName["Push"] = "PUSH_STATE";
    CollabStateName["PushPullError"] = "PUSH_PULL_ERROR_STATE";
    CollabStateName["Ready"] = "READY_STATE";
})(CollabStateName || (CollabStateName = {}));

// Applies steps from the server to the editor.
// returns false if applying these steps failed
function applySteps(view, payload, logger) {
    if (view.isDestroyed) {
        return;
    }
    const steps = (payload.steps ? payload.steps : []).map((j) => Step.fromJSON(view.state.schema, j));
    const clientIDs = payload.clientIDs ? payload.clientIDs : [];
    if (steps.length === 0) {
        logger('no steps', payload, 'version', getVersion(view.state));
        return;
    }
    try {
        const tr = receiveTransaction(view.state, steps, clientIDs)
            .setMeta('addToHistory', false)
            .setMeta('bangle.dev/isRemote', true);
        const newState = view.state.apply(tr);
        view.updateState(newState);
    }
    catch (error) {
        console.error(error);
        return false;
    }
    logger('after apply version', getVersion(view.state));
    return true;
}
// Replaces the current doc content with the provided one.
// returns false if applying these steps failed.
function applyDoc(view, doc, version, oldSelection) {
    if (view.isDestroyed) {
        return;
    }
    const prevSelection = view.state.selection instanceof TextSelection
        ? view.state.selection
        : undefined;
    let tr = replaceDocument(view.state, doc, version);
    const selection = oldSelection || prevSelection;
    if (selection) {
        let { from } = selection;
        if (from >= tr.doc.content.size) {
            tr = tr.setSelection(Selection.atEnd(tr.doc));
        }
        else {
            tr = tr.setSelection(Selection.near(tr.doc.resolve(from)));
        }
    }
    try {
        const newState = view.state.apply(tr.setMeta('bangle.dev/isRemote', true));
        view.updateState(newState);
    }
    catch (error) {
        console.error(error);
        return false;
    }
    return true;
}
function replaceDocument(state, serializedDoc, version) {
    const { schema, tr } = state;
    const content = 
    // TODO remove serializedDoc
    serializedDoc instanceof Node
        ? serializedDoc.content
        : (serializedDoc.content || []).map((child) => schema.nodeFromJSON(child));
    const hasContent = Array.isArray(content)
        ? content.length > 0
        : Boolean(content);
    if (!hasContent) {
        return tr;
    }
    tr.setMeta('addToHistory', false);
    tr.replaceWith(0, state.doc.nodeSize - 2, content);
    tr.setSelection(Selection.atStart(tr.doc));
    if (typeof version !== undefined) {
        const collabState = { version, unconfirmed: [] };
        tr.setMeta('collab$', collabState);
    }
    return tr;
}
function getCollabState(state) {
    var _a;
    return (_a = collabClientKey.getState(state)) === null || _a === void 0 ? void 0 : _a.collabState;
}

/**
 * If in fatal state (a terminal state) and  returns the error information.
 * @returns
 */
function queryFatalError() {
    return (state) => {
        const collabState = getCollabState(state);
        if (collabState === null || collabState === void 0 ? void 0 : collabState.isFatalState()) {
            return collabState.state;
        }
        return undefined;
    };
}
function queryCollabState() {
    return (state) => {
        const collabState = getCollabState(state);
        return collabState;
    };
}
// Discards any editor changes that have not yet been sent to the server.
// and sets the editor doc to the one provider by server.
function hardResetClient() {
    return (state, dispatch) => {
        const collabState = getCollabState(state);
        collabState === null || collabState === void 0 ? void 0 : collabState.dispatchCollabPluginEvent({
            signal: new AbortController().signal,
            collabEvent: {
                type: EventType.HardReset,
            },
            debugInfo: 'hard-reset',
        })(state, dispatch);
        return true;
    };
}
// Saves the server version of the document. Rest of the extension
// then uses this information to determine whether to pull from server or not.
function updateServerVersion(serverVersion) {
    return (state, dispatch) => {
        const pluginState = collabMonitorKey.getState(state);
        if (!pluginState) {
            return false;
        }
        if (pluginState.serverVersion !== serverVersion) {
            const meta = { serverVersion: serverVersion };
            dispatch === null || dispatch === void 0 ? void 0 : dispatch(state.tr.setMeta(collabMonitorKey, meta));
            return true;
        }
        return false;
    };
}
function onLocalChanges() {
    return (state, dispatch) => {
        const collabState = getCollabState(state);
        if (collabState === null || collabState === void 0 ? void 0 : collabState.isReadyState()) {
            collabState === null || collabState === void 0 ? void 0 : collabState.dispatch(new AbortController().signal, state, dispatch, {
                type: EventType.Push,
            }, 'onLocalChanges');
            return true;
        }
        return false;
    };
}
function isOutdatedVersion() {
    return (state) => {
        var _a;
        const serverVersion = (_a = collabMonitorKey.getState(state)) === null || _a === void 0 ? void 0 : _a.serverVersion;
        return (typeof serverVersion === 'number' && getVersion(state) < serverVersion);
    };
}
function onOutdatedVersion() {
    return (state, dispatch) => {
        const collabState = getCollabState(state);
        // only dispatch if in ready state, so as to trigger a state transition
        // from ready-state -> whatever.
        // If state is not in ready state, whenever it eventually transitions to
        // ready state it's own action will dispatch these events automatically.
        if (collabState === null || collabState === void 0 ? void 0 : collabState.isReadyState()) {
            collabState.dispatch(new AbortController().signal, state, dispatch, {
                type: EventType.Pull,
            }, 'collabMonitorKey(outdated-local-version)');
            return true;
        }
        return false;
    };
}
function isStuckInErrorStates() {
    return (state) => {
        var _a;
        const previousStates = (_a = collabClientKey.getState(state)) === null || _a === void 0 ? void 0 : _a.previousStates;
        if (!previousStates) {
            return false;
        }
        return (previousStates.filter((s) => s.isTaggedError).length >
            STUCK_IN_ERROR_THRESHOLD);
    };
}

class CollabBaseState {
    constructor() {
        // If false, the document is frozen and no edits and _almost_ no transactions are allowed.
        // Some collab tr's are allowed.
        this.isEditingBlocked = false;
        this.isTaggedError = false;
        this.createdAt = Date.now();
    }
    // A helper function to dispatch events in correct shape
    dispatchCollabPluginEvent(data) {
        return (state, dispatch) => {
            if (!data.signal.aborted) {
                dispatch === null || dispatch === void 0 ? void 0 : dispatch(state.tr.setMeta(collabClientKey, data));
                return true;
            }
            return false;
        };
    }
    isFatalState() {
        return this instanceof FatalState;
    }
    isReadyState() {
        return this instanceof ReadyState;
    }
}
class FatalState extends CollabBaseState {
    constructor(state, debugInfo) {
        super();
        this.state = state;
        this.debugInfo = debugInfo;
        this.isEditingBlocked = true;
        this.isTaggedError = true;
        this.name = CollabStateName.Fatal;
    }
    dispatch(signal, state, dispatch, event, debugInfo) {
        return this.dispatchCollabPluginEvent({
            signal,
            collabEvent: event,
            debugInfo,
        })(state, dispatch);
    }
    async runAction({ signal, clientInfo, logger }) {
        if (signal.aborted) {
            return;
        }
        logger(`Freezing document(${clientInfo.docName}) to prevent further edits due to FatalState`);
        return;
    }
    transition(event, debugInfo) {
        return this;
    }
}
class InitState extends CollabBaseState {
    constructor(state = {}, debugInfo) {
        super();
        this.state = state;
        this.debugInfo = debugInfo;
        this.isEditingBlocked = true;
        this.name = CollabStateName.Init;
        // clientCreatedAt should just be created once at the start of the client
        // and not at any state where the value might change during the course of the clients life.
        // this field setup order is instrumental to connect with the server.
        this.clientCreatedAt = Date.now();
    }
    dispatch(signal, state, dispatch, event, debugInfo) {
        return this.dispatchCollabPluginEvent({
            signal,
            collabEvent: event,
            debugInfo,
        })(state, dispatch);
    }
    async runAction({ clientInfo, signal, view }) {
        if (signal.aborted) {
            return;
        }
        const { docName, userId, clientCom } = clientInfo;
        const debugSource = `initStateAction:`;
        // Wait for the editor state to settle in before make the getDocument request.
        if (typeof clientInfo.warmupTime === 'number') {
            await sleep(clientInfo.warmupTime);
            if (signal.aborted) {
                return;
            }
        }
        const result = await clientCom.getDocument({
            clientCreatedAt: this.clientCreatedAt,
            docName,
            userId,
        });
        if (signal.aborted) {
            return;
        }
        if (!result.ok) {
            this.dispatch(signal, view.state, view.dispatch, {
                type: EventType.InitError,
                payload: { failure: result.body },
            }, debugSource);
            return;
        }
        const { doc, managerId, version } = result.body;
        this.dispatch(signal, view.state, view.dispatch, {
            type: EventType.InitDoc,
            payload: {
                doc: view.state.schema.nodeFromJSON(doc),
                version,
                managerId,
                selection: undefined,
            },
        }, debugSource);
        return;
    }
    transition(event, debugInfo) {
        const type = event.type;
        if (type === EventType.InitDoc) {
            const { payload } = event;
            return new InitDocState({
                initialDoc: payload.doc,
                initialSelection: payload.selection,
                initialVersion: payload.version,
                managerId: payload.managerId,
                clientCreatedAt: this.clientCreatedAt,
            }, debugInfo);
        }
        else if (type === EventType.InitError) {
            return new InitErrorState({
                failure: event.payload.failure,
            }, debugInfo);
        }
        else {
            console.debug('@bangle.dev/collab-client Ignoring event' + type);
            return;
        }
    }
}
class InitDocState extends CollabBaseState {
    constructor(state, debugInfo) {
        super();
        this.state = state;
        this.debugInfo = debugInfo;
        this.isEditingBlocked = true;
        this.name = CollabStateName.InitDoc;
    }
    dispatch(signal, state, dispatch, event, debugInfo) {
        return this.dispatchCollabPluginEvent({
            signal,
            collabEvent: event,
            debugInfo,
        })(state, dispatch);
    }
    async runAction({ signal, view }) {
        if (signal.aborted) {
            return;
        }
        const { initialDoc, initialVersion, initialSelection } = this.state;
        if (!signal.aborted) {
            const success = applyDoc(view, initialDoc, initialVersion, initialSelection);
            if (success === false) {
                this.dispatch(signal, view.state, view.dispatch, {
                    type: EventType.Fatal,
                    payload: {
                        message: 'Failed to load initial doc',
                        errorCode: FatalErrorCode.InitialDocLoadFailed,
                    },
                });
            }
            else {
                this.dispatch(signal, view.state, view.dispatch, {
                    type: EventType.Ready,
                }, `runAction:${this.name}`);
            }
        }
    }
    transition(event, debugInfo) {
        const type = event.type;
        if (type === EventType.Ready) {
            return new ReadyState(this.state, debugInfo);
        }
        else if (type === EventType.Fatal) {
            return new FatalState({ message: event.payload.message, errorCode: event.payload.errorCode }, debugInfo);
        }
        else {
            console.debug('@bangle.dev/collab-client Ignoring event' + type);
            return;
        }
    }
}
class InitErrorState extends CollabBaseState {
    constructor(state, debugInfo) {
        super();
        this.state = state;
        this.debugInfo = debugInfo;
        this.isEditingBlocked = true;
        this.isTaggedError = true;
        this.name = CollabStateName.InitError;
    }
    dispatch(signal, state, dispatch, event, debugInfo) {
        return this.dispatchCollabPluginEvent({
            signal,
            collabEvent: event,
            debugInfo,
        })(state, dispatch);
    }
    async runAction(param) {
        await handleErrorStateAction({ ...param, collabState: this });
    }
    transition(event, debugInfo) {
        const type = event.type;
        if (type === EventType.Restart) {
            return new InitState(undefined, debugInfo);
        }
        else if (type === EventType.Fatal) {
            return new FatalState({ message: event.payload.message, errorCode: event.payload.errorCode }, debugInfo);
        }
        else {
            console.debug('@bangle.dev/collab-client Ignoring event' + type);
            return undefined;
        }
    }
}
class ReadyState extends CollabBaseState {
    constructor(state, debugInfo) {
        super();
        this.state = state;
        this.debugInfo = debugInfo;
        this.name = CollabStateName.Ready;
    }
    dispatch(signal, state, dispatch, event, debugInfo) {
        return this.dispatchCollabPluginEvent({
            signal,
            collabEvent: event,
            debugInfo,
        })(state, dispatch);
    }
    async runAction({ signal, view }) {
        if (signal.aborted) {
            return;
        }
        const debugString = `runActions:${this.name}`;
        if (!signal.aborted) {
            if (isOutdatedVersion()(view.state)) {
                this.dispatch(signal, view.state, view.dispatch, {
                    type: EventType.Pull,
                }, debugString + '(outdated-local-version)');
            }
            else if (sendableSteps(view.state)) {
                this.dispatch(signal, view.state, view.dispatch, {
                    type: EventType.Push,
                }, debugString + '(sendable-steps)');
            }
        }
        return;
    }
    transition(event, debugInfo) {
        const type = event.type;
        if (type === EventType.Push) {
            return new PushState(this.state, debugInfo);
        }
        else if (type === EventType.Pull) {
            return new PullState(this.state, debugInfo);
        }
        else {
            console.debug('@bangle.dev/collab-client Ignoring event' + type);
            return;
        }
    }
}
class PushState extends CollabBaseState {
    constructor(state, debugInfo) {
        super();
        this.state = state;
        this.debugInfo = debugInfo;
        this.name = CollabStateName.Push;
    }
    dispatch(signal, state, dispatch, event, debugInfo) {
        return this.dispatchCollabPluginEvent({
            signal,
            collabEvent: event,
            debugInfo,
        })(state, dispatch);
    }
    async runAction({ clientInfo, signal, view }) {
        if (signal.aborted) {
            return;
        }
        const { docName, userId, clientCom } = clientInfo;
        const debugSource = `pushStateAction:`;
        const steps = sendableSteps(view.state);
        if (!steps) {
            this.dispatch(signal, view.state, view.dispatch, {
                type: EventType.Ready,
            }, debugSource + '(no steps):');
            return;
        }
        const { managerId } = this.state;
        const response = await clientCom.pushEvents({
            clientCreatedAt: this.state.clientCreatedAt,
            version: getVersion(view.state),
            steps: steps ? steps.steps.map((s) => s.toJSON()) : [],
            // TODO  the default value numerical 0 before
            clientID: (steps ? steps.clientID : 0) + '',
            docName: docName,
            userId: userId,
            managerId: managerId,
        });
        if (signal.aborted) {
            return;
        }
        if (response.ok) {
            // Pull changes to confirm our steps and also
            // get any new steps from other clients
            this.dispatch(signal, view.state, view.dispatch, {
                type: EventType.Pull,
            }, debugSource);
        }
        else {
            this.dispatch(signal, view.state, view.dispatch, {
                type: EventType.PushPullError,
                payload: { failure: response.body },
            }, debugSource);
        }
        return;
    }
    transition(event, debugInfo) {
        const type = event.type;
        if (type === EventType.Ready) {
            return new ReadyState(this.state, debugInfo);
        }
        else if (type === EventType.Pull) {
            return new PullState(this.state, debugInfo);
        }
        else if (type === EventType.PushPullError) {
            return new PushPullErrorState({
                failure: event.payload.failure,
                initDocState: this.state,
            }, debugInfo);
        }
        else {
            console.debug('@bangle.dev/collab-client Ignoring event' + type);
            return;
        }
    }
}
class PullState extends CollabBaseState {
    constructor(state, debugInfo) {
        super();
        this.state = state;
        this.debugInfo = debugInfo;
        this.name = CollabStateName.Pull;
    }
    dispatch(signal, state, dispatch, event, debugInfo) {
        return this.dispatchCollabPluginEvent({
            signal,
            collabEvent: event,
            debugInfo,
        })(state, dispatch);
    }
    async runAction({ clientInfo, logger, signal, view }) {
        if (signal.aborted) {
            return;
        }
        const { docName, userId, clientCom } = clientInfo;
        const { managerId } = this.state;
        const response = await clientCom.pullEvents({
            clientCreatedAt: this.state.clientCreatedAt,
            version: getVersion(view.state),
            docName: docName,
            userId: userId,
            managerId: managerId,
        });
        if (signal.aborted) {
            return;
        }
        const debugSource = `pullStateAction:`;
        if (response.ok) {
            const success = applySteps(view, response.body, logger);
            if (success === false) {
                this.dispatch(signal, view.state, view.dispatch, {
                    type: EventType.PushPullError,
                    payload: { failure: CollabFail.ApplyFailed },
                }, debugSource + '(local-apply-failed)');
            }
            else {
                // keep our local server version up to date with what server responded with
                updateServerVersion(response.body.version)(view.state, view.dispatch);
                this.dispatch(signal, view.state, view.dispatch, {
                    type: EventType.Ready,
                }, debugSource);
            }
        }
        else {
            this.dispatch(signal, view.state, view.dispatch, {
                type: EventType.PushPullError,
                payload: { failure: response.body },
            }, debugSource);
        }
        return;
    }
    transition(event, debugInfo) {
        const type = event.type;
        if (type === EventType.Ready) {
            return new ReadyState(this.state, debugInfo);
        }
        else if (type === EventType.PushPullError) {
            return new PushPullErrorState({
                failure: event.payload.failure,
                initDocState: this.state,
            }, debugInfo);
        }
        else {
            return;
        }
    }
}
class PushPullErrorState extends CollabBaseState {
    constructor(state, debugInfo) {
        super();
        this.state = state;
        this.debugInfo = debugInfo;
        this.isTaggedError = true;
        this.name = CollabStateName.PushPullError;
    }
    dispatch(signal, state, dispatch, event, debugInfo) {
        return this.dispatchCollabPluginEvent({
            signal,
            collabEvent: event,
            debugInfo,
        })(state, dispatch);
    }
    async runAction(param) {
        await handleErrorStateAction({ ...param, collabState: this });
    }
    transition(event, debugInfo) {
        const type = event.type;
        if (type === EventType.Restart) {
            return new InitState(undefined, debugInfo);
        }
        else if (type === EventType.Pull) {
            return new PullState(this.state.initDocState, debugInfo);
        }
        else if (type === EventType.Fatal) {
            return new FatalState({ message: event.payload.message, errorCode: event.payload.errorCode }, debugInfo);
        }
        else {
            console.debug('@bangle.dev/collab-client Ignoring event' + type);
            return;
        }
    }
}
const handleErrorStateAction = async ({ clientInfo, view, logger, signal, collabState, }) => {
    if (signal.aborted) {
        return;
    }
    const failure = collabState.state.failure;
    logger('Handling failure=', failure, 'currentState=', collabState.name);
    const debugSource = `pushPullErrorStateAction(${failure}):`;
    if (isStuckInErrorStates()(view.state)) {
        collabState.dispatch(signal, view.state, view.dispatch, {
            type: EventType.Fatal,
            payload: {
                message: 'Stuck in error loop, last failure: ' + failure,
                errorCode: FatalErrorCode.StuckInInfiniteLoop,
            },
        }, debugSource);
        return;
    }
    switch (failure) {
        case CollabFail.InvalidVersion: {
            abortableSetTimeout(() => {
                if (!signal.aborted) {
                    collabState.dispatch(signal, view.state, view.dispatch, {
                        type: EventType.Restart,
                    }, debugSource);
                }
            }, signal, clientInfo.cooldownTime);
            return;
        }
        case CollabFail.IncorrectManager: {
            collabState.dispatch(signal, view.state, view.dispatch, {
                type: EventType.Fatal,
                payload: {
                    message: 'Incorrect manager',
                    errorCode: FatalErrorCode.IncorrectManager,
                },
            }, debugSource);
            return;
        }
        case CollabFail.HistoryNotAvailable: {
            collabState.dispatch(signal, view.state, view.dispatch, {
                type: EventType.Fatal,
                payload: {
                    message: 'History/Server not available',
                    errorCode: FatalErrorCode.HistoryNotAvailable,
                },
            }, debugSource);
            return;
        }
        case CollabFail.DocumentNotFound: {
            logger('Document not found');
            collabState.dispatch(signal, view.state, view.dispatch, {
                type: EventType.Fatal,
                payload: {
                    message: 'Document not found',
                    errorCode: FatalErrorCode.DocumentNotFound,
                },
            }, debugSource);
            return;
        }
        // 409
        case CollabFail.OutdatedVersion: {
            if (collabState instanceof PushPullErrorState) {
                collabState.dispatch(signal, view.state, view.dispatch, {
                    type: EventType.Pull,
                }, debugSource);
            }
            else {
                collabState.dispatch(signal, view.state, view.dispatch, {
                    type: EventType.Fatal,
                    payload: {
                        message: `Cannot handle ${failure} in state=${collabState.name}`,
                        // TODO: is this the right error code?
                        errorCode: FatalErrorCode.UnexpectedState,
                    },
                }, debugSource);
            }
            return;
        }
        // 500
        case CollabFail.ManagerDestroyed: {
            abortableSetTimeout(() => {
                if (!signal.aborted) {
                    if (collabState instanceof PushPullErrorState) {
                        collabState.dispatch(signal, view.state, view.dispatch, {
                            type: EventType.Pull,
                        }, debugSource);
                    }
                    else if (collabState instanceof InitErrorState) {
                        collabState.dispatch(signal, view.state, view.dispatch, {
                            type: EventType.Restart,
                        }, debugSource);
                    }
                    else ;
                }
            }, signal, clientInfo.cooldownTime);
            return;
        }
        case CollabFail.ApplyFailed: {
            if (collabState instanceof PushPullErrorState) {
                abortableSetTimeout(() => {
                    if (!signal.aborted) {
                        collabState.dispatch(signal, view.state, view.dispatch, {
                            type: EventType.Pull,
                        }, debugSource);
                    }
                }, signal, clientInfo.cooldownTime);
            }
            else {
                collabState.dispatch(signal, view.state, view.dispatch, {
                    type: EventType.Fatal,
                    payload: {
                        message: `Cannot handle ${failure} in state=${collabState.name}`,
                        errorCode: FatalErrorCode.UnexpectedState,
                    },
                }, debugSource);
            }
            return;
        }
        case CollabFail.ManagerUnresponsive: {
            abortableSetTimeout(() => {
                if (!signal.aborted) {
                    if (collabState instanceof PushPullErrorState) {
                        collabState.dispatch(signal, view.state, view.dispatch, {
                            type: EventType.Pull,
                        }, debugSource);
                    }
                    else if (collabState instanceof InitErrorState) {
                        collabState.dispatch(signal, view.state, view.dispatch, {
                            type: EventType.Restart,
                        }, debugSource);
                    }
                    else ;
                }
            }, signal, clientInfo.cooldownTime);
            return;
        }
        default: {
            throw new Error(`Unknown failure ${failure}`);
        }
    }
};

const LOG = true;
let log = (isTestEnv ? false : LOG)
    ? console.debug.bind(console, `collab-client:`)
    : () => { };
const collabMonitorInitialState = {
    serverVersion: undefined,
};
const INFINITE_TRANSITION_SAMPLE = 500;
const INFINITE_TRANSITION_THRESHOLD_TIME = 1000;
function collabClientPlugin({ requestTimeout, clientID, collabMessageBus, docName, managerId, cooldownTime, userId, warmupTime, }) {
    const logger = (state) => (...args) => {
        var _a;
        return log(`${clientID}:version=${getVersion(state)}:debugInfo=${(_a = collabClientKey.getState(state)) === null || _a === void 0 ? void 0 : _a.collabState.debugInfo}`, ...args);
    };
    return [
        new Plugin({
            key: collabClientKey,
            filterTransaction(tr, state) {
                var _a;
                // Do not block collab plugins' transactions
                if (tr.getMeta(collabClientKey) ||
                    tr.getMeta(collabMonitorKey) ||
                    tr.getMeta('bangle.dev/isRemote')) {
                    return true;
                }
                // prevent any other tr while state is in one of the no-edit state
                if (tr.docChanged && ((_a = getCollabState(state)) === null || _a === void 0 ? void 0 : _a.isEditingBlocked) === true) {
                    console.debug('@bangle.dev/collab-client blocking transaction');
                    return false;
                }
                return true;
            },
            state: {
                init() {
                    return {
                        collabState: new InitState(),
                        previousStates: [],
                        infiniteTransitionGuard: { counter: 0, lastChecked: 0 },
                    };
                },
                apply(tr, value, oldState, newState) {
                    const meta = tr.getMeta(collabClientKey);
                    if (meta === undefined || !meta.collabEvent) {
                        return value;
                    }
                    // By pass any logic, if we receive this event and set the state to Init
                    if (meta.collabEvent.type === EventType.HardReset) {
                        logger(newState)('apply state HARD RESET, newStateName=', CollabStateName.Init, 'oldStateName=', value.collabState.name);
                        return {
                            collabState: new InitState(undefined, '(HardReset)'),
                            previousStates: [],
                            infiniteTransitionGuard: { counter: 0, lastChecked: 0 },
                        };
                    }
                    value.infiniteTransitionGuard.counter++;
                    // A guard to prevent infinite transitions in case of a bug
                    if (value.infiniteTransitionGuard.counter %
                        INFINITE_TRANSITION_SAMPLE ===
                        0) {
                        if (Date.now() - value.infiniteTransitionGuard.lastChecked <=
                            INFINITE_TRANSITION_THRESHOLD_TIME) {
                            queueMicrotask(() => {
                                throw new Error('Stuck in infinite transitions. Last few states: ' +
                                    value.previousStates
                                        .map((s) => s.name + (s.debugInfo ? `:${s.debugInfo}` : ''))
                                        .join(', ')
                                        .slice(0, 5));
                            });
                            return {
                                collabState: new FatalState({
                                    message: 'Infinite transitions',
                                    errorCode: FatalErrorCode.StuckInInfiniteLoop,
                                }, '(stuck in infinite transitions)'),
                                previousStates: [value.collabState, ...value.previousStates],
                                infiniteTransitionGuard: { counter: 0, lastChecked: 0 },
                            };
                        }
                        value.infiniteTransitionGuard.lastChecked = Date.now();
                        value.infiniteTransitionGuard.counter = 0;
                    }
                    const newCollabState = value.collabState.transition(meta.collabEvent, meta.debugInfo);
                    if (!newCollabState) {
                        return value;
                    }
                    if (newCollabState.name !== value.collabState.name) {
                        logger(newState)('apply state, newStateName=', newCollabState.name, `debugInfo=${newCollabState.debugInfo}`, 'oldStateName=', value.collabState.name);
                        let previousStates = [value.collabState, ...value.previousStates];
                        if (previousStates.length > MAX_STATES_TO_KEEP) {
                            previousStates = previousStates.slice(0, MAX_STATES_TO_KEEP);
                        }
                        return {
                            ...value,
                            collabState: newCollabState,
                            previousStates: previousStates,
                        };
                    }
                    logger(newState)(`applyState IGNORE EVENT ${meta.collabEvent.type} due to self transition`, `debugInfo=${meta.debugInfo}`);
                    return value;
                },
            },
            view(view) {
                let actionController = new AbortController();
                let clientComController = new AbortController();
                let clientCom = new ClientCommunication({
                    clientId: clientID,
                    managerId,
                    docName,
                    messageBus: collabMessageBus,
                    signal: clientComController.signal,
                    requestTimeout: requestTimeout,
                    onNewVersion: ({ version }) => {
                        updateServerVersion(version)(view.state, view.dispatch);
                    },
                    onResetClient() {
                        hardResetClient()(view.state, view.dispatch);
                    },
                });
                const pluginState = collabClientKey.getState(view.state);
                const clientInfo = {
                    clientID,
                    docName,
                    cooldownTime,
                    clientCom,
                    managerId,
                    userId,
                    warmupTime,
                };
                if (pluginState) {
                    pluginState.collabState.runAction({
                        clientInfo,
                        view,
                        signal: actionController.signal,
                        logger: logger(view.state),
                    });
                }
                return {
                    destroy() {
                        actionController.abort();
                        clientComController.abort();
                    },
                    update(view, prevState) {
                        var _a;
                        const pluginState = collabClientKey.getState(view.state);
                        // ignore running actions if collab state didn't change
                        if ((pluginState === null || pluginState === void 0 ? void 0 : pluginState.collabState) ===
                            ((_a = collabClientKey.getState(prevState)) === null || _a === void 0 ? void 0 : _a.collabState)) {
                            return;
                        }
                        if (pluginState) {
                            actionController.abort();
                            actionController = new AbortController();
                            pluginState.collabState.runAction({
                                clientInfo,
                                view,
                                signal: actionController.signal,
                                logger: logger(view.state),
                            });
                        }
                    },
                };
            },
        }),
        new Plugin({
            key: collabMonitorKey,
            props: {
                attributes: (state) => {
                    var _a;
                    const editingBlocked = (_a = getCollabState(state)) === null || _a === void 0 ? void 0 : _a.isEditingBlocked;
                    return {
                        class: editingBlocked
                            ? 'bangle-collab-frozen'
                            : 'bangle-collab-active',
                    };
                },
            },
            state: {
                init: (_, _state) => {
                    return collabMonitorInitialState;
                },
                apply: (tr, value, oldState, newState) => {
                    var _a;
                    const meta = tr.getMeta(collabMonitorKey);
                    if (meta) {
                        logger(newState)('collabMonitorKey received tr', meta);
                        return {
                            ...value,
                            ...meta,
                        };
                    }
                    // Reset collab monitors state if collab state is restarted
                    if (((_a = getCollabState(newState)) === null || _a === void 0 ? void 0 : _a.name) === CollabStateName.Init) {
                        return collabMonitorInitialState;
                    }
                    return value;
                },
            },
            view(view) {
                const check = (view) => {
                    // There are two ways different ways this extension keeps a check on outdated version (aka - needs to pull)
                    // and sendable steps (needs to push):
                    // 1. the ready state action which gets triggered when collabClientKey plugin transitions
                    //    to the ready state.
                    // 2. this plugin (collabMonitorKey) which runs `check` every time the view is updated and
                    //    checks if we need a push or pull.
                    // outdated version gets a priority over local changes
                    if (isOutdatedVersion()(view.state)) {
                        onOutdatedVersion()(view.state, view.dispatch);
                    }
                    // If there are sendable steps to send to server
                    else if (sendableSteps(view.state)) {
                        onLocalChanges()(view.state, view.dispatch);
                    }
                };
                check(view);
                return {
                    update(view) {
                        check(view);
                    },
                };
            },
        }),
    ];
}

const plugins = pluginsFactory;
const commands = { queryFatalError, hardResetClient, queryCollabState };
/**
 *
 * @param param0
 * @param param0.requestTimeout - timeout for the requests to the server.
 * @param param0.cooldownTime - time to wait before retrying after failure.
 * @param param0.warmupTime - time to wait before starting the collab session. Use this to avoid a bunch
 *                            of redundant getDocument request if you editor state
 *                            is modified a bunch of time on startup.
 */
function pluginsFactory({ requestTimeout, clientID = 'client-' + uuid(), collabMessageBus, docName, managerId = DEFAULT_MANAGER_ID, cooldownTime = 100, warmupTime = 0, }) {
    const userId = 'user-' + clientID;
    return [
        collab({
            clientID,
        }),
        collabClientPlugin({
            requestTimeout,
            clientID,
            collabMessageBus,
            docName,
            managerId,
            cooldownTime,
            userId,
            warmupTime,
        }),
    ];
}

var collabExtension = /*#__PURE__*/Object.freeze({
    __proto__: null,
    plugins: plugins,
    commands: commands
});

export { collabExtension as collabClient };
