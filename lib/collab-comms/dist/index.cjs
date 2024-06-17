'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

exports.MessageType = void 0;
(function (MessageType) {
    MessageType["PING"] = "PING";
    MessageType["PONG"] = "PONG";
    MessageType["BROADCAST"] = "BROADCAST";
})(exports.MessageType || (exports.MessageType = {}));
class CollabMessageBus {
    constructor(_opts = {}) {
        this._opts = _opts;
        this._destroyed = false;
        this._listeners = new Map();
        this._seenMessages = new WeakSet();
    }
    destroy(name) {
        if (name == null) {
            this._listeners.clear();
        }
        else {
            this._listeners.delete(name);
        }
        this._destroyed = true;
    }
    // if name is WILD_CARD, then it will receive every message irrespective of the `to` field.
    receiveMessages(name, callback) {
        if (this._destroyed) {
            return () => { };
        }
        let listeners = this._listeners.get(name);
        if (!listeners) {
            listeners = new Set();
            this._listeners.set(name, listeners);
        }
        listeners.add(callback);
        return () => {
            const listeners = this._listeners.get(name);
            listeners === null || listeners === void 0 ? void 0 : listeners.delete(callback);
            if ((listeners === null || listeners === void 0 ? void 0 : listeners.size) === 0) {
                this._listeners.delete(name);
            }
        };
    }
    // receive messages that specify the give `name` in the `to` field.
    transmit(message) {
        var _a, _b;
        // ignore message if it has already been seen
        if (this._seenMessages.has(message)) {
            return;
        }
        if (((_b = (_a = this._opts).debugFilterMessage) === null || _b === void 0 ? void 0 : _b.call(_a, message)) === false) {
            return;
        }
        this._seenMessages.add(message);
        if (message.type === exports.MessageType.BROADCAST && message.to != null) {
            throw new Error('Broadcast message must not have a `to` field');
        }
        if (typeof message.to !== 'string' &&
            // @ts-expect-error
            (message.type === exports.MessageType.PING || message.type === exports.MessageType.PONG)) {
            throw new Error('PING/PONG message must have a `to` field');
        }
        const _transmit = () => {
            var _a;
            let targetListeners = message.to
                ? this._listeners.get(message.to) || new Set()
                : // if there is no `to` field, then it is a broadcast to all.
                    // Using a set to prevent duplicates firing of broadcast if same listener is attached
                    // to multiple `to`s.
                    new Set([...this._listeners.values()].flatMap((r) => [...r]));
            // Add listeners which listen to any message
            let wildcardListeners = this._listeners.get(CollabMessageBus.WILD_CARD) || new Set();
            // Remove duplicate listeners - a listener should only receive a message once
            (_a = new Set([...wildcardListeners, ...targetListeners])) === null || _a === void 0 ? void 0 : _a.forEach((listener) => {
                listener(message);
            });
        };
        if (this._opts.debugSlowdown == null) {
            _transmit();
        }
        else {
            setTimeout(_transmit, this._opts.debugSlowdown);
        }
    }
}
CollabMessageBus.WILD_CARD = Symbol('WILD_CARD');

// This is the default value if one it not specified by the consumer.
const DEFAULT_MANAGER_ID = '@bangle.dev/collab-manager/MANAGER';
exports.NetworkingError = void 0;
(function (NetworkingError) {
    NetworkingError["Timeout"] = "NetworkingError.Timeout";
})(exports.NetworkingError || (exports.NetworkingError = {}));
exports.CollabManagerBroadCastType = void 0;
(function (CollabManagerBroadCastType) {
    CollabManagerBroadCastType["NewVersion"] = "CollabManagerBroadCastType.NewVersion";
    CollabManagerBroadCastType["ResetClient"] = "CollabManagerBroadCastType.ResetClient";
})(exports.CollabManagerBroadCastType || (exports.CollabManagerBroadCastType = {}));
exports.CollabFail = void 0;
(function (CollabFail) {
    CollabFail["ApplyFailed"] = "CollabFail.ApplyFailed";
    CollabFail["DocumentNotFound"] = "CollabFail.DocumentNotFound";
    CollabFail["HistoryNotAvailable"] = "CollabFail.HistoryNotAvailable";
    CollabFail["IncorrectManager"] = "CollabFail.IncorrectManager";
    CollabFail["InvalidVersion"] = "CollabFail.InvalidVersion";
    CollabFail["ManagerDestroyed"] = "CollabFail.ManagerDestroyed";
    CollabFail["OutdatedVersion"] = "CollabFail.OutdatedVersion";
    CollabFail["ManagerUnresponsive"] = "CollabFail.ManagerUnresponsive";
})(exports.CollabFail || (exports.CollabFail = {}));
exports.CollabClientRequestType = void 0;
(function (CollabClientRequestType) {
    CollabClientRequestType["GetDocument"] = "CollabClientRequestType.GetDocument";
    CollabClientRequestType["PullEvents"] = "CollabClientRequestType.PullEvents";
    CollabClientRequestType["PushEvents"] = "CollabClientRequestType.PushEvents";
})(exports.CollabClientRequestType || (exports.CollabClientRequestType = {}));

const DEFAULT_TIMEOUT = 1000;
// wraps the message in a request form - ie sends the message and waits for a response
// if it doesn't get any response within the `requestTimeout`, rejects with a  NetworkingError.Timeout
function wrapRequest(payload, { emitter, to, from, requestTimeout = DEFAULT_TIMEOUT, }) {
    return new Promise((res, rej) => {
        const id = generateUUID();
        // NOTE: the field `id` of a PONG message will be the same as the PING message
        const removeListener = emitter.receiveMessages(from, (message) => {
            if (message.type !== exports.MessageType.PONG || message.id !== id) {
                return;
            }
            clearTimeout(timer);
            removeListener();
            return res(message.messageBody);
        });
        const timer = setTimeout(() => {
            removeListener();
            rej(new Error(exports.NetworkingError.Timeout));
        }, requestTimeout);
        emitter.transmit({
            to,
            from,
            id,
            messageBody: payload,
            type: exports.MessageType.PING,
        });
    });
}
function generateUUID() {
    return (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16) +
        '-' +
        Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16) +
        '-' +
        Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16));
}

class ClientCommunication {
    constructor(_opts) {
        var _a;
        this._opts = _opts;
        this.getDocument = (body) => {
            let request = {
                type: exports.CollabClientRequestType.GetDocument,
                body,
            };
            return this._wrapRequest(exports.CollabClientRequestType.GetDocument, request);
        };
        this.pullEvents = (body) => {
            const request = {
                type: exports.CollabClientRequestType.PullEvents,
                body,
            };
            return this._wrapRequest(exports.CollabClientRequestType.PullEvents, request);
        };
        this.pushEvents = (body) => {
            const request = {
                type: exports.CollabClientRequestType.PushEvents,
                body,
            };
            return this._wrapRequest(exports.CollabClientRequestType.PushEvents, request);
        };
        this.managerId = this._opts.managerId;
        const removeListener = (_a = this._opts.messageBus) === null || _a === void 0 ? void 0 : _a.receiveMessages(this._opts.clientId, (message) => {
            if (message.type !== exports.MessageType.BROADCAST &&
                message.from !== this.managerId) {
                return;
            }
            const messageBody = message.messageBody;
            const { type } = messageBody;
            // ignore any message that is not for the current doc
            if (messageBody.body.docName !== this._opts.docName) {
                return;
            }
            switch (type) {
                case exports.CollabManagerBroadCastType.NewVersion: {
                    this._opts.onNewVersion(messageBody.body);
                    return;
                }
                case exports.CollabManagerBroadCastType.ResetClient: {
                    this._opts.onResetClient(messageBody.body);
                    return;
                }
                default: {
                    throw new Error(`Unknown message type: ${type}`);
                }
            }
        });
        this._opts.signal.addEventListener('abort', () => {
            removeListener();
        }, { once: true });
    }
    async _wrapRequest(type, request) {
        try {
            return (await wrapRequest(request, {
                from: this._opts.clientId,
                to: this.managerId,
                emitter: this._opts.messageBus,
                requestTimeout: this._opts.requestTimeout,
            }));
        }
        catch (error) {
            if (error instanceof Error) {
                const message = error.message;
                switch (message) {
                    case exports.NetworkingError.Timeout: {
                        return {
                            body: exports.CollabFail.ManagerUnresponsive,
                            type,
                            ok: false,
                        };
                    }
                    default: {
                        throw error;
                    }
                }
            }
            throw error;
        }
    }
}

class ManagerCommunication {
    constructor(managerId, _collabMessageBus, handleRequest, signal) {
        this.managerId = managerId;
        this._collabMessageBus = _collabMessageBus;
        const removeListener = this._collabMessageBus.receiveMessages(managerId, async (message) => {
            // handle only PING message
            // since manager needs to respond them: PING -> PONG
            if (message.type !== exports.MessageType.PING) {
                return;
            }
            const { id, messageBody } = message;
            let requestBody = messageBody || {};
            switch (requestBody.type) {
                case exports.CollabClientRequestType.GetDocument:
                case exports.CollabClientRequestType.PullEvents:
                case exports.CollabClientRequestType.PushEvents: {
                    // TODO handle error
                    let response = await handleRequest(requestBody, id);
                    this._collabMessageBus.transmit({
                        from: managerId,
                        to: message.from,
                        type: exports.MessageType.PONG,
                        id: id,
                        messageBody: response,
                    });
                    break;
                }
            }
        });
        signal.addEventListener('abort', () => {
            removeListener();
        }, { once: true });
    }
    broadcast(messageBody) {
        this._collabMessageBus.transmit({
            from: this.managerId,
            to: undefined,
            type: exports.MessageType.BROADCAST,
            id: generateUUID(),
            messageBody: messageBody,
        });
    }
}

exports.ClientCommunication = ClientCommunication;
exports.CollabMessageBus = CollabMessageBus;
exports.DEFAULT_MANAGER_ID = DEFAULT_MANAGER_ID;
exports.ManagerCommunication = ManagerCommunication;
