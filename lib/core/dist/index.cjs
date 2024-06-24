'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pmHistory = require('@bangle.dev/pm');
var utils = require('@bangle.dev/utils');
var pmCommands = require('@bangle.dev/pm-commands');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var pmHistory__namespace = /*#__PURE__*/_interopNamespace(pmHistory);

const spec$2 = specFactory$2;
const name$4 = 'doc';
function specFactory$2({ content = 'block+' } = {}) {
    return {
        type: 'node',
        topNode: true,
        name: name$4,
        schema: {
            content: content,
        },
    };
}

var doc = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$2
});

class PluginGroup {
    constructor(name, plugins) {
        this.name = name;
        this.plugins = plugins;
    }
}

const name$3 = 'editorStateCounter';
const plugins$2 = pluginsFactory$2;
const docChangedKey = new pmHistory.PluginKey(name$3);
const selectionChangedKey = new pmHistory.PluginKey(name$3);
function pluginsFactory$2() {
    return () => {
        return new PluginGroup(name$3, [
            new pmHistory.Plugin({
                key: docChangedKey,
                state: {
                    init(_, _state) {
                        return 0;
                    },
                    apply(tr, pluginState, _oldState, _newState) {
                        return tr.docChanged ? pluginState + 1 : pluginState;
                    },
                },
            }),
            new pmHistory.Plugin({
                key: selectionChangedKey,
                state: {
                    init(_, _state) {
                        return 0;
                    },
                    apply(_tr, pluginState, oldState, newState) {
                        return newState.selection.eq(oldState && oldState.selection)
                            ? pluginState
                            : pluginState + 1;
                    },
                },
            }),
        ]);
    };
}

var editorStateCounter = /*#__PURE__*/Object.freeze({
    __proto__: null,
    plugins: plugins$2,
    docChangedKey: docChangedKey,
    selectionChangedKey: selectionChangedKey
});

const plugins$1 = pluginsFactory$1;
const commands$1 = {
    undo,
    redo,
};
const defaultKeys$1 = {
    undo: 'Mod-z',
    redo: 'Mod-y',
    redoAlt: 'Shift-Mod-z',
};
const name$2 = 'history';
function pluginsFactory$1({ historyOpts = {}, keybindings = defaultKeys$1, } = {}) {
    return () => {
        return new PluginGroup(name$2, [
            pmHistory__namespace.history(historyOpts),
            keybindings &&
                pmHistory.keymap(utils.createObject([
                    [keybindings.undo, undo()],
                    [keybindings.redo, redo()],
                    [keybindings.redoAlt, redo()],
                ])),
        ]);
    };
}
function undo() {
    return pmHistory__namespace.undo;
}
function redo() {
    return pmHistory__namespace.redo;
}

var history = /*#__PURE__*/Object.freeze({
    __proto__: null,
    plugins: plugins$1,
    commands: commands$1,
    defaultKeys: defaultKeys$1,
    undo: undo,
    redo: redo
});

const spec$1 = specFactory$1;
const plugins = pluginsFactory;
const commands = {
    convertToParagraph,
    jumpToStartOfParagraph,
    jumpToEndOfParagraph,
    queryIsParagraph,
    queryIsTopLevelParagraph,
    insertEmptyParagraphAbove,
    insertEmptyParagraphBelow,
};
const defaultKeys = {
    jumpToEndOfParagraph: utils.browser.mac ? 'Ctrl-e' : 'Ctrl-End',
    jumpToStartOfParagraph: utils.browser.mac ? 'Ctrl-a' : 'Ctrl-Home',
    moveDown: 'Alt-ArrowDown',
    moveUp: 'Alt-ArrowUp',
    emptyCopy: 'Mod-c',
    emptyCut: 'Mod-x',
    insertEmptyParaAbove: 'Mod-Shift-Enter',
    insertEmptyParaBelow: 'Mod-Enter',
    convertToParagraph: 'Ctrl-Shift-0',
};
const name$1 = 'paragraph';
function specFactory$1() {
    return {
        type: 'node',
        name: name$1,
        schema: {
            content: 'inline*',
            group: 'block',
            draggable: false,
            parseDOM: [
                {
                    tag: 'p',
                },
            ],
            toDOM: () => ['p', 0],
        },
        markdown: {
            toMarkdown(state, node) {
                state.renderInline(node);
                state.closeBlock(node);
            },
            parseMarkdown: {
                paragraph: {
                    block: 'paragraph',
                },
            },
        },
    };
}
function pluginsFactory({ keybindings = defaultKeys } = {}) {
    return ({ schema }) => {
        const type = utils.getParaNodeType(schema);
        // Enables certain command to only work if paragraph is direct child of the `doc` node
        const isTopLevel = pmCommands.parentHasDirectParentOfType(type, utils.getNodeType(schema, 'doc'));
        return [
            keybindings &&
                pmHistory.keymap(utils.createObject([
                    [keybindings.convertToParagraph, convertToParagraph()],
                    [keybindings.moveUp, utils.filter(isTopLevel, pmCommands.moveNode(type, 'UP'))],
                    [keybindings.moveDown, utils.filter(isTopLevel, pmCommands.moveNode(type, 'DOWN'))],
                    [keybindings.jumpToStartOfParagraph, pmCommands.jumpToStartOfNode(type)],
                    [keybindings.jumpToEndOfParagraph, pmCommands.jumpToEndOfNode(type)],
                    [keybindings.emptyCopy, utils.filter(isTopLevel, pmCommands.copyEmptyCommand(type))],
                    [keybindings.emptyCut, utils.filter(isTopLevel, pmCommands.cutEmptyCommand(type))],
                    [
                        keybindings.insertEmptyParaAbove,
                        utils.filter(isTopLevel, utils.insertEmpty(type, 'above')),
                    ],
                    [
                        keybindings.insertEmptyParaBelow,
                        utils.filter(isTopLevel, utils.insertEmpty(type, 'below')),
                    ],
                ])),
        ];
    };
}
// Commands
function convertToParagraph() {
    return (state, dispatch) => pmHistory.setBlockType(utils.getParaNodeType(state))(state, dispatch);
}
function queryIsTopLevelParagraph() {
    return (state) => {
        const type = utils.getParaNodeType(state);
        return pmCommands.parentHasDirectParentOfType(type, utils.getNodeType(state, 'doc'))(state);
    };
}
function queryIsParagraph() {
    return (state) => {
        const type = utils.getParaNodeType(state);
        return Boolean(utils.findParentNodeOfType(type)(state.selection));
    };
}
function insertEmptyParagraphAbove() {
    return (state, dispatch, view) => {
        const type = utils.getParaNodeType(state);
        return utils.filter(pmCommands.parentHasDirectParentOfType(type, utils.getNodeType(state, 'doc')), utils.insertEmpty(type, 'above'))(state, dispatch, view);
    };
}
function insertEmptyParagraphBelow() {
    return (state, dispatch, view) => {
        const type = utils.getParaNodeType(state);
        return utils.filter(pmCommands.parentHasDirectParentOfType(type, utils.getNodeType(state, 'doc')), utils.insertEmpty(type, 'below'))(state, dispatch, view);
    };
}
function jumpToStartOfParagraph() {
    return (state, dispatch) => {
        const type = utils.getParaNodeType(state);
        return pmCommands.jumpToStartOfNode(type)(state, dispatch);
    };
}
function jumpToEndOfParagraph() {
    return (state, dispatch) => {
        const type = utils.getParaNodeType(state);
        return pmCommands.jumpToEndOfNode(type)(state, dispatch);
    };
}

var paragraph = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$1,
    plugins: plugins,
    commands: commands,
    defaultKeys: defaultKeys,
    convertToParagraph: convertToParagraph,
    queryIsTopLevelParagraph: queryIsTopLevelParagraph,
    queryIsParagraph: queryIsParagraph,
    insertEmptyParagraphAbove: insertEmptyParagraphAbove,
    insertEmptyParagraphBelow: insertEmptyParagraphBelow,
    jumpToStartOfParagraph: jumpToStartOfParagraph,
    jumpToEndOfParagraph: jumpToEndOfParagraph
});

const spec = specFactory;
const name = 'text';
function specFactory() {
    return {
        type: 'node',
        name,
        schema: {
            group: 'inline',
        },
        markdown: {
            toMarkdown(state, node) {
                state.text(node.text);
            },
        },
    };
}

var text = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec
});

function pluginLoader(specRegistry, plugins, { metadata, editorProps, defaultPlugins = true, dropCursorOpts, transformPlugins = (p) => p, } = {}) {
    const schema = specRegistry.schema;
    const pluginPayload = {
        schema,
        specRegistry,
        metadata: metadata,
    };
    let [flatPlugins, pluginGroupNames] = flatten$1(plugins, pluginPayload);
    if (defaultPlugins) {
        let defaultPluginGroups = [];
        if (!pluginGroupNames.has('history')) {
            defaultPluginGroups.push(plugins$1());
        }
        if (!pluginGroupNames.has('editorStateCounter')) {
            defaultPluginGroups.push(plugins$2());
        }
        flatPlugins = flatPlugins.concat(
        // TODO: deprecate the ability pass a callback to the plugins param of pluginGroup
        // @ts-ignore
        flatten$1(defaultPluginGroups, pluginPayload)[0]);
        flatPlugins = processInputRules(flatPlugins);
        flatPlugins.push(pmHistory.keymap(pmHistory.baseKeymap), pmHistory.dropCursor(dropCursorOpts), pmHistory.gapCursor());
    }
    if (editorProps) {
        flatPlugins.push(new pmHistory.Plugin({
            props: editorProps,
        }));
    }
    flatPlugins = flatPlugins.filter(Boolean);
    flatPlugins = transformPlugins(flatPlugins);
    if (flatPlugins.some((p) => !(p instanceof pmHistory.Plugin))) {
        utils.bangleWarn('You are either using multiple versions of the library or not returning a Plugin class in your plugins. Investigate :', flatPlugins.find((p) => !(p instanceof pmHistory.Plugin)));
        throw new Error('Invalid plugin');
    }
    validateNodeViews(flatPlugins, specRegistry);
    return flatPlugins;
}
function processInputRules(plugins, { inputRules = true, undoInputRule = true } = {}) {
    let newPlugins = [];
    let match = [];
    plugins.forEach((plugin) => {
        if (plugin instanceof pmHistory.InputRule) {
            match.push(plugin);
            return;
        }
        newPlugins.push(plugin);
    });
    if (inputRules) {
        plugins = [
            ...newPlugins,
            pmHistory.inputRules({
                rules: match,
            }),
        ];
    }
    if (undoInputRule) {
        plugins.push(pmHistory.keymap({
            Backspace: pmHistory.undoInputRule,
        }));
    }
    return plugins;
}
function validateNodeViews(plugins, specRegistry) {
    const nodeViewPlugins = plugins.filter((p) => p.props && p.props.nodeViews);
    const nodeViewNames = new Map();
    for (const plugin of nodeViewPlugins) {
        for (const name of Object.keys(plugin.props.nodeViews)) {
            if (!specRegistry.schema.nodes[name]) {
                utils.bangleWarn(`When loading your plugins, we found nodeView implementation for the node '${name}' did not have a corresponding spec. Check the plugin:`, plugin, 'and your specRegistry', specRegistry);
                throw new Error(`NodeView validation failed. Spec for '${name}' not found.`);
            }
            if (nodeViewNames.has(name)) {
                utils.bangleWarn(`When loading your plugins, we found more than one nodeView implementation for the node '${name}'. Bangle can only have a single nodeView implementation, please check the following two plugins`, plugin, nodeViewNames.get(name));
                throw new Error(`NodeView validation failed. Duplicate nodeViews for '${name}' found.`);
            }
            nodeViewNames.set(name, plugin);
        }
    }
}
function flatten$1(rawPlugins, callbackPayload) {
    const pluginGroupNames = new Set();
    const recurse = (plugins) => {
        if (Array.isArray(plugins)) {
            return plugins.flatMap((p) => recurse(p)).filter(Boolean);
        }
        if (plugins instanceof PluginGroup) {
            if (pluginGroupNames.has(plugins.name)) {
                throw new Error(`Duplicate names of pluginGroups ${plugins.name} not allowed.`);
            }
            pluginGroupNames.add(plugins.name);
            return recurse(plugins.plugins);
        }
        if (typeof plugins === 'function') {
            if (!callbackPayload) {
                throw new Error('Found a function but no payload');
            }
            return recurse(plugins(callbackPayload));
        }
        return plugins;
    };
    return [recurse(rawPlugins), pluginGroupNames];
}

class SpecRegistry {
    constructor(rawSpecs = [], { defaultSpecs = true } = {}) {
        let flattenedSpecs = flatten(rawSpecs);
        flattenedSpecs.forEach(validateSpec);
        const names = new Set(flattenedSpecs.map((r) => r.name));
        if (flattenedSpecs.length !== names.size) {
            utils.bangleWarn('The specRegistry has one or more specs with the same name', flattenedSpecs);
            throw new Error('Duplicate spec error, please check your specRegistry');
        }
        if (defaultSpecs) {
            const defaultSpecsArray = [];
            if (!names.has('paragraph')) {
                defaultSpecsArray.unshift(spec$1());
            }
            if (!names.has('text')) {
                defaultSpecsArray.unshift(spec());
            }
            if (!names.has('doc')) {
                defaultSpecsArray.unshift(spec$2());
            }
            flattenedSpecs = [...defaultSpecsArray, ...flattenedSpecs];
        }
        this._spec = flattenedSpecs;
        this._schema = createSchema(this._spec);
        this._options = Object.fromEntries(this._spec
            .filter((spec) => spec.options)
            .map((spec) => [spec.name, spec.options]));
    }
    get options() {
        return this._options;
    }
    get schema() {
        return this._schema;
    }
    get spec() {
        return this._spec;
    }
}
function createSchema(specRegistry) {
    let nodes = [];
    let marks = [];
    let topNode;
    for (const spec of specRegistry) {
        if (spec.type === 'node') {
            nodes.push([spec.name, spec.schema]);
            if (spec.topNode === true) {
                topNode = spec.name;
            }
        }
        else if (spec.type === 'mark') {
            marks.push([spec.name, spec.schema]);
        }
        else {
            let r = spec;
            throw new Error('Unknown type: ' + r.type);
        }
    }
    return new pmHistory.Schema({
        topNode,
        nodes: Object.fromEntries(nodes),
        marks: Object.fromEntries(marks),
    });
}
function validateSpec(spec) {
    if (!spec.name) {
        utils.bangleWarn("The spec didn't have a name field", spec);
        throw new Error('Invalid spec. Spec must have a name');
    }
    if (!['node', 'mark'].includes(spec.type)) {
        utils.bangleWarn('The spec must be of type node, mark or component ', spec);
        throw new Error('Invalid spec type');
    }
    if (['node', 'mark'].includes(spec.type) && !spec.schema) {
        utils.bangleWarn("The spec of type 'mark' or 'node' must have a schema field", spec);
        throw new Error('Invalid spec schema');
    }
}
function flatten(data) {
    const recurse = (d) => {
        if (Array.isArray(d)) {
            return d
                .flatMap((i) => recurse(i))
                .filter((r) => Boolean(r));
        }
        if (d == null || d === false) {
            return [];
        }
        return [d];
    };
    return recurse(data);
}

class BangleEditorState {
    constructor({ specRegistry, specs, plugins = () => [], initialValue, editorProps, pmStateOpts, pluginMetadata, dropCursorOpts, } = {}) {
        if (specs && specRegistry) {
            throw new Error('Cannot have both specs and specRegistry defined');
        }
        if (!specRegistry) {
            specRegistry = new SpecRegistry(specs);
        }
        if (Array.isArray(plugins)) {
            console.warn('The use plugins as an array is deprecated, please pass a function which returns an array of plugins. Refer: https://bangle.dev/docs/api/core#bangleeditorstate');
        }
        this.specRegistry = specRegistry;
        const schema = this.specRegistry.schema;
        const pmPlugins = pluginLoader(specRegistry, plugins, {
            editorProps,
            metadata: pluginMetadata,
            dropCursorOpts,
        });
        this.pmState = pmHistory.EditorState.create({
            schema,
            doc: createDocument({ schema, content: initialValue }),
            plugins: pmPlugins,
            ...pmStateOpts,
        });
    }
}
const createDocument = ({ schema, content, parseOptions, }) => {
    const emptyDocument = {
        type: 'doc',
        content: [
            {
                type: 'paragraph',
            },
        ],
    };
    if (content == null) {
        return schema.nodeFromJSON(emptyDocument);
    }
    if (content instanceof pmHistory.Node) {
        return content;
    }
    if (typeof content === 'object') {
        return schema.nodeFromJSON(content);
    }
    if (typeof content === 'string') {
        const element = document.createElement('div');
        element.innerHTML = content.trim();
        return pmHistory.DOMParser.fromSchema(schema).parse(element, parseOptions);
    }
    return undefined;
};

class BangleEditor {
    constructor(element, { focusOnInit = true, state, pmViewOpts = {}, }) {
        this.destroyed = false;
        if (!(state instanceof BangleEditorState)) {
            throw new Error('state is required and must be an instance of BangleEditorState');
        }
        this.view = new pmHistory.EditorView(element, {
            state: state.pmState,
            dispatchTransaction: (transaction) => {
                const newState = this.view.state.apply(transaction);
                this.view.updateState(newState);
            },
            attributes: { class: 'bangle-editor' },
            ...pmViewOpts,
        });
        if (focusOnInit) {
            this.focusView();
        }
    }
    destroy() {
        if (this.destroyed) {
            return;
        }
        if (this.view.isDestroyed) {
            this.destroyed = true;
            return;
        }
        this.destroyed = true;
        this.view.destroy();
    }
    focusView() {
        if (utils.isTestEnv || this.view.hasFocus()) {
            return;
        }
        this.view.focus();
    }
    toHTMLString() {
        return utils.toHTMLString(this.view.state);
    }
}

function createElement(spec) {
    const { dom, contentDOM } = pmHistory.DOMSerializer.renderSpec(window.document, spec);
    if (contentDOM) {
        throw new Error('createElement does not support creating contentDOM');
    }
    return dom;
}

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
    const serializer = (node) => JSON.stringify(utils.objectFilter(node.attrs || {}, (_value, key) => !ignoreAttrs.includes(key)));
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

function deepCompare(obj1, obj2) {
    // compare types
    if (typeof obj1 !== typeof obj2) {
        return false;
    }
    // compare properties recursively
    if (typeof obj1 === 'object') {
        if (Array.isArray(obj1) !== Array.isArray(obj2)) {
            return false;
        }
        if (Array.isArray(obj1)) {
            if (obj1.length !== obj2.length) {
                return false;
            }
            for (let i = 0; i < obj1.length; i++) {
                if (!deepCompare(obj1[i], obj2[i])) {
                    return false;
                }
            }
        }
        else {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            if (keys1.length !== keys2.length) {
                return false;
            }
            for (const key of keys1) {
                if (!Object.prototype.hasOwnProperty.call(obj2, key)
                //  || !deepCompare(obj1[key], obj2[key])
                ) {
                    return false;
                }
            }
        }
    }
    else {
        // compare primitive values
        if (obj1 !== obj2) {
            return false;
        }
    }
    // objects are equal
    return true;
}

const renderHandlersCache = new WeakMap();
class BaseNodeView {
    // for pm to get hold of containerDOM
    constructor({ node, view, getPos, decorations, containerDOM, contentDOM, 
    // Defaults to whatever is set by the rendering framework which ideally
    // would have called the method `saveRenderHandlers` before this gets
    // executed.
    renderHandlers = getRenderHandlers(view), }, { selectionSensitive = true } = {}) {
        // by PM
        this._node = node;
        this._view = view;
        this._getPos = getPos;
        this._decorations = decorations;
        this._selected = false;
        if (!renderHandlers) {
            utils.bangleWarn('It appears the view =', view, ' was not associated with renderHandlers. You are either using nodeViews accidentally or have incorrectly setup nodeViews');
            throw new Error('You either did not pass the renderHandlers correct or it cannot find render handlers associated with the view.');
        }
        this.renderHandlers = renderHandlers;
        // by the implementor
        this.containerDOM = containerDOM;
        this.contentDOM = contentDOM;
        if (this.contentDOM) {
            // This css rule makes sure the content dom has non-zero width
            // so that folks can type inside it
            this.contentDOM.classList.add('bangle-nv-content');
        }
        if (this.containerDOM) {
            this.containerDOM.classList.add('bangle-nv-container');
        }
        if (this._node.type.isAtom && this.contentDOM) {
            throw new Error('An atom node cannot have a contentDOM');
        }
        this.opts = {
            selectionSensitive,
        };
        this.renderHandlers.create(this, this.getNodeViewProps());
    }
    // this exists as the name `dom` is too ambiguous
    get dom() {
        return this.containerDOM;
    }
    getAttrs() {
        return this._node.attrs;
    }
    getNodeViewProps() {
        return {
            node: this._node,
            view: this._view,
            getPos: this._getPos,
            decorations: this._decorations,
            selected: this._selected,
            attrs: this._node.attrs,
            updateAttrs: (attrs) => {
                this._view.dispatch(updateAttrs(this._getPos(), this._node, attrs, this._view.state.tr));
            },
        };
    }
}
// TODO this is adds unneeded abstraction
//    maybe we can lessen the amount of things it is doing
//    and the abstraction.
class NodeView extends BaseNodeView {
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
    renderHandlers, }) {
        return new pmHistory.Plugin({
            key: new pmHistory.PluginKey(name + 'NodeView'),
            props: {
                nodeViews: {
                    [name]: (node, view, getPos, decorations) => {
                        const containerDOM = createElement(containerDOMSpec);
                        let contentDOM;
                        if (contentDOMSpec) {
                            contentDOM = createElement(contentDOMSpec);
                        }
                        // getPos for custom marks is boolean
                        return new NodeView({
                            node,
                            view,
                            getPos,
                            decorations,
                            containerDOM,
                            contentDOM,
                            renderHandlers,
                        });
                    },
                },
            },
        });
    }
    deselectNode() {
        this.containerDOM.classList.remove('ProseMirror-selectednode');
        this._selected = false;
        this.renderHandlers.update(this, this.getNodeViewProps());
    }
    // }
    destroy() {
        this.renderHandlers.destroy(this, this.getNodeViewProps());
        this.containerDOM = undefined;
        this.contentDOM = undefined;
    }
    // PM essentially works by watching mutation and then syncing the two states: its own and the DOM.
    ignoreMutation(mutation) {
        // For PM an atom node is a black box, what happens inside it are of no concern to PM
        // and should be ignored.
        if (this._node.type.isAtom) {
            return true;
        }
        // donot ignore a selection type mutation
        if (mutation.type === 'selection') {
            return false;
        }
        // if a child of containerDOM (the one handled by PM)
        // has any mutation, do not ignore it
        if (this.containerDOM.contains(mutation.target)) {
            return false;
        }
        // if the contentDOM itself was the target
        // do not ignore it. This is important for schema where
        // content: 'inline*' and you end up delete all the content with backspace
        // PM needs to step in and create an empty node.
        if (mutation.target === this.contentDOM) {
            return false;
        }
        return true;
    }
    selectNode() {
        this.containerDOM.classList.add('ProseMirror-selectednode');
        this._selected = true;
        this.renderHandlers.update(this, this.getNodeViewProps());
    }
    update(node, decorations) {
        // https://github.com/ProseMirror/prosemirror/issues/648
        if (this._node.type !== node.type) {
            return false;
        }
        if (this._node === node && this._decorations === decorations) {
            return true;
        }
        this._node = node;
        this._decorations = decorations;
        this.renderHandlers.update(this, this.getNodeViewProps());
        return true;
    }
}
function saveRenderHandlers(editorContainer, handlers) {
    if (renderHandlersCache.has(editorContainer) &&
        !deepCompare(renderHandlersCache.get(editorContainer), handlers)) {
        throw new Error('It looks like renderHandlers were already set by someone else.');
    }
    renderHandlersCache.set(editorContainer, handlers);
}
function getRenderHandlers(view) {
    // TODO this assumes parentNode is one level above root
    //   lets make sure it always is or rewrite this to
    //    traverse the ancestry.
    let editorContainer = view.dom.parentNode;
    const handlers = renderHandlersCache.get(editorContainer);
    return handlers;
}
function updateAttrs(pos, node, newAttrs, tr) {
    if (pos === undefined) {
        return tr;
    }
    return tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        ...newAttrs,
    });
}

// components
const criticalComponents = {
    doc,
    paragraph,
    text,
    history,
    editorStateCounter,
};

Object.defineProperty(exports, 'Plugin', {
    enumerable: true,
    get: function () { return pmHistory.Plugin; }
});
Object.defineProperty(exports, 'PluginKey', {
    enumerable: true,
    get: function () { return pmHistory.PluginKey; }
});
exports.BangleEditor = BangleEditor;
exports.BangleEditorState = BangleEditorState;
exports.NodeView = NodeView;
exports.SpecRegistry = SpecRegistry;
exports.createElement = createElement;
exports.criticalComponents = criticalComponents;
exports.doc = doc;
exports.domSerializationHelpers = domSerializationHelpers;
exports.editorStateCounter = editorStateCounter;
exports.getRenderHandlers = getRenderHandlers;
exports.history = history;
exports.paragraph = paragraph;
exports.saveRenderHandlers = saveRenderHandlers;
exports.text = text;
