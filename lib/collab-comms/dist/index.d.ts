declare enum MessageType {
    PING = "PING",
    PONG = "PONG",
    BROADCAST = "BROADCAST"
}
type CollabListener<R> = (message: Message<R>) => void;
type Message<T> = {
    to: string;
    from: string;
    id: string;
    messageBody: T;
    type: MessageType.PING;
} | {
    to: string;
    from: string;
    id: string;
    messageBody: T;
    type: MessageType.PONG;
} | {
    to: undefined;
    from: string;
    id: string;
    messageBody: T;
    type: MessageType.BROADCAST;
};
type WildCard = (typeof CollabMessageBus)['WILD_CARD'];
declare class CollabMessageBus {
    private _opts;
    static WILD_CARD: symbol;
    private _destroyed;
    private _listeners;
    private _seenMessages;
    constructor(_opts?: {
        debugSlowdown?: number;
        debugFilterMessage?: (message: Message<any>) => boolean;
    });
    destroy(name?: string | WildCard): void;
    receiveMessages(name: string | WildCard, callback: CollabListener<any>): () => void;
    transmit<T>(message: Message<T>): void;
}

declare const DEFAULT_MANAGER_ID = "@bangle.dev/collab-manager/MANAGER";
declare enum NetworkingError {
    Timeout = "NetworkingError.Timeout"
}
declare enum CollabManagerBroadCastType {
    NewVersion = "CollabManagerBroadCastType.NewVersion",
    ResetClient = "CollabManagerBroadCastType.ResetClient"
}
interface CollabManagerNewVersion {
    type: CollabManagerBroadCastType.NewVersion;
    body: {
        version: number;
        docName: string;
    };
}
interface CollabManagerResetClient {
    type: CollabManagerBroadCastType.ResetClient;
    body: {
        docName: string;
    };
}
type CollabManagerBroadCast = CollabManagerNewVersion | CollabManagerResetClient;
declare enum CollabFail {
    ApplyFailed = "CollabFail.ApplyFailed",
    DocumentNotFound = "CollabFail.DocumentNotFound",
    HistoryNotAvailable = "CollabFail.HistoryNotAvailable",
    IncorrectManager = "CollabFail.IncorrectManager",
    InvalidVersion = "CollabFail.InvalidVersion",
    ManagerDestroyed = "CollabFail.ManagerDestroyed",
    OutdatedVersion = "CollabFail.OutdatedVersion",
    ManagerUnresponsive = "CollabFail.ManagerUnresponsive"
}
type CollabClientRequest = CollabClientRequestGetDocument | CollabClientRequestPullEvents | CollabClientRequestPushEvents;
declare enum CollabClientRequestType {
    GetDocument = "CollabClientRequestType.GetDocument",
    PullEvents = "CollabClientRequestType.PullEvents",
    PushEvents = "CollabClientRequestType.PushEvents"
}
interface CollabClientRequestGetDocument {
    type: CollabClientRequestType.GetDocument;
    request: {
        type: CollabClientRequestType.GetDocument;
        body: GetDocumentRequestBody;
    };
    response: RequestOkResponse<CollabClientRequestType.GetDocument, GetDocumentResponseBody> | RequestNotOkResponse<CollabClientRequestType.GetDocument, CollabFail>;
}
interface CollabClientRequestPullEvents {
    type: CollabClientRequestType.PullEvents;
    request: {
        type: CollabClientRequestType.PullEvents;
        body: PullEventsRequestBody;
    };
    response: RequestOkResponse<CollabClientRequestType.PullEvents, PullEventsResponseBody> | RequestNotOkResponse<CollabClientRequestType.PullEvents, CollabFail>;
}
interface CollabClientRequestPushEvents {
    type: CollabClientRequestType.PushEvents;
    request: {
        type: CollabClientRequestType.PushEvents;
        body: PushEventsRequestBody;
    };
    response: RequestOkResponse<CollabClientRequestType.PushEvents, PushEventsResponseBody> | RequestNotOkResponse<CollabClientRequestType.PushEvents, CollabFail>;
}
interface RequestOkResponse<T extends string, R> {
    type: T;
    ok: true;
    body: R;
}
interface RequestNotOkResponse<T extends string, R> {
    type: T;
    ok: false;
    body: R;
}
type GetDocumentRequestBody = {
    clientCreatedAt: number;
    docName: string;
    userId: string;
};
type GetDocumentResponseBody = {
    doc: {
        [key: string]: any;
    };
    version: number;
    users: number;
    managerId: string;
};
type PushEventsResponseBody = {
    empty: null;
};
type PushEventsRequestBody = {
    clientCreatedAt: number;
    clientID: string;
    docName: string;
    managerId: string;
    steps: Array<{
        [key: string]: any;
    }>;
    userId: string;
    version: number;
};
type PullEventsResponseBody = {
    steps?: Array<{
        [key: string]: any;
    }>;
    clientIDs?: string[];
    version: number;
};
type PullEventsRequestBody = {
    clientCreatedAt: number;
    docName: string;
    managerId: string;
    userId: string;
    version: number;
};

type MakeRequest<R extends CollabClientRequest> = (body: R['request']['body']) => Promise<R['response']>;
declare class ClientCommunication {
    private _opts;
    getDocument: MakeRequest<CollabClientRequestGetDocument>;
    pullEvents: MakeRequest<CollabClientRequestPullEvents>;
    pushEvents: MakeRequest<CollabClientRequestPushEvents>;
    managerId: string;
    constructor(_opts: {
        clientId: string;
        managerId: string;
        messageBus: CollabMessageBus;
        signal: AbortSignal;
        requestTimeout?: number;
        docName: string;
        onNewVersion: (body: CollabManagerNewVersion['body']) => void;
        onResetClient: (body: CollabManagerResetClient['body']) => void;
    });
    private _wrapRequest;
}

declare class ManagerCommunication {
    readonly managerId: string;
    private readonly _collabMessageBus;
    constructor(managerId: string, _collabMessageBus: CollabMessageBus, handleRequest: (body: CollabClientRequest['request'], uid?: string) => Promise<CollabClientRequest['response']>, signal: AbortSignal);
    broadcast(messageBody: CollabManagerBroadCast): void;
}

export { ClientCommunication, CollabClientRequest, CollabClientRequestGetDocument, CollabClientRequestPullEvents, CollabClientRequestPushEvents, CollabClientRequestType, CollabFail, CollabManagerBroadCastType, CollabMessageBus, DEFAULT_MANAGER_ID, GetDocumentResponseBody, ManagerCommunication, Message, MessageType, NetworkingError, PullEventsRequestBody, PullEventsResponseBody, PushEventsRequestBody, PushEventsResponseBody };
