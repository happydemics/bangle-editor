import { CollabFail, ClientCommunication, CollabMessageBus } from '@bangle.dev/collab-comms';
import { EditorState, EditorView, Node, TextSelection, Command, Plugin } from '@bangle.dev/pm';

interface ActionParam {
    clientInfo: ClientInfo;
    logger: (...args: any[]) => void;
    signal: AbortSignal;
    view: EditorView;
}
type ValidCollabState = FatalState | InitDocState | InitErrorState | InitState | PullState | PushPullErrorState | PushState | ReadyState;
declare abstract class CollabBaseState {
    isEditingBlocked: boolean;
    isTaggedError: boolean;
    debugInfo?: string;
    createdAt: number;
    dispatchCollabPluginEvent(data: {
        signal: AbortSignal;
        collabEvent?: ValidEvents;
        debugInfo?: string;
    }): Command;
    isFatalState(): this is FatalState;
    isReadyState(): this is ReadyState;
    abstract name: CollabStateName;
    abstract runAction(param: ActionParam): Promise<void>;
    abstract transition(event: ValidEvents, debugInfo?: string): ValidCollabState | undefined;
}
declare class FatalState extends CollabBaseState {
    state: {
        message: string;
        errorCode: FatalErrorCode | undefined;
    };
    debugInfo?: string | undefined;
    isEditingBlocked: boolean;
    isTaggedError: boolean;
    name: CollabStateName;
    constructor(state: {
        message: string;
        errorCode: FatalErrorCode | undefined;
    }, debugInfo?: string | undefined);
    dispatch(signal: AbortSignal, state: EditorState, dispatch: EditorView['dispatch'] | undefined, event: never, debugInfo?: string): boolean;
    runAction({ signal, clientInfo, logger }: ActionParam): Promise<void>;
    transition(event: any, debugInfo?: string): this;
}
declare class InitState extends CollabBaseState {
    state: {};
    debugInfo?: string | undefined;
    isEditingBlocked: boolean;
    name: CollabStateName;
    clientCreatedAt: number;
    constructor(state?: {}, debugInfo?: string | undefined);
    dispatch(signal: AbortSignal, state: EditorState, dispatch: EditorView['dispatch'] | undefined, event: Parameters<InitState['transition']>[0], debugInfo?: string): boolean;
    runAction({ clientInfo, signal, view }: ActionParam): Promise<void>;
    transition(event: InitDocEvent | InitErrorEvent, debugInfo?: string): InitDocState | InitErrorState | undefined;
}
declare class InitDocState extends CollabBaseState {
    state: {
        initialDoc: Node;
        initialVersion: number;
        initialSelection?: TextSelection;
        managerId: string;
        clientCreatedAt: number;
    };
    debugInfo?: string | undefined;
    isEditingBlocked: boolean;
    name: CollabStateName;
    constructor(state: {
        initialDoc: Node;
        initialVersion: number;
        initialSelection?: TextSelection;
        managerId: string;
        clientCreatedAt: number;
    }, debugInfo?: string | undefined);
    dispatch(signal: AbortSignal, state: EditorState, dispatch: EditorView['dispatch'] | undefined, event: Parameters<InitDocState['transition']>[0], debugInfo?: string): boolean;
    runAction({ signal, view }: ActionParam): Promise<void>;
    transition(event: ReadyEvent | FatalEvent, debugInfo?: string): ReadyState | FatalState | undefined;
}
declare class InitErrorState extends CollabBaseState {
    state: {
        failure: CollabFail;
    };
    debugInfo?: string | undefined;
    isEditingBlocked: boolean;
    isTaggedError: boolean;
    name: CollabStateName;
    constructor(state: {
        failure: CollabFail;
    }, debugInfo?: string | undefined);
    dispatch(signal: AbortSignal, state: EditorState, dispatch: EditorView['dispatch'] | undefined, event: Parameters<InitErrorState['transition']>[0], debugInfo?: string): boolean;
    runAction(param: ActionParam): Promise<void>;
    transition(event: RestartEvent | FatalEvent, debugInfo?: string): FatalState | InitState | undefined;
}
declare class ReadyState extends CollabBaseState {
    state: InitDocState['state'];
    debugInfo?: string | undefined;
    name: CollabStateName;
    constructor(state: InitDocState['state'], debugInfo?: string | undefined);
    dispatch(signal: AbortSignal, state: EditorState, dispatch: EditorView['dispatch'] | undefined, event: PullEvent | PushEvent, debugInfo?: string): boolean;
    runAction({ signal, view }: ActionParam): Promise<void>;
    transition(event: Parameters<ReadyState['dispatch']>[3], debugInfo?: string): PullState | PushState | undefined;
}
declare class PushState extends CollabBaseState {
    state: InitDocState['state'];
    debugInfo?: string | undefined;
    name: CollabStateName;
    constructor(state: InitDocState['state'], debugInfo?: string | undefined);
    dispatch(signal: AbortSignal, state: EditorState, dispatch: EditorView['dispatch'] | undefined, event: Parameters<PushState['transition']>[0], debugInfo?: string): boolean;
    runAction({ clientInfo, signal, view }: ActionParam): Promise<void>;
    transition(event: ReadyEvent | PullEvent | PushPullErrorEvent, debugInfo?: string): PullState | PushPullErrorState | ReadyState | undefined;
}
declare class PullState extends CollabBaseState {
    state: InitDocState['state'];
    debugInfo?: string | undefined;
    name: CollabStateName;
    constructor(state: InitDocState['state'], debugInfo?: string | undefined);
    dispatch(signal: AbortSignal, state: EditorState, dispatch: EditorView['dispatch'] | undefined, event: Parameters<PullState['transition']>[0], debugInfo?: string): boolean;
    runAction({ clientInfo, logger, signal, view }: ActionParam): Promise<void>;
    transition(event: ReadyEvent | PushPullErrorEvent, debugInfo?: string): PushPullErrorState | ReadyState | undefined;
}
declare class PushPullErrorState extends CollabBaseState {
    state: {
        failure: CollabFail;
        initDocState: InitDocState['state'];
    };
    debugInfo?: string | undefined;
    isTaggedError: boolean;
    name: CollabStateName;
    constructor(state: {
        failure: CollabFail;
        initDocState: InitDocState['state'];
    }, debugInfo?: string | undefined);
    dispatch(signal: AbortSignal, state: EditorState, dispatch: EditorView['dispatch'] | undefined, event: Parameters<PushPullErrorState['transition']>[0], debugInfo?: string): boolean;
    runAction(param: ActionParam): Promise<void>;
    transition(event: RestartEvent | PullEvent | FatalEvent, debugInfo?: string): FatalState | InitState | PullState | undefined;
}

interface CollabMonitor {
    serverVersion: undefined | number;
}
type ValidEvents = FatalEvent | HardResetEvent | InitDocEvent | InitErrorEvent | PullEvent | PushEvent | PushPullErrorEvent | ReadyEvent | RestartEvent;
declare enum EventType {
    Fatal = "FATAL_EVENT",
    HardReset = "HARD_RESET_EVENT",
    InitDoc = "INIT_DOC_EVENT",
    InitError = "INIT_ERROR_EVENT",
    Pull = "PULL_EVENT",
    Push = "PUSH_EVENT",
    PushPullError = "PUSH_PULL_ERROR_EVENT",
    Ready = "READY_EVENT",
    Restart = "RESTART_EVENT"
}
declare enum FatalErrorCode {
    InitialDocLoadFailed = "INITIAL_DOC_LOAD_FAILED",
    StuckInInfiniteLoop = "STUCK_IN_INFINITE_LOOP",
    IncorrectManager = "INCORRECT_MANAGER",
    HistoryNotAvailable = "HISTORY_NOT_AVAILABLE",
    DocumentNotFound = "DOCUMENT_NOT_FOUND",
    UnexpectedState = "UNEXPECTED_STATE"
}
interface FatalEvent {
    type: EventType.Fatal;
    payload: {
        message: string;
        errorCode: FatalErrorCode;
    };
}
interface InitDocEvent {
    type: EventType.InitDoc;
    payload: {
        doc: Node;
        version: number;
        managerId: string;
        selection?: TextSelection;
    };
}
interface InitErrorEvent {
    type: EventType.InitError;
    payload: {
        failure: CollabFail;
    };
}
interface PushEvent {
    type: EventType.Push;
}
interface PullEvent {
    type: EventType.Pull;
}
interface PushPullErrorEvent {
    type: EventType.PushPullError;
    payload: {
        failure: CollabFail;
    };
}
interface ReadyEvent {
    type: EventType.Ready;
}
interface RestartEvent {
    type: EventType.Restart;
}
interface HardResetEvent {
    type: EventType.HardReset;
}
declare enum CollabStateName {
    Fatal = "FATAL_STATE",
    Init = "INIT_STATE",
    InitDoc = "INIT_DOC_STATE",
    InitError = "INIT_ERROR_STATE",
    Pull = "PULL_STATE",
    Push = "PUSH_STATE",
    PushPullError = "PUSH_PULL_ERROR_STATE",
    Ready = "READY_STATE"
}
interface CollabPluginState {
    collabState: ValidCollabState;
    previousStates: ValidCollabState[];
    infiniteTransitionGuard: {
        counter: number;
        lastChecked: number;
    };
}
interface ClientInfo {
    readonly clientCom: ClientCommunication;
    readonly clientID: string;
    readonly cooldownTime: number;
    readonly docName: string;
    readonly managerId: string;
    readonly userId: string;
    readonly warmupTime?: number;
}

/**
 * If in fatal state (a terminal state) and  returns the error information.
 * @returns
 */
declare function queryFatalError(): (state: EditorState) => {
    message: string;
    errorCode: FatalErrorCode | undefined;
} | undefined;
declare function queryCollabState(): (state: EditorState) => ValidCollabState | undefined;
declare function hardResetClient(): Command;

declare const plugins: typeof pluginsFactory;
declare const commands: {
    queryFatalError: typeof queryFatalError;
    hardResetClient: typeof hardResetClient;
    queryCollabState: typeof queryCollabState;
};
interface CollabExtensionOptions {
    requestTimeout?: number;
    clientID: string;
    collabMessageBus: CollabMessageBus;
    docName: string;
    managerId?: string;
    cooldownTime?: number;
    warmupTime?: number;
}
/**
 *
 * @param param0
 * @param param0.requestTimeout - timeout for the requests to the server.
 * @param param0.cooldownTime - time to wait before retrying after failure.
 * @param param0.warmupTime - time to wait before starting the collab session. Use this to avoid a bunch
 *                            of redundant getDocument request if you editor state
 *                            is modified a bunch of time on startup.
 */
declare function pluginsFactory({ requestTimeout, clientID, collabMessageBus, docName, managerId, cooldownTime, warmupTime, }: CollabExtensionOptions): (Plugin<any> | (Plugin<CollabPluginState> | Plugin<CollabMonitor>)[])[];

declare const collabExtension_d_plugins: typeof plugins;
declare const collabExtension_d_commands: typeof commands;
type collabExtension_d_CollabExtensionOptions = CollabExtensionOptions;
declare namespace collabExtension_d {
  export {
    collabExtension_d_plugins as plugins,
    collabExtension_d_commands as commands,
    collabExtension_d_CollabExtensionOptions as CollabExtensionOptions,
  };
}

export { CollabStateName, FatalErrorCode, ValidCollabState, collabExtension_d as collabClient };
