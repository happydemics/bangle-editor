import { DOMOutputSpec, Node, MarkType, InputRule, Mark, Plugin, Selection, EditorView, Command, EditorState, NodeType, Schema, ResolvedPos, Fragment, Slice, PluginKey, Transaction } from '@bangle.dev/pm';
import * as prosemirror_model from 'prosemirror-model';
export { CellTransform, ContentNodeWithPos, DomAtPos, MovementOptions, NodeWithPos, Predicate, canInsert, contains, findBlockNodes, findChildren, findChildrenByAttr, findChildrenByMark, findChildrenByType, findDomRefAtPos, findInlineNodes, findParentDomRef, findParentDomRefOfType, findParentNode, findParentNodeClosestToPos, findParentNodeOfType, findParentNodeOfTypeClosestToPos, findPositionOfNodeBefore, findSelectedNodeOfType, findTextNodes, flatten, hasParentNode, hasParentNodeOfType, isNodeSelection, removeNodeBefore, removeParentNodeOfType, removeSelectedNode, replaceParentNodeOfType, replaceSelectedNode, safeInsert, selectParentNodeOfType, setParentNodeMarkup, setTextSelection } from 'prosemirror-utils-bangle';

declare const browser: {
    mac: boolean;
    ie: boolean;
    ie_version: number;
    gecko: boolean;
    chrome: boolean;
    chrome_version: number;
    android: boolean;
    ios: boolean;
    webkit: boolean;
};
declare const isChromeWithSelectionBug: boolean;

interface Options {
    /**
      Time in milliseconds to wait until the `input` function is called.
      @default 0
      */
    readonly wait?: number;
    /**
      The maximum time the `input` function is allowed to be delayed before it's invoked.
      This can be used to control the rate of calls handled in a constant stream. For example, a media player sending updates every few milliseconds but wants to be handled only once a second.
      @default Infinity
      */
    readonly maxWait?: number;
    /**
      Trigger the function on the leading edge of the `wait` interval.
      For example, this can be useful for preventing accidental double-clicks on a "submit" button from firing a second time.
      @default false
      */
    readonly before?: boolean;
    /**
      Trigger the function on the trailing edge of the `wait` interval.
      @default true
      */
    readonly after?: boolean;
}
interface DebouncedFunction<ArgumentsType extends unknown[], RetType> {
    (...args: ArgumentsType): RetType;
    cancel(): void;
}
declare function debounceFn<ArgumentsType extends unknown[], RetType>(inputFunction: (...args: ArgumentsType) => RetType, options: Options): DebouncedFunction<ArgumentsType, undefined>;

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
declare function domSerializationHelpers(name: string, { tag, content, ignoreAttrs, parsingPriority, }?: {
    tag?: string;
    content?: DOMOutputSpec | ((node: Node) => DOMOutputSpec);
    ignoreAttrs?: string[];
    parsingPriority?: number;
}): {
    toDOM: (node: Node) => DOMOutputSpec;
    parseDOM: {
        priority: number;
        tag: string;
        getAttrs: (dom: any) => any;
    }[];
};
declare function createElement(spec: DOMOutputSpec): HTMLElement;

interface Left<T> {
    left: T;
    right: undefined;
    type: 'left';
}
interface Right<T> {
    left: undefined;
    right: T;
    type: 'right';
}
type EitherType<L, R> = Left<L> | Right<R>;
type NotEither<T> = T extends Left<any> ? never : T extends Right<any> ? never : T;
declare class Either {
    static flatMap<L, R, V>(either: Left<L> | Right<R>, rightFn: (rightVal: R, opts: {
        left: (l: L) => Left<L> | Right<R>;
    }) => Left<L> | Right<V>): Left<L> | Right<V>;
    static fold<L, R, V>(either: Left<L> | Right<R>, leftFn: (left: L) => L, rightFn: (right: R) => V): Left<L> | Right<V>;
    static isLeft<T>(either: Left<T> | Right<unknown>): either is Left<T>;
    static isRight<T>(either: Left<unknown> | Right<T>): either is Right<T>;
    static left<T>(value: T): Left<T>;
    static map<L, R, V>(either: Left<L> | Right<R>, rightFn: (right: R) => V): Left<L> | Right<V>;
    static mapLeft<L, R>(either: Left<L> | Right<R>, leftFn: (left: L) => L): Left<L> | Right<R>;
    static right<T>(value: T): Right<T>;
    static unwrap<L, R>(either: Left<L> | Right<R>): [L, undefined] | [undefined, R];
    static value<L, R>(either: Left<L> | Right<R>): L | R;
}

interface Listeners<T> {
    [name: string]: Listener<T>[];
}
type Listener<T = any> = (data: T) => void;
declare class Emitter<T = any> {
    _callbacks: Listeners<T>;
    destroy(): void;
    emit(event: any, data: any): this;
    off(event: string, fn: Listener<T>): this;
    on(event: any, fn: any): this;
}

declare const APP_ENV: string | undefined;
declare const isProdEnv: boolean;
declare const isTestEnv: boolean;

declare function assertNotUndefined<T>(value: T | undefined, message: string): asserts value is T;
/**
 * @param {Function} fn - A unary function whose paramater is non-primitive,
 *                        so that it can be cached using WeakMap
 */
declare function weakCache<T extends object, V>(fn: (a: T) => V): (arg: T) => V;
declare function compose(func: Function, ...funcs: Function[]): (raw: any) => any;
declare class MatchType {
    start: number;
    end: number;
    match: boolean;
    private _sourceString;
    constructor(start: number, end: number, match: boolean, _sourceString: string);
    get subString(): string;
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
declare function matchAllPlus(regexp: RegExp, str: string): MatchType[];
declare function uuid(len?: number): string;
declare function abortableSetTimeout(callback: (args: void) => void, signal: AbortSignal, ms: number): void;
declare function getIdleCallback(cb: Function): any;
interface CancelablePromise<T = any> {
    promise: Promise<T>;
    cancel: () => void;
}
declare function cancelablePromise<T>(promise: Promise<T>): CancelablePromise<T>;
declare function sleep(t?: number): Promise<unknown>;
declare function objectMapValues<T, K>(obj: {
    [s: string]: T;
}, map: (value: T, key: string) => K): {
    [s: string]: K;
};
declare function objectFilter<T>(obj: {
    [s: string]: T;
}, cb: (value: T, key: string) => boolean): {
    [s: string]: T;
};
/**
 * Creates an object from an array of [key, Value], filtering out any
 * undefined or null key
 */
declare function createObject<T>(entries: Array<[string | null | undefined, T]>): {
    [k: string]: T;
};
declare function serialExecuteQueue(): {
    add<T>(cb: () => Promise<T>): Promise<T>;
};
declare function simpleLRU<K = any, V = any>(size: number): {
    entries(): {
        key: K;
        value: V;
    }[];
    remove(key: K): void;
    clear(): void;
    get(key: K): V | undefined;
    set(key: K, value: V): void;
};
declare function domEventListener(element: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): () => void;
/**
 * Based on idea from https://github.com/alexreardon/raf-schd
 * Throttles the function and calls it with the latest argument
 */
declare function rafSchedule<T>(fn: (...args: T[]) => void): {
    (...args: T[]): void;
    cancel(): void;
};
declare const bangleWarn: (...args: any[]) => void;

declare function markInputRule(regexp: RegExp, markType: MarkType): InputRule;

declare function markPasteRule(regexp: RegExp, type: MarkType, getAttrs?: Mark['attrs'] | ((match: RegExpMatchArray) => Mark['attrs'])): Plugin<any>;

declare class ObjectUID extends WeakMap {
    get(obj: any): any;
}
declare const objectUid: ObjectUID;

declare abstract class GapCursorSelection extends Selection {
}
type PredicateFunction = (state: EditorState, view?: EditorView) => any;
declare function rafCommandExec(view: EditorView, command: Command): void;
declare function filter(predicates: PredicateFunction | PredicateFunction[], cmd?: Command): Command;
declare function isMarkActiveInSelection(type: MarkType): (state: EditorState) => boolean;
declare const validPos: (pos: number, doc: Node) => boolean;
declare const validListParent: (type: NodeType, schemaNodes: Schema['nodes']) => boolean;
declare function getMarkAttrs(editorState: EditorState, type: MarkType): prosemirror_model.Attrs;
declare function nodeIsActive(state: EditorState, type: NodeType, attrs?: Node['attrs']): boolean;
/**
 * from atlaskit
 * Returns false if node contains only empty inline nodes and hardBreaks.
 */
declare function hasVisibleContent(node: Node): boolean;
/**
 *  * from atlaskit
 * Checks if a node has any content. Ignores node that only contain empty block nodes.
 */
declare function isNodeEmpty(node: Node): boolean;
/**
 * Checks if a node looks like an empty document
 */
declare function isEmptyDocument(node: Node): boolean;
declare function isEmptyParagraph(node: Node): boolean;
declare function findCutBefore($pos: ResolvedPos): ResolvedPos | null;
declare function isRangeOfType(doc: Node, $from: ResolvedPos, $to: ResolvedPos, nodeType: NodeType): boolean;
/**
 * Returns all top-level ancestor-nodes between $from and $to
 */
declare function getAncestorNodesBetween(doc: Node, $from: ResolvedPos, $to: ResolvedPos): Node[];
/**
 * Traverse the document until an "ancestor" is found. Any nestable block can be an ancestor.
 */
declare function findAncestorPosition(doc: Node, pos: ResolvedPos): ResolvedPos;
declare const isEmptySelectionAtStart: (state: EditorState) => boolean;
/**
 * Removes marks from nodes in the current selection that are not supported
 */
declare const sanitiseSelectionMarksForWrapping: (state: EditorState, newParentType: NodeType) => null;
declare const getListLiftTarget: (type: NodeType | null | undefined, schema: Schema, resPos: ResolvedPos) => number;
declare function mapChildren<T>(node: Node | Fragment, callback: (child: Node, index: number, frag: Fragment) => T): T[];
declare const isFirstChildOfParent: (state: EditorState) => boolean;
type MapFragmentCallback = (node: Node, parent: Node | undefined, index: number) => Node | Node[] | Fragment | null;
declare function mapSlice(slice: Slice, callback: MapFragmentCallback): Slice;
declare function mapFragment(content: Fragment, callback: MapFragmentCallback, parent?: Node): Fragment;
declare function getFragmentBackingArray(fragment: Fragment): any;
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
declare function insertEmpty(type: NodeType, placement?: 'above' | 'below', nestable?: boolean, attrs?: Node['attrs']): Command;
declare function findFirstMarkPosition(mark: MarkType, doc: Node, from: number, to: number): {
    start: number;
    end: number;
};
/**
 * Creates a plugin which allows for saving of value
 * Helpful for use cases when you just want to store
 * a value in the state and the value will not change
 * over time.
 *
 * Good to know: you get the value by doing `key.getState(state)`
 */
declare function valuePlugin<T>(key: PluginKey<T>, value: T): Plugin<T>;
declare function toHTMLString(state: EditorState): string;
declare function extendDispatch(dispatch: ((tr: Transaction) => void) | undefined, tapTr: (tr: Transaction) => any): ((tr: Transaction) => void) | undefined;
/**
 * Gets the node type from the schema
 * Warning: This will throw if the node type is not found
 * @param arg
 * @param name
 * @returns
 */
declare function getNodeType(arg: Schema | EditorState, name: string): NodeType;
/**
 * Gets the paragraph node type from the schema
 * Warning: This will throw if the node type is not found
 * @param arg
 * @param name
 * @returns
 */
declare function getParaNodeType(arg: Schema | EditorState): NodeType;

export { APP_ENV, DebouncedFunction, Either, EitherType, Emitter, GapCursorSelection, Left, NotEither, ObjectUID, Right, abortableSetTimeout, assertNotUndefined, bangleWarn, browser, cancelablePromise, compose, createElement, createObject, debounceFn, domEventListener, domSerializationHelpers, extendDispatch, filter, findAncestorPosition, findCutBefore, findFirstMarkPosition, getAncestorNodesBetween, getFragmentBackingArray, getIdleCallback, getListLiftTarget, getMarkAttrs, getNodeType, getParaNodeType, hasVisibleContent, insertEmpty, isChromeWithSelectionBug, isEmptyDocument, isEmptyParagraph, isEmptySelectionAtStart, isFirstChildOfParent, isMarkActiveInSelection, isNodeEmpty, isProdEnv, isRangeOfType, isTestEnv, mapChildren, mapFragment, mapSlice, markInputRule, markPasteRule, matchAllPlus, nodeIsActive, objectFilter, objectMapValues, objectUid, rafCommandExec, rafSchedule, sanitiseSelectionMarksForWrapping, serialExecuteQueue, simpleLRU, sleep, toHTMLString, uuid, validListParent, validPos, valuePlugin, weakCache };
