import { EditorView, EditorState, Schema, Selection, Node, Fragment } from '@bangle.dev/pm';
import { SpecRegistry, BangleEditor } from '@bangle.dev/core';

/**
 * Build an event object in a cross-browser manner
 *
 * Usage:
 *    const event = createEvent('paste', options);
 */
declare const createEvent: (name: string, options?: EventInit) => Event;

/**
 *
 *
 * Dispatch a paste event on the given ProseMirror instance
 *
 * Usage:
 *     dispatchPasteEvent(pm, {
 *         plain: 'copied text'
 *     });
 */
declare function dispatchPasteEvent(editorView: EditorView, content: any): false | Event;

declare function sendKeyToPm(editorView: EditorView, keys: string): void;
declare function typeText(view: EditorView, text: string): Promise<void>;
declare function typeChar(view: EditorView, char: string): Promise<void>;
declare function sleep(t?: number): Promise<unknown>;

/**
 * @jest-environment jsdom
 */

/**
 *
 * @param {*} param0
 * @param {SpecRegistry | undefined | Object} param0.specRegistry pass an object to set properties to all default
 *                        specs, for example calling `renderTestEditor({ specRegistry: {heading: {level : 4}}}))`
 *                        will use all the defaultSpecs with heading spec getting the options `{level:4}`.
 * @param {Array<PluginFactory> | undefined | Object} param0.specRegistry passing an object behaves similar to specRegistry param.
 * @param {*} testId
 */
declare function renderTestEditor({ specRegistry, plugins }: {
    specRegistry: SpecRegistry;
    plugins: any;
}, testId?: string): (testDoc: any) => {
    readonly editor: BangleEditor<any>;
    readonly view: EditorView;
    container: HTMLDivElement;
    editorState: EditorState;
    schema: Schema<any, any>;
    editorView: EditorView;
    selection: Selection;
    posLabels: {
        [k: string]: any;
    } | undefined;
    updateDoc: (doc: (schema: Schema) => Node) => {
        [k: string]: any;
    } | undefined;
    destroy: () => void;
    debugString: () => string;
};

declare const nodeAlias: {
    para: string;
    ul: string;
    ol: string;
    li: string;
    codeBlock: string;
    br: string;
    hr: string;
};
declare const markAlias: {};
declare const getDocLabels: (arg: Node) => {
    [k: string]: any;
};
/**
 * A function used by babel to convert jsx (calling it psx, 'p' for prosemirror) syntax into
 * something which we can use to build a prosemirror document.
 * Read more about custom JSX pragma at https://www.gatsbyjs.com/blog/2019-08-02-what-is-jsx-pragma/
 *
 * For example:
 *  '<doc><heading level={1}>hello</heading></doc>' will be converted by babel to
 *  'psx("doc", null, psx("heading", {level: "1"}))' which will then accept a
 *   prosemirror `schema` to produce a Prosemirror Document.
 *
 * Here is the summary:
 *
 * ~Babel~
 * <psx /> => psx(...)
 *
 * ~Tests~
 * psx(...)(schema) => ProseMirror Document
 *
 */
declare function psx(name: keyof typeof nodeAlias | keyof typeof markAlias, attrs: any, ...childrenRaw: any[]): (schema: Schema) => any[] | Node;

declare function setSelectionNear(view: EditorView, pos: number): void;

declare const selectNodeAt: (view: EditorView, pos: number) => void;
/**
 *
 * @param {*} schema
 * @param {*} psxArray An array of psx nodes eg. [<para>hi</para>, <para>bye</para>]
 */
declare const createPSXFragment: (schema: Schema, psxArray: any[]) => Fragment;

export { createEvent, createPSXFragment, dispatchPasteEvent, getDocLabels, psx, renderTestEditor, selectNodeAt, sendKeyToPm, setSelectionNear, sleep, typeChar, typeText };
