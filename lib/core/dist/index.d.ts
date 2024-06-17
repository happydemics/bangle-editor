import * as pmHistory from '@bangle.dev/pm';
import { NodeSpec, MarkSpec, Schema, Plugin, InputRule, PluginKey, Command, EditorState, EditorProps, Selection, Mark, dropCursor, Node, EditorView, DirectEditorProps, DOMOutputSpec, Decoration } from '@bangle.dev/pm';
export { Plugin, PluginKey } from '@bangle.dev/pm';
import { UnnestObjValue, MarkdownSerializer, MarkdownParser } from '@bangle.dev/shared-types';

type BaseSpec = BaseRawNodeSpec | BaseRawMarkSpec;
interface BaseRawNodeSpec {
    name: string;
    type: 'node';
    topNode?: boolean;
    schema: NodeSpec;
    markdown?: {
        toMarkdown: UnnestObjValue<MarkdownSerializer['nodes']>;
        parseMarkdown?: MarkdownParser['tokens'];
    };
    options?: {
        [k: string]: any;
    };
}
interface BaseRawMarkSpec {
    name: string;
    type: 'mark';
    schema: MarkSpec;
    markdown?: {
        toMarkdown: UnnestObjValue<MarkdownSerializer['marks']>;
        parseMarkdown?: MarkdownParser['tokens'];
    };
    options?: {
        [k: string]: any;
    };
}
type RawSpecs = null | false | undefined | BaseRawNodeSpec | BaseRawMarkSpec | RawSpecs[];
declare class SpecRegistry<N extends string = any, M extends string = any> {
    _options: {
        [key: string]: any;
    };
    _schema: Schema<N, M>;
    _spec: BaseSpec[];
    constructor(rawSpecs?: RawSpecs, { defaultSpecs }?: {
        defaultSpecs?: boolean | undefined;
    });
    get options(): {
        [key: string]: any;
    };
    get schema(): Schema<N, M>;
    get spec(): BaseSpec[];
}

declare const spec$2: typeof specFactory$2;
declare function specFactory$2({ content }?: {
    content?: string | undefined;
}): BaseRawNodeSpec;

declare namespace doc {
  export {
    spec$2 as spec,
  };
}

interface DeepPluginArray extends Array<Plugin | DeepPluginArray> {
}
declare class PluginGroup {
    name: string;
    plugins: DeepPluginArray;
    constructor(name: string, plugins: DeepPluginArray);
}

interface PluginPayload<T = any> {
    schema: Schema;
    specRegistry: SpecRegistry;
    metadata: T;
}
type BaseRawPlugins = false | null | Plugin | InputRule | PluginGroup | BaseRawPlugins[];
type RawPlugins<T = any> = BaseRawPlugins | ((payLoad: PluginPayload<T>) => BaseRawPlugins);

declare const plugins$2: typeof pluginsFactory$2;
declare const docChangedKey: PluginKey<any>;
declare const selectionChangedKey: PluginKey<any>;
declare function pluginsFactory$2(): RawPlugins;

declare const editorStateCounter_docChangedKey: typeof docChangedKey;
declare const editorStateCounter_selectionChangedKey: typeof selectionChangedKey;
declare namespace editorStateCounter {
  export {
    plugins$2 as plugins,
    editorStateCounter_docChangedKey as docChangedKey,
    editorStateCounter_selectionChangedKey as selectionChangedKey,
  };
}

declare const plugins$1: typeof pluginsFactory$1;
declare const commands$1: {
    undo: typeof undo;
    redo: typeof redo;
};
declare const defaultKeys$1: {
    undo: string;
    redo: string;
    redoAlt: string;
};
declare function pluginsFactory$1({ historyOpts, keybindings, }?: {
    historyOpts?: {} | undefined;
    keybindings?: {
        undo: string;
        redo: string;
        redoAlt: string;
    } | undefined;
}): RawPlugins;
declare function undo(): pmHistory.Command;
declare function redo(): pmHistory.Command;

declare const history_undo: typeof undo;
declare const history_redo: typeof redo;
declare namespace history {
  export {
    plugins$1 as plugins,
    commands$1 as commands,
    defaultKeys$1 as defaultKeys,
    history_undo as undo,
    history_redo as redo,
  };
}

declare const spec$1: typeof specFactory$1;
declare const plugins: typeof pluginsFactory;
declare const commands: {
    convertToParagraph: typeof convertToParagraph;
    jumpToStartOfParagraph: typeof jumpToStartOfParagraph;
    jumpToEndOfParagraph: typeof jumpToEndOfParagraph;
    queryIsParagraph: typeof queryIsParagraph;
    queryIsTopLevelParagraph: typeof queryIsTopLevelParagraph;
    insertEmptyParagraphAbove: typeof insertEmptyParagraphAbove;
    insertEmptyParagraphBelow: typeof insertEmptyParagraphBelow;
};
declare const defaultKeys: {
    jumpToEndOfParagraph: string;
    jumpToStartOfParagraph: string;
    moveDown: string;
    moveUp: string;
    emptyCopy: string;
    emptyCut: string;
    insertEmptyParaAbove: string;
    insertEmptyParaBelow: string;
    convertToParagraph: string;
};
declare function specFactory$1(): BaseRawNodeSpec;
declare function pluginsFactory({ keybindings }?: {
    keybindings?: {
        jumpToEndOfParagraph: string;
        jumpToStartOfParagraph: string;
        moveDown: string;
        moveUp: string;
        emptyCopy: string;
        emptyCut: string;
        insertEmptyParaAbove: string;
        insertEmptyParaBelow: string;
        convertToParagraph: string;
    } | undefined;
}): RawPlugins;
declare function convertToParagraph(): Command;
declare function queryIsTopLevelParagraph(): (state: EditorState) => boolean;
declare function queryIsParagraph(): (state: EditorState) => boolean;
declare function insertEmptyParagraphAbove(): Command;
declare function insertEmptyParagraphBelow(): Command;
declare function jumpToStartOfParagraph(): Command;
declare function jumpToEndOfParagraph(): Command;

declare const paragraph_plugins: typeof plugins;
declare const paragraph_commands: typeof commands;
declare const paragraph_defaultKeys: typeof defaultKeys;
declare const paragraph_convertToParagraph: typeof convertToParagraph;
declare const paragraph_queryIsTopLevelParagraph: typeof queryIsTopLevelParagraph;
declare const paragraph_queryIsParagraph: typeof queryIsParagraph;
declare const paragraph_insertEmptyParagraphAbove: typeof insertEmptyParagraphAbove;
declare const paragraph_insertEmptyParagraphBelow: typeof insertEmptyParagraphBelow;
declare const paragraph_jumpToStartOfParagraph: typeof jumpToStartOfParagraph;
declare const paragraph_jumpToEndOfParagraph: typeof jumpToEndOfParagraph;
declare namespace paragraph {
  export {
    spec$1 as spec,
    paragraph_plugins as plugins,
    paragraph_commands as commands,
    paragraph_defaultKeys as defaultKeys,
    paragraph_convertToParagraph as convertToParagraph,
    paragraph_queryIsTopLevelParagraph as queryIsTopLevelParagraph,
    paragraph_queryIsParagraph as queryIsParagraph,
    paragraph_insertEmptyParagraphAbove as insertEmptyParagraphAbove,
    paragraph_insertEmptyParagraphBelow as insertEmptyParagraphBelow,
    paragraph_jumpToStartOfParagraph as jumpToStartOfParagraph,
    paragraph_jumpToEndOfParagraph as jumpToEndOfParagraph,
  };
}

declare const spec: typeof specFactory;
declare function specFactory(): BaseRawNodeSpec;

declare const text_spec: typeof spec;
declare namespace text {
  export {
    text_spec as spec,
  };
}

type InitialContent = string | Node | object;
interface BangleEditorStateProps<PluginMetadata = any> {
    specRegistry?: SpecRegistry;
    specs?: RawSpecs;
    plugins?: RawPlugins;
    initialValue?: InitialContent;
    editorProps?: EditorProps;
    pmStateOpts?: {
        selection?: Selection | undefined;
        storedMarks?: Mark[] | null | undefined;
    };
    pluginMetadata?: PluginMetadata;
    dropCursorOpts?: Parameters<typeof dropCursor>[0];
}
declare class BangleEditorState<PluginMetadata> {
    specRegistry: SpecRegistry;
    pmState: EditorState;
    constructor({ specRegistry, specs, plugins, initialValue, editorProps, pmStateOpts, pluginMetadata, dropCursorOpts, }?: BangleEditorStateProps<PluginMetadata>);
}

type PMViewOpts = Omit<DirectEditorProps, 'state' | 'dispatchTransaction' | 'attributes'>;
interface BangleEditorProps<PluginMetadata> {
    focusOnInit?: boolean;
    state: BangleEditorState<PluginMetadata>;
    pmViewOpts?: PMViewOpts;
}
declare class BangleEditor<PluginMetadata = any> {
    destroyed: boolean;
    view: EditorView;
    constructor(element: HTMLElement, { focusOnInit, state, pmViewOpts, }: BangleEditorProps<PluginMetadata>);
    destroy(): void;
    focusView(): void;
    toHTMLString(): string;
}

declare function createElement(spec: DOMOutputSpec): HTMLElement;

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

type GetPosFunction = () => number | undefined;
type UpdateAttrsFunction = (attrs: Node['attrs']) => void;
interface NodeViewProps {
    node: Node;
    view: EditorView;
    getPos: GetPosFunction;
    decorations: readonly Decoration[];
    selected: boolean;
    attrs: Node['attrs'];
    updateAttrs: UpdateAttrsFunction;
}
type RenderHandlerFunction = (nodeView: NodeView, props: NodeViewProps) => void;
interface RenderHandlers {
    create: RenderHandlerFunction;
    update: RenderHandlerFunction;
    destroy: RenderHandlerFunction;
}
declare abstract class BaseNodeView {
    contentDOM?: HTMLElement;
    containerDOM?: HTMLElement;
    renderHandlers: RenderHandlers;
    opts: {
        selectionSensitive: boolean;
    };
    _decorations: readonly Decoration[];
    _getPos: GetPosFunction;
    _node: Node;
    _selected: boolean;
    _view: EditorView;
    constructor({ node, view, getPos, decorations, containerDOM, contentDOM, renderHandlers, }: {
        node: Node;
        view: EditorView;
        getPos: GetPosFunction;
        decorations: readonly Decoration[];
        contentDOM?: HTMLElement;
        containerDOM?: HTMLElement;
        renderHandlers?: RenderHandlers;
    }, { selectionSensitive }?: {
        selectionSensitive?: boolean | undefined;
    });
    get dom(): InstanceType<typeof window.Node>;
    getAttrs(): Node['attrs'];
    getNodeViewProps(): NodeViewProps;
}
declare class NodeView extends BaseNodeView {
    /**
     * The idea here is to figure out whether your component
     * will be hole-y (will let pm put in contents) or be opaque (example emoji).
     * NOTE: if  passing contentDOM, it is your responsibility to insert it into
     * containerDOM.
     * NOTE: when dealing with renderHandlers like .create or .update
     * donot assume anything about the current state of dom elements. For
     * example, the dom you created in .create handler, may or may not exist,
     * when the .update is called.
     *
     */
    static createPlugin({ name, containerDOM: containerDOMSpec, contentDOM: contentDOMSpec, // only for components which need to have editable content
    renderHandlers, }: {
        name: string;
        contentDOM?: DOMOutputSpec;
        containerDOM: DOMOutputSpec;
        renderHandlers?: RenderHandlers;
    }): Plugin<any>;
    deselectNode(): void;
    destroy(): void;
    ignoreMutation(mutation: MutationRecord | {
        type: 'selection';
        target: Element;
    }): boolean;
    selectNode(): void;
    update(node: Node, decorations: readonly Decoration[]): boolean;
}
declare function saveRenderHandlers(editorContainer: HTMLElement, handlers: RenderHandlers): void;
declare function getRenderHandlers(view: EditorView): RenderHandlers | undefined;

declare const criticalComponents: {
    doc: typeof doc;
    paragraph: typeof paragraph;
    text: typeof text;
    history: typeof history;
    editorStateCounter: typeof editorStateCounter;
};

export { BangleEditor, BangleEditorProps, BangleEditorState, BangleEditorStateProps, BaseRawMarkSpec, BaseRawNodeSpec, BaseSpec, NodeView, NodeViewProps, RawPlugins, RawSpecs, RenderHandlerFunction, RenderHandlers, SpecRegistry, UpdateAttrsFunction, createElement, criticalComponents, doc, domSerializationHelpers, editorStateCounter, getRenderHandlers, history, paragraph, saveRenderHandlers, text };
