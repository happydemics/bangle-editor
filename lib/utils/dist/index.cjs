'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pm = require('@bangle.dev/pm');
var prosemirrorUtilsBangle = require('prosemirror-utils-bangle');

const browser = {
    mac: false,
    ie: false,
    ie_version: 0,
    gecko: false,
    chrome: false,
    chrome_version: 0,
    android: false,
    ios: false,
    webkit: false,
};
if (typeof navigator !== 'undefined' && typeof document !== 'undefined') {
    const ieEdge = /Edge\/(\d+)/.exec(navigator.userAgent);
    const ieUpTo10 = /MSIE \d/.test(navigator.userAgent);
    const ie11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
    browser.mac = /Mac/.test(navigator.platform);
    let ie = (browser.ie = !!(ieUpTo10 || ie11up || ieEdge));
    browser.ie_version = ieUpTo10
        ? // @ts-ignore TS doesn't understand browser quirks
            document.documentMode || 6
        : ie11up
            ? +ie11up[1]
            : ieEdge
                ? +ieEdge[1]
                : null;
    browser.gecko = !ie && /gecko\/\d/i.test(navigator.userAgent);
    browser.chrome = !ie && /Chrome\//.test(navigator.userAgent);
    browser.chrome_version = parseInt((navigator.userAgent.match(/Chrome\/(\d{2})/) || [])[1] || '0', 10);
    browser.android = /Android \d/.test(navigator.userAgent);
    browser.ios =
        !ie &&
            /AppleWebKit/.test(navigator.userAgent) &&
            /Mobile\/\w+/.test(navigator.userAgent);
    browser.webkit =
        !ie &&
            !!document.documentElement &&
            'WebkitAppearance' in document.documentElement.style;
}
const isChromeWithSelectionBug = browser.chrome && !browser.android && browser.chrome_version >= 58;

// Copied from https://github.com/sindresorhus/mimic-fn/blob/main/index.js
// due to issues with their ESM bundling
const copyProperty = (to, from, property, ignoreNonConfigurable) => {
    // `Function#length` should reflect the parameters of `to` not `from` since we keep its body.
    // `Function#prototype` is non-writable and non-configurable so can never be modified.
    if (property === 'length' || property === 'prototype') {
        return;
    }
    // `Function#arguments` and `Function#caller` should not be copied. They were reported to be present in `Reflect.ownKeys` for some devices in React Native (#41), so we explicitly ignore them here.
    if (property === 'arguments' || property === 'caller') {
        return;
    }
    const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
    const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);
    if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
        return;
    }
    Object.defineProperty(to, property, fromDescriptor);
};
// `Object.defineProperty()` throws if the property exists, is not configurable and either:
// - one its descriptors is changed
// - it is non-writable and its value is changed
const canCopyProperty = function (toDescriptor, fromDescriptor) {
    return (toDescriptor === undefined ||
        toDescriptor.configurable ||
        (toDescriptor.writable === fromDescriptor.writable &&
            toDescriptor.enumerable === fromDescriptor.enumerable &&
            toDescriptor.configurable === fromDescriptor.configurable &&
            (toDescriptor.writable || toDescriptor.value === fromDescriptor.value)));
};
const changePrototype = (to, from) => {
    const fromPrototype = Object.getPrototypeOf(from);
    if (fromPrototype === Object.getPrototypeOf(to)) {
        return;
    }
    Object.setPrototypeOf(to, fromPrototype);
};
const wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/\n${fromBody}`;
const toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, 'toString');
const toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, 'name');
// We call `from.toString()` early (not lazily) to ensure `from` can be garbage collected.
// We use `bind()` instead of a closure for the same reason.
// Calling `from.toString()` early also allows caching it in case `to.toString()` is called several times.
const changeToString = (to, from, name) => {
    const withName = name === '' ? '' : `with ${name.trim()}() `;
    const newToString = wrappedToString.bind(null, withName, from.toString());
    // Ensure `to.toString.toString` is non-enumerable and has the same `same`
    Object.defineProperty(newToString, 'name', toStringName);
    Object.defineProperty(to, 'toString', {
        ...toStringDescriptor,
        value: newToString,
    });
};
function mimicFunction(to, from, { ignoreNonConfigurable = false } = {}) {
    const { name } = to;
    for (const property of Reflect.ownKeys(from)) {
        copyProperty(to, from, property, ignoreNonConfigurable);
    }
    changePrototype(to, from);
    changeToString(to, from, name);
    return to;
}

// copied from https://github.com/sindresorhus/debounce-fn
function debounceFn(inputFunction, options = {}) {
    if (typeof inputFunction !== 'function') {
        throw new TypeError(`Expected the first argument to be a function, got \`${typeof inputFunction}\``);
    }
    const { wait = 0, maxWait = Number.POSITIVE_INFINITY, before = false, after = true, } = options;
    if (!before && !after) {
        throw new Error("Both `before` and `after` are false, function wouldn't be called.");
    }
    let timeout;
    let maxTimeout;
    let result;
    const debouncedFunction = function (...arguments_) {
        const context = this;
        const later = () => {
            timeout = undefined;
            if (maxTimeout) {
                clearTimeout(maxTimeout);
                maxTimeout = undefined;
            }
            if (after) {
                result = inputFunction.apply(context, arguments_);
            }
        };
        const maxLater = () => {
            maxTimeout = undefined;
            if (timeout) {
                clearTimeout(timeout);
                timeout = undefined;
            }
            if (after) {
                result = inputFunction.apply(context, arguments_);
            }
        };
        const shouldCallNow = before && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (maxWait > 0 && maxWait !== Number.POSITIVE_INFINITY && !maxTimeout) {
            maxTimeout = setTimeout(maxLater, maxWait);
        }
        if (shouldCallNow) {
            result = inputFunction.apply(context, arguments_);
        }
        return result;
    };
    mimicFunction(debouncedFunction, inputFunction);
    debouncedFunction.cancel = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (maxTimeout) {
            clearTimeout(maxTimeout);
            maxTimeout = undefined;
        }
    };
    return debouncedFunction;
}

let nodeEnv = undefined;
// Done this way to allow for bundlers
// to do a string replace.
try {
    // @ts-ignore process is undefined unless we pull in @types/node
    // eslint-disable-next-line no-process-env
    nodeEnv = process.env.NODE_ENV;
}
catch (err) { }
const APP_ENV = nodeEnv;
const isProdEnv = nodeEnv === 'production';
const isTestEnv = nodeEnv === 'test';

function assertNotUndefined(value, message) {
    if (value === undefined) {
        throw new Error(`assertion failed: ${message}`);
    }
}
/**
 * @param {Function} fn - A unary function whose paramater is non-primitive,
 *                        so that it can be cached using WeakMap
 */
function weakCache(fn) {
    const cache = new WeakMap();
    return (arg) => {
        let value = cache.get(arg);
        if (value) {
            return value;
        }
        value = fn(arg);
        cache.set(arg, value);
        return value;
    };
}
// simple higher order compose
function compose(func, ...funcs) {
    const allFuncs = [func, ...funcs];
    return function composed(raw) {
        return allFuncs.reduceRight((prev, func) => func(prev), raw);
    };
}
class MatchType {
    constructor(start, end, match, _sourceString) {
        this.start = start;
        this.end = end;
        this.match = match;
        this._sourceString = _sourceString;
    }
    get subString() {
        return this._sourceString.slice(this.start, this.end);
    }
}
/**
 *
 * Returns an array of objects which contains a range of substring and whether it matched or didn't match.
 * Note: each item in this array will map 1:1 in order with the original string in a way
 *  such that following will always hold true:
 * ```
 * const result = matchAllPlus(regex, myStr);
 * result.reduce((a, b) => a + b.subString) === myStr
 * result.reduce((a, b) => a + b.slice(b.start, b.end)) === myStr
 * ```
 */
function matchAllPlus(regexp, str) {
    const result = [];
    let prevElementEnd = 0;
    let match;
    while ((match = regexp.exec(str))) {
        const curStart = match.index;
        const curEnd = curStart + match[0].length;
        if (prevElementEnd !== curStart) {
            result.push(new MatchType(prevElementEnd, curStart, false, str));
        }
        result.push(new MatchType(curStart, curEnd, true, str));
        prevElementEnd = curEnd;
    }
    if (result.length === 0) {
        return [new MatchType(0, str.length, false, str)];
    }
    const lastItemEnd = result[result.length - 1] && result[result.length - 1].end;
    if (lastItemEnd && lastItemEnd !== str.length) {
        result.push(new MatchType(lastItemEnd, str.length, false, str));
    }
    return result;
}
function uuid(len = 10) {
    return Math.random().toString(36).substring(2, 15).slice(0, len);
}
function abortableSetTimeout(callback, signal, ms) {
    const timer = setTimeout(callback, ms);
    signal.addEventListener('abort', () => {
        clearTimeout(timer);
    }, { once: true });
}
function getIdleCallback(cb) {
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
        return window.requestIdleCallback(cb);
    }
    var t = Date.now();
    return setTimeout(function () {
        cb({
            didTimeout: !1,
            timeRemaining: function () {
                return Math.max(0, 50 - (Date.now() - t));
            },
        });
    }, 1);
}
function cancelablePromise(promise) {
    let hasCanceled = false;
    const wrappedPromise = new Promise((resolve, reject) => promise
        .then((val) => hasCanceled ? reject({ isCanceled: true }) : resolve(val))
        .catch((error) => hasCanceled ? reject({ isCanceled: true }) : reject(error)));
    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled = true;
        },
    };
}
function sleep(t = 20) {
    return new Promise((res) => setTimeout(res, t));
}
function objectMapValues(obj, map) {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => {
        return [key, map(value, key)];
    }));
}
function objectFilter(obj, cb) {
    return Object.fromEntries(Object.entries(obj).filter(([key, value]) => {
        return cb(value, key);
    }));
}
/**
 * Creates an object from an array of [key, Value], filtering out any
 * undefined or null key
 */
function createObject(entries) {
    return Object.fromEntries(entries.filter((e) => e[0] != null));
}
function serialExecuteQueue() {
    let prev = Promise.resolve();
    return {
        add(cb) {
            return new Promise((resolve, reject) => {
                const run = async () => {
                    try {
                        const result = await cb();
                        return {
                            rejected: false,
                            value: result,
                        };
                    }
                    catch (e) {
                        return {
                            rejected: true,
                            value: e,
                        };
                    }
                };
                prev = prev.then(() => {
                    return run().then(({ value, rejected }) => {
                        if (rejected) {
                            reject(value);
                        }
                        else {
                            resolve(value);
                        }
                    });
                });
            });
        },
    };
}
function simpleLRU(size) {
    let array = [];
    let removeItems = () => {
        while (array.length > size) {
            array.shift();
        }
    };
    return {
        entries() {
            return array.slice(0);
        },
        remove(key) {
            array = array.filter((item) => item.key !== key);
        },
        clear() {
            array = [];
        },
        get(key) {
            let result = array.find((item) => item.key === key);
            if (result) {
                this.set(key, result.value); // put the item in the front
                return result.value;
            }
            return undefined;
        },
        set(key, value) {
            this.remove(key);
            array.push({ key, value });
            removeItems();
        },
    };
}
function domEventListener(element, type, listener, options) {
    element.addEventListener(type, listener, options);
    return () => {
        element.removeEventListener(type, listener, options);
    };
}
/**
 * Based on idea from https://github.com/alexreardon/raf-schd
 * Throttles the function and calls it with the latest argument
 */
function rafSchedule(fn) {
    let lastArgs = [];
    let frameId = null;
    const wrapperFn = (...args) => {
        // Always capture the latest value
        lastArgs = args;
        // There is already a frame queued
        if (frameId) {
            return;
        }
        // Schedule a new frame
        frameId = requestAnimationFrame(() => {
            frameId = null;
            fn(...lastArgs);
        });
    };
    // Adding cancel property to result function
    wrapperFn.cancel = () => {
        if (!frameId) {
            return;
        }
        cancelAnimationFrame(frameId);
        frameId = null;
    };
    return wrapperFn;
}
const bangleWarn = isTestEnv || isProdEnv
    ? () => { }
    : console.warn.bind(console, 'Warning in bangle.js:');

/**
 * Creates a bare bone `toDOM` and `parseDOM` handlers for the PM schema.
 * The use case is for nodes or marks who already have a nodeView
 * and want to get basic `toDOM`, `parseDOM` to enable drag n drop or
 * copy paste.
 *
 * @param {*} spec
 * @param {Object} opts
 * @param {string} opts.tag
 * @param {string|0|(node)=>string} opts.content - `0` signals content that PM will inject.
 * @param {string} opts.ignoreAttrs
 * @param {Number} opts.parsingPriority https://prosemirror.net/docs/ref/#model.ParseRule.priority
 */
function domSerializationHelpers(name, { tag = 'div', content, ignoreAttrs = [], parsingPriority = 51, } = {}) {
    const serializer = (node) => JSON.stringify(objectFilter(node.attrs || {}, (_value, key) => !ignoreAttrs.includes(key)));
    return {
        toDOM: (node) => {
            const domSpec = [
                tag,
                {
                    'data-bangle-name': name,
                    'data-bangle-attrs': serializer(node),
                },
            ];
            if (content !== undefined) {
                if (typeof content === 'function') {
                    domSpec.push(content(node));
                }
                else {
                    domSpec.push(content);
                }
            }
            return domSpec;
        },
        parseDOM: [
            {
                priority: parsingPriority,
                tag: `${tag}[data-bangle-name="${name}"]`,
                getAttrs: (dom) => {
                    const attrs = dom.getAttribute('data-bangle-attrs');
                    if (!attrs) {
                        return {};
                    }
                    return JSON.parse(attrs);
                },
            },
        ],
    };
}
function createElement(spec) {
    const { dom, contentDOM } = pm.DOMSerializer.renderSpec(window.document, spec);
    if (contentDOM) {
        throw new Error('createElement does not support creating contentDOM');
    }
    return dom;
}

// export enum MaybeType {
//   Just = 'just',
//   Nothing = 'nothing',
// }
// Note type of left cannot change to keep things simple.
class Either {
    static flatMap(either, rightFn) {
        if (Either.isLeft(either)) {
            return Either.left(either.left);
        }
        else if (Either.isRight(either)) {
            return rightFn(either.right, { left: Either.left });
        }
        throw new Error('Either.flatMap: unknown type');
    }
    static fold(either, 
    // To keep things simple, we don't allow changing the type of left.
    leftFn, rightFn) {
        if (Either.isLeft(either)) {
            return Either.left(leftFn(either.left));
        }
        else if (Either.isRight(either)) {
            return Either.right(rightFn(either.right));
        }
        throw new Error('Either.fold: unknown type');
    }
    static isLeft(either) {
        return either.type === 'left';
    }
    static isRight(either) {
        return either.type === 'right';
    }
    static left(value) {
        return { left: value, right: undefined, type: 'left' };
    }
    static map(either, rightFn) {
        return Either.fold(either, (left) => left, rightFn);
    }
    static mapLeft(either, leftFn) {
        return Either.fold(either, leftFn, (right) => right);
    }
    static right(value) {
        return {
            left: undefined,
            right: value,
            type: 'right',
        };
    }
    static unwrap(either) {
        if (Either.isLeft(either)) {
            return [either.left, undefined];
        }
        else if (Either.isRight(either)) {
            return [undefined, either.right];
        }
        throw new Error('Either.unwrap: unknown type');
    }
    static value(either) {
        if (Either.isLeft(either)) {
            return either.left;
        }
        else if (Either.isRight(either)) {
            return either.right;
        }
        throw new Error('Either.value: unknown type');
    }
}
// declare interface Either<L, R> {
//   map<R2>(f: (r: R) => R2): Either<L, R2>
//   leftMap<L2>(f: (l: L) => L2): Either<L2, R>
//   mapThen<R2>(f: (r: R) => Promise<R2>): Promise<Either<L, R2>>
//   leftMapThen<L2>(f: (l: L) => Promise<L2>): Promise<Either<L2, R>>
//   flatMap<R2>(f: (r: R) => Either<L, R2>): Either<L, R2>
//   leftFlatMap<L2>(f: (l: L) => Either<L2, R>): Either<L2, R>
//   flatMapThen<R2>(f: (r: R) => Promise<Either<L, R2>>): Promise<Either<L, R2>>
//   leftFlatMapThen<L2>(
//   	f: (l: L) => Promise<Either<L2, R>>): Promise<Either<L2, R>>
//   rightOrElse(f: (l: L) => R): R
//   value: L | R
//   isOk: boolean
// }

class Emitter {
    constructor() {
        this._callbacks = {};
        // Remove event listener for given event.
    }
    // If fn is not provided, all event listeners for that event will be removed.
    destroy() {
        this._callbacks = {};
    }
    emit(event, data) {
        const callbacks = this._callbacks[event];
        if (callbacks) {
            callbacks.forEach((callback) => callback(data));
        }
        return this;
    }
    // If neither is provided, all event listeners will be removed.
    off(event, fn) {
        if (!arguments.length) {
            this._callbacks = {};
        }
        else {
            // event listeners for the given event
            const callbacks = this._callbacks ? this._callbacks[event] : null;
            if (callbacks) {
                if (fn) {
                    this._callbacks[event] = callbacks.filter((cb) => cb !== fn);
                }
                else {
                    this._callbacks[event] = []; // remove all handlers
                }
            }
        }
        return this;
    }
    // Add an event listener for given event
    on(event, fn) {
        // Create namespace for this event
        if (!this._callbacks[event]) {
            this._callbacks[event] = [];
        }
        this._callbacks[event].push(fn);
        return this;
    }
}

function getMarksBetween(start, end, state) {
    let marks = [];
    state.doc.nodesBetween(start, end, (node, pos) => {
        marks = [
            ...marks,
            ...node.marks.map((mark) => ({
                start: pos,
                end: pos + node.nodeSize,
                mark,
            })),
        ];
    });
    return marks;
}
function markInputRule(regexp, markType) {
    return new pm.InputRule(regexp, (state, match, start, end) => {
        const { tr } = state;
        const m = match.length - 1;
        let markEnd = end;
        let markStart = start;
        const matchMths = match[m];
        const firstMatch = match[0];
        const mathOneBeforeM = match[m - 1];
        if (matchMths != null && firstMatch != null && mathOneBeforeM != null) {
            const matchStart = start + firstMatch.indexOf(mathOneBeforeM);
            const matchEnd = matchStart + mathOneBeforeM.length - 1;
            const textStart = matchStart + mathOneBeforeM.lastIndexOf(matchMths);
            const textEnd = textStart + matchMths.length;
            const excludedMarks = getMarksBetween(start, end, state)
                .filter((item) => {
                return item.mark.type.excludes(markType);
            })
                .filter((item) => item.end > matchStart);
            if (excludedMarks.length) {
                return null;
            }
            if (textEnd < matchEnd) {
                tr.delete(textEnd, matchEnd);
            }
            if (textStart > matchStart) {
                tr.delete(matchStart, textStart);
            }
            markStart = matchStart;
            markEnd = markStart + matchMths.length;
        }
        tr.addMark(markStart, markEnd, markType.create());
        tr.removeStoredMark(markType);
        return tr;
    });
}

function markPasteRule(regexp, type, getAttrs) {
    const handler = (fragment, parent) => {
        const nodes = [];
        fragment.forEach((child) => {
            if (child.isText) {
                const { text, marks } = child;
                let pos = 0;
                let match;
                const isLink = !!marks.filter((x) => x.type.name === 'link')[0];
                while (!isLink && (match = regexp.exec(text)) !== null) {
                    if (parent && parent.type.allowsMarkType(type) && match[1]) {
                        const start = match.index;
                        const end = start + match[0].length;
                        const textStart = start + match[0].indexOf(match[1]);
                        const textEnd = textStart + match[1].length;
                        const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
                        // adding text before markdown to nodes
                        if (start > 0) {
                            nodes.push(child.cut(pos, start));
                        }
                        // adding the markdown part to nodes
                        nodes.push(child
                            .cut(textStart, textEnd)
                            .mark(type.create(attrs).addToSet(child.marks)));
                        pos = end;
                    }
                }
                // adding rest of text to nodes
                if (pos < text.length) {
                    nodes.push(child.cut(pos));
                }
            }
            else {
                nodes.push(child.copy(handler(child.content, child)));
            }
        });
        return pm.Fragment.fromArray(nodes);
    };
    return new pm.Plugin({
        props: {
            transformPasted: (slice) => new pm.Slice(handler(slice.content), slice.openStart, slice.openEnd),
        },
    });
}

let counter = 0;
// add a unique string to prevent clashes in case multiple objectUid instances exist
// this can happen for example due to duplicate npm packages due to version or dependency mismatch
let unique = Math.random();
class ObjectUID extends WeakMap {
    get(obj) {
        let uid = super.get(obj);
        if (uid) {
            return uid;
        }
        uid = (counter++).toString() + '-' + unique;
        this.set(obj, uid);
        return uid;
    }
}
const objectUid = new ObjectUID();

class GapCursorSelection extends pm.Selection {
}
function rafCommandExec(view, command) {
    requestAnimationFrame(() => {
        command(view.state, view.dispatch, view);
    });
}
function filter(predicates, cmd) {
    return (state, dispatch, view) => {
        if (cmd == null) {
            return false;
        }
        if (!Array.isArray(predicates)) {
            predicates = [predicates];
        }
        if (predicates.some((pred) => !pred(state, view))) {
            return false;
        }
        return cmd(state, dispatch, view) || false;
    };
}
function isMarkActiveInSelection(type) {
    return (state) => {
        const { from, $from, to, empty } = state.selection;
        if (empty) {
            return Boolean(type.isInSet(state.tr.storedMarks || $from.marks()));
        }
        return Boolean(state.doc.rangeHasMark(from, to, type));
    };
}
const validPos = (pos, doc) => Number.isInteger(pos) && pos >= 0 && pos < doc.content.size;
const validListParent = (type, schemaNodes) => {
    const { bulletList, orderedList } = schemaNodes;
    return [bulletList, orderedList].includes(type);
};
// TODO document this, probably gets the attributes of the mark of the current selection
function getMarkAttrs(editorState, type) {
    const { from, to } = editorState.selection;
    let marks = [];
    editorState.doc.nodesBetween(from, to, (node) => {
        marks = [...marks, ...node.marks];
    });
    const mark = marks.find((markItem) => markItem.type.name === type.name);
    return mark ? mark.attrs : {};
}
function nodeIsActive(state, type, attrs = {}) {
    const predicate = (node) => node.type === type;
    const node = prosemirrorUtilsBangle.findSelectedNodeOfType(type)(state.selection) ||
        prosemirrorUtilsBangle.findParentNode(predicate)(state.selection);
    if (!Object.keys(attrs).length || !node) {
        return !!node;
    }
    return node.node.hasMarkup(type, { ...node.node.attrs, ...attrs });
}
// export function findChangedNodesFromTransaction(tr: Transaction) {
//   const nodes: Node[] = [];
//   const steps = tr.steps || [];
//   steps.forEach((step) => {
//     const { to, from, slice } = step;
//     const size = slice && slice.content ? slice.content.size : 0;
//     for (let i = from; i <= to + size; i++) {
//       if (i <= tr.doc.content.size) {
//         const topLevelNode = tr.doc.resolve(i).node(1);
//         if (topLevelNode && !nodes.find((n) => n === topLevelNode)) {
//           nodes.push(topLevelNode);
//         }
//       }
//     }
//   });
//   return nodes;
// }
/**
 * from atlaskit
 * Returns false if node contains only empty inline nodes and hardBreaks.
 */
function hasVisibleContent(node) {
    const isInlineNodeHasVisibleContent = (inlineNode) => {
        return inlineNode.isText
            ? !!inlineNode.textContent.trim()
            : inlineNode.type.name !== 'hardBreak';
    };
    if (node.isInline) {
        return isInlineNodeHasVisibleContent(node);
    }
    else if (node.isBlock && (node.isLeaf || node.isAtom)) {
        return true;
    }
    else if (!node.childCount) {
        return false;
    }
    for (let index = 0; index < node.childCount; index++) {
        const child = node.child(index);
        if (hasVisibleContent(child)) {
            return true;
        }
    }
    return false;
}
/**
 *  * from atlaskit
 * Checks if a node has any content. Ignores node that only contain empty block nodes.
 */
function isNodeEmpty(node) {
    if (node && node.textContent) {
        return false;
    }
    if (!node ||
        !node.childCount ||
        (node.childCount === 1 && isEmptyParagraph(node.firstChild))) {
        return true;
    }
    const block = [];
    const nonBlock = [];
    node.forEach((child) => {
        child.isInline ? nonBlock.push(child) : block.push(child);
    });
    return (!nonBlock.length &&
        !block.filter((childNode) => (!!childNode.childCount &&
            !(childNode.childCount === 1 &&
                isEmptyParagraph(childNode.firstChild))) ||
            childNode.isAtom).length);
}
/**
 * Checks if a node looks like an empty document
 */
function isEmptyDocument(node) {
    const nodeChild = node.content.firstChild;
    if (node.childCount !== 1 || !nodeChild) {
        return false;
    }
    return (nodeChild.type.name === 'paragraph' &&
        !nodeChild.childCount &&
        nodeChild.nodeSize === 2 &&
        (!nodeChild.marks || nodeChild.marks.length === 0));
}
/*
 * from atlaskit
 * Checks if node is an empty paragraph.
 */
function isEmptyParagraph(node) {
    return (!node ||
        (node.type.name === 'paragraph' && !node.textContent && !node.childCount));
}
// from atlaskit
// https://github.com/ProseMirror/prosemirror-commands/blob/master/bangle-play/commands.js#L90
// Keep going left up the tree, without going across isolating boundaries, until we
// can go along the tree at that same level
//
// You can think of this as, if you could construct each document like we do in the tests,
// return the position of the first ) backwards from the current selection.
function findCutBefore($pos) {
    // parent is non-isolating, so we can look across this boundary
    if (!$pos.parent.type.spec.isolating) {
        // search up the tree from the pos's *parent*
        for (let i = $pos.depth - 1; i >= 0; i--) {
            // starting from the inner most node's parent, find out
            // if we're not its first child
            if ($pos.index(i) > 0) {
                return $pos.doc.resolve($pos.before(i + 1));
            }
            if ($pos.node(i).type.spec.isolating) {
                break;
            }
        }
    }
    return null;
}
function isRangeOfType(doc, $from, $to, nodeType) {
    return (getAncestorNodesBetween(doc, $from, $to).filter((node) => node.type !== nodeType).length === 0);
}
/**
 * Returns all top-level ancestor-nodes between $from and $to
 */
function getAncestorNodesBetween(doc, $from, $to) {
    const nodes = [];
    const maxDepth = findAncestorPosition(doc, $from).depth;
    let current = doc.resolve($from.start(maxDepth));
    while (current.pos <= $to.start($to.depth)) {
        const depth = Math.min(current.depth, maxDepth);
        const node = current.node(depth);
        if (node) {
            nodes.push(node);
        }
        if (depth === 0) {
            break;
        }
        let next = doc.resolve(current.after(depth));
        if (next.start(depth) >= doc.nodeSize - 2) {
            break;
        }
        if (next.depth !== current.depth) {
            next = doc.resolve(next.pos + 2);
        }
        if (next.depth) {
            current = doc.resolve(next.start(next.depth));
        }
        else {
            current = doc.resolve(next.end(next.depth));
        }
    }
    return nodes;
}
/**
 * Traverse the document until an "ancestor" is found. Any nestable block can be an ancestor.
 */
function findAncestorPosition(doc, pos) {
    const nestableBlocks = ['blockquote', 'bulletList', 'orderedList'];
    if (pos.depth === 1) {
        return pos;
    }
    let node = pos.node(pos.depth);
    let newPos = pos;
    while (pos.depth >= 1) {
        pos = doc.resolve(pos.before(pos.depth));
        node = pos.node(pos.depth);
        if (node && nestableBlocks.indexOf(node.type.name) !== -1) {
            newPos = pos;
        }
    }
    return newPos;
}
const isEmptySelectionAtStart = (state) => {
    const { empty, $from } = state.selection;
    return (empty &&
        ($from.parentOffset === 0 || state.selection instanceof GapCursorSelection));
};
/**
 * Removes marks from nodes in the current selection that are not supported
 */
const sanitiseSelectionMarksForWrapping = (state, newParentType) => {
    let tr = null;
    let { from, to } = state.tr.selection;
    state.doc.nodesBetween(from, to, (node, pos, parent) => {
        // If iterate over a node thats out of our defined range
        // We skip here but continue to iterate over its children.
        if (node.isText || pos < from || pos > to || !parent) {
            return true;
        }
        node.marks.forEach((mark) => {
            if (!parent.type.allowsMarkType(mark.type) ||
                (newParentType && !newParentType.allowsMarkType(mark.type))) {
                const filteredMarks = node.marks.filter((m) => m.type !== mark.type);
                const position = pos > 0 ? pos - 1 : 0;
                let targetNode = state.doc.nodeAt(position);
                // you cannot set markup for text node
                if (!targetNode || targetNode.isText) {
                    return;
                }
                tr = (tr || state.tr).setNodeMarkup(position, undefined, node.attrs, filteredMarks);
            }
        });
        return;
    }, from);
    return tr;
};
// This will return (depth - 1) for root list parent of a list.
const getListLiftTarget = (type, schema, resPos) => {
    let target = resPos.depth;
    const { bulletList, orderedList } = schema.nodes;
    let listItem = type;
    if (!listItem) {
        ({ listItem } = schema.nodes);
    }
    for (let i = resPos.depth; i > 0; i--) {
        const node = resPos.node(i);
        if (node.type === bulletList || node.type === orderedList) {
            target = i;
        }
        if (node.type !== bulletList &&
            node.type !== orderedList &&
            node.type !== listItem) {
            break;
        }
    }
    return target - 1;
};
function mapChildren(node, callback) {
    const array = [];
    for (let i = 0; i < node.childCount; i++) {
        array.push(callback(node.child(i), i, node instanceof pm.Fragment ? node : node.content));
    }
    return array;
}
const isFirstChildOfParent = (state) => {
    const { $from } = state.selection;
    return $from.depth > 1
        ? (state.selection instanceof GapCursorSelection &&
            $from.parentOffset === 0) ||
            $from.index($from.depth - 1) === 0
        : true;
};
function mapSlice(slice, callback) {
    const fragment = mapFragment(slice.content, callback);
    return new pm.Slice(fragment, slice.openStart, slice.openEnd);
}
function mapFragment(content, callback, parent) {
    const children = [];
    for (let i = 0, size = content.childCount; i < size; i++) {
        const node = content.child(i);
        const transformed = node.isLeaf
            ? callback(node, parent, i)
            : callback(node.copy(mapFragment(node.content, callback, node)), parent, i);
        if (transformed) {
            if (transformed instanceof pm.Fragment) {
                children.push(...getFragmentBackingArray(transformed));
            }
            else if (Array.isArray(transformed)) {
                children.push(...transformed);
            }
            else {
                children.push(transformed);
            }
        }
    }
    return pm.Fragment.fromArray(children);
}
function getFragmentBackingArray(fragment) {
    // @ts-ignore @types/prosemirror-model doesn't have Fragment.content
    return fragment.content;
}
/**
 *
 * @param {*} type The schema type of object to create
 * @param {*} placement The placement of the node - above or below
 * @param {*} nestable putting this true will create the
 *            empty node at -1. Set this to true   for nodes
 *             which are nested, for example in:
 *              `<ul> p1 <li> p2 <p>abc</p> p7 </li> p8 <ul>`
 *            we want to insert empty `<li>` above, for which we
 *            will  insert it at pos p1 and not p2. If nested was false,
 *            the function would hav inserted at p2.
 */
function insertEmpty(type, placement = 'above', nestable = false, attrs) {
    const isAbove = placement === 'above';
    const depth = nestable ? -1 : undefined;
    return (state, dispatch) => {
        const insertPos = isAbove
            ? state.selection.$from.before(depth)
            : state.selection.$from.after(depth);
        const nodeToInsert = type.createAndFill(attrs);
        const tr = state.tr;
        let newTr = prosemirrorUtilsBangle.safeInsert(nodeToInsert, insertPos)(state.tr);
        if (tr === newTr) {
            return false;
        }
        if (dispatch) {
            dispatch(newTr.scrollIntoView());
        }
        return true;
    };
}
function findFirstMarkPosition(mark, doc, from, to) {
    let markPos = { start: -1, end: -1 };
    doc.nodesBetween(from, to, (node, pos) => {
        // stop recursing if result is found
        if (markPos.start > -1) {
            return false;
        }
        if (markPos.start === -1 && mark.isInSet(node.marks)) {
            markPos = {
                start: pos,
                end: pos + Math.max(node.textContent.length, 1),
            };
        }
        return;
    });
    return markPos;
}
/**
 * Creates a plugin which allows for saving of value
 * Helpful for use cases when you just want to store
 * a value in the state and the value will not change
 * over time.
 *
 * Good to know: you get the value by doing `key.getState(state)`
 */
function valuePlugin(key, value) {
    return new pm.Plugin({
        key,
        state: {
            init() {
                return value;
            },
            apply(_, v) {
                return v;
            },
        },
    });
}
function toHTMLString(state) {
    const div = document.createElement('div');
    const fragment = pm.DOMSerializer.fromSchema(state.schema).serializeFragment(state.doc.content);
    div.appendChild(fragment);
    return div.innerHTML;
}
function extendDispatch(dispatch, tapTr) {
    return (dispatch &&
        ((tr) => {
            if (tr.isGeneric) {
                tapTr(tr);
            }
            dispatch(tr);
        }));
}
/**
 * Gets the node type from the schema
 * Warning: This will throw if the node type is not found
 * @param arg
 * @param name
 * @returns
 */
function getNodeType(arg, name) {
    const nodeType = arg instanceof pm.EditorState ? arg.schema.nodes[name] : arg.nodes[name];
    assertNotUndefined(nodeType, `nodeType ${name} not found`);
    return nodeType;
}
/**
 * Gets the paragraph node type from the schema
 * Warning: This will throw if the node type is not found
 * @param arg
 * @param name
 * @returns
 */
function getParaNodeType(arg) {
    const nodeType = arg instanceof pm.EditorState
        ? arg.schema.nodes['paragraph']
        : arg.nodes['paragraph'];
    assertNotUndefined(nodeType, `nodeType paragraph not found`);
    return nodeType;
}

Object.defineProperty(exports, 'canInsert', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.canInsert; }
});
Object.defineProperty(exports, 'contains', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.contains; }
});
Object.defineProperty(exports, 'findBlockNodes', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findBlockNodes; }
});
Object.defineProperty(exports, 'findChildren', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findChildren; }
});
Object.defineProperty(exports, 'findChildrenByAttr', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findChildrenByAttr; }
});
Object.defineProperty(exports, 'findChildrenByMark', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findChildrenByMark; }
});
Object.defineProperty(exports, 'findChildrenByType', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findChildrenByType; }
});
Object.defineProperty(exports, 'findDomRefAtPos', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findDomRefAtPos; }
});
Object.defineProperty(exports, 'findInlineNodes', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findInlineNodes; }
});
Object.defineProperty(exports, 'findParentDomRef', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findParentDomRef; }
});
Object.defineProperty(exports, 'findParentDomRefOfType', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findParentDomRefOfType; }
});
Object.defineProperty(exports, 'findParentNode', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findParentNode; }
});
Object.defineProperty(exports, 'findParentNodeClosestToPos', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findParentNodeClosestToPos; }
});
Object.defineProperty(exports, 'findParentNodeOfType', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findParentNodeOfType; }
});
Object.defineProperty(exports, 'findParentNodeOfTypeClosestToPos', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findParentNodeOfTypeClosestToPos; }
});
Object.defineProperty(exports, 'findPositionOfNodeBefore', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findPositionOfNodeBefore; }
});
Object.defineProperty(exports, 'findSelectedNodeOfType', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findSelectedNodeOfType; }
});
Object.defineProperty(exports, 'findTextNodes', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.findTextNodes; }
});
Object.defineProperty(exports, 'flatten', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.flatten; }
});
Object.defineProperty(exports, 'hasParentNode', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.hasParentNode; }
});
Object.defineProperty(exports, 'hasParentNodeOfType', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.hasParentNodeOfType; }
});
Object.defineProperty(exports, 'isNodeSelection', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.isNodeSelection; }
});
Object.defineProperty(exports, 'removeNodeBefore', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.removeNodeBefore; }
});
Object.defineProperty(exports, 'removeParentNodeOfType', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.removeParentNodeOfType; }
});
Object.defineProperty(exports, 'removeSelectedNode', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.removeSelectedNode; }
});
Object.defineProperty(exports, 'replaceParentNodeOfType', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.replaceParentNodeOfType; }
});
Object.defineProperty(exports, 'replaceSelectedNode', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.replaceSelectedNode; }
});
Object.defineProperty(exports, 'safeInsert', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.safeInsert; }
});
Object.defineProperty(exports, 'selectParentNodeOfType', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.selectParentNodeOfType; }
});
Object.defineProperty(exports, 'setParentNodeMarkup', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.setParentNodeMarkup; }
});
Object.defineProperty(exports, 'setTextSelection', {
    enumerable: true,
    get: function () { return prosemirrorUtilsBangle.setTextSelection; }
});
exports.APP_ENV = APP_ENV;
exports.Either = Either;
exports.Emitter = Emitter;
exports.GapCursorSelection = GapCursorSelection;
exports.ObjectUID = ObjectUID;
exports.abortableSetTimeout = abortableSetTimeout;
exports.assertNotUndefined = assertNotUndefined;
exports.bangleWarn = bangleWarn;
exports.browser = browser;
exports.cancelablePromise = cancelablePromise;
exports.compose = compose;
exports.createElement = createElement;
exports.createObject = createObject;
exports.debounceFn = debounceFn;
exports.domEventListener = domEventListener;
exports.domSerializationHelpers = domSerializationHelpers;
exports.extendDispatch = extendDispatch;
exports.filter = filter;
exports.findAncestorPosition = findAncestorPosition;
exports.findCutBefore = findCutBefore;
exports.findFirstMarkPosition = findFirstMarkPosition;
exports.getAncestorNodesBetween = getAncestorNodesBetween;
exports.getFragmentBackingArray = getFragmentBackingArray;
exports.getIdleCallback = getIdleCallback;
exports.getListLiftTarget = getListLiftTarget;
exports.getMarkAttrs = getMarkAttrs;
exports.getNodeType = getNodeType;
exports.getParaNodeType = getParaNodeType;
exports.hasVisibleContent = hasVisibleContent;
exports.insertEmpty = insertEmpty;
exports.isChromeWithSelectionBug = isChromeWithSelectionBug;
exports.isEmptyDocument = isEmptyDocument;
exports.isEmptyParagraph = isEmptyParagraph;
exports.isEmptySelectionAtStart = isEmptySelectionAtStart;
exports.isFirstChildOfParent = isFirstChildOfParent;
exports.isMarkActiveInSelection = isMarkActiveInSelection;
exports.isNodeEmpty = isNodeEmpty;
exports.isProdEnv = isProdEnv;
exports.isRangeOfType = isRangeOfType;
exports.isTestEnv = isTestEnv;
exports.mapChildren = mapChildren;
exports.mapFragment = mapFragment;
exports.mapSlice = mapSlice;
exports.markInputRule = markInputRule;
exports.markPasteRule = markPasteRule;
exports.matchAllPlus = matchAllPlus;
exports.nodeIsActive = nodeIsActive;
exports.objectFilter = objectFilter;
exports.objectMapValues = objectMapValues;
exports.objectUid = objectUid;
exports.rafCommandExec = rafCommandExec;
exports.rafSchedule = rafSchedule;
exports.sanitiseSelectionMarksForWrapping = sanitiseSelectionMarksForWrapping;
exports.serialExecuteQueue = serialExecuteQueue;
exports.simpleLRU = simpleLRU;
exports.sleep = sleep;
exports.toHTMLString = toHTMLString;
exports.uuid = uuid;
exports.validListParent = validListParent;
exports.validPos = validPos;
exports.valuePlugin = valuePlugin;
exports.weakCache = weakCache;
