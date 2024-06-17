'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pm = require('@bangle.dev/pm');
var utils = require('@bangle.dev/utils');
var core = require('@bangle.dev/core');

/**
 */
const supportsEvent = (() => {
    if (typeof Event !== 'undefined') {
        try {
            // eslint-disable-next-line no-unused-expressions
            new Event('emit-init');
        }
        catch (e) {
            return false;
        }
    }
    return true;
})();
/**
 * Build an event object in a cross-browser manner
 *
 * Usage:
 *    const event = createEvent('paste', options);
 */
const createEvent = (name, options = {}) => {
    let event;
    if (options.bubbles === undefined) {
        options.bubbles = true;
    }
    if (options.cancelable === undefined) {
        options.cancelable = true;
    }
    if (options.composed === undefined) {
        options.composed = true;
    }
    if (supportsEvent) {
        event = new Event(name, options);
    }
    else {
        event = document.createEvent('Event');
        event.initEvent(name, options.bubbles, options.cancelable);
    }
    return event;
};

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
function dispatchPasteEvent(editorView, content) {
    const event = createEvent('paste');
    const clipboardData = {
        getData(type) {
            if (type === 'text/plain') {
                return content.plain;
            }
            if (type === 'text/html') {
                return content.html;
            }
            if (type === 'text/uri-list') {
                return content['uri-list'];
            }
            return;
        },
        types: content.types || [],
        files: content.files || [],
        items: content.items || null,
    };
    // Reason: https://github.com/ProseMirror/prosemirror-view/blob/9d2295d03c2d17357213371e4d083f0213441a7e/bangle-play/input.js#L379-L384
    if ((utils.browser.ie && utils.browser.ie_version < 15) || utils.browser.ios) {
        return false;
    }
    Object.defineProperty(event, 'clipboardData', { value: clipboardData });
    editorView.dispatchEvent(event);
    return event;
}

// So the basic editing operations are not handled
// by PM actively and instead it waits for the browser
// to do its thing and then sync it with its view.
// Some of the key operations like pressing Enter, Backspace etc
// need to use the functions below to simulate the operation.
// Inspiration: https://github.com/prosemirror/prosemirror-view/blob/b57ba7716918de26b17d2550f99b4041b1bcee5b/test%2Ftest-domchange.js#L89
function sendKeyToPm(editorView, keys) {
    const keyCodes = {
        'Enter': 13,
        'Backspace': 8,
        'Tab': 9,
        'Shift': 16,
        'Ctrl': 17,
        'Alt': 18,
        'Pause': 19,
        'CapsLock': 20,
        'Esc': 27,
        'Space': 32,
        'PageUp': 63276,
        'PageDown': 63277,
        'End': 63275,
        'Home': 63273,
        'Left': 63234,
        'Up': 63232,
        'Right': 63235,
        'Down': 63233,
        'PrintScrn': 44,
        'Insert': 63302,
        'Delete': 46,
        ';': 186,
        '=': 187,
        'Mod': 93,
        '*': 106,
        '-': 189,
        '.': 190,
        '/': 191,
        ',': 188,
        '`': 192,
        '[': 219,
        '\\': 220,
        ']': 221,
        "'": 222,
    };
    const event = new CustomEvent('keydown', {
        bubbles: true,
        cancelable: true,
    });
    event.DOM_KEY_LOCATION_LEFT = 1;
    event.DOM_KEY_LOCATION_RIGHT = 2;
    let parts = keys.split(/-(?!'?$)/);
    // set location property of event if Left or Right version of key specified
    let location = 0;
    const locationKeyRegex = /^(Left|Right)(Ctrl|Alt|Mod|Shift|Cmd)$/;
    parts = parts.map((part) => {
        if (part.search(locationKeyRegex) === -1) {
            return part;
        }
        const [, pLocation, pKey] = part.match(locationKeyRegex);
        location =
            pLocation === 'Left'
                ? event.DOM_KEY_LOCATION_LEFT
                : event.DOM_KEY_LOCATION_RIGHT;
        return pKey;
    });
    const modKey = parts.indexOf('Mod') !== -1;
    const cmdKey = parts.indexOf('Cmd') !== -1;
    const ctrlKey = parts.indexOf('Ctrl') !== -1;
    const shiftKey = parts.indexOf('Shift') !== -1;
    const altKey = parts.indexOf('Alt') !== -1;
    const key = parts[parts.length - 1];
    utils.assertNotUndefined(key, 'key should not be undefined');
    // all of the browsers are using the same keyCode for alphabetical keys
    // and it's the uppercased character code in real world
    const code = keyCodes[key] ? keyCodes[key] : key.toUpperCase().charCodeAt(0);
    event.key = key.replace(/Space/g, ' ');
    event.shiftKey = shiftKey;
    event.altKey = altKey;
    event.ctrlKey = ctrlKey || (!utils.browser.mac && modKey);
    event.metaKey = cmdKey || (utils.browser.mac && modKey);
    event.keyCode = code;
    event.which = code;
    event.view = window;
    event.location = location;
    editorView.dispatchEvent(event);
}
async function typeText(view, text) {
    [...text].forEach((character, index) => {
        typeChar(view, character);
    });
}
async function typeChar(view, char) {
    if (!view.someProp('handleTextInput', (f) => f(view, view.state.selection.from, view.state.selection.from, char))) {
        view.dispatch(view.state.tr.insertText(char, view.state.selection.from));
    }
}
function sleep(t = 20) {
    return new Promise((res) => setTimeout(res, t));
}

// Short hand to allow for smaller jsx syntax
// For example instead of `<paragraph>hello world</paragraph>`
// we can write `<para>hello world</para>`
const nodeAlias = {
    para: 'paragraph',
    ul: 'bulletList',
    ol: 'orderedList',
    li: 'listItem',
    codeBlock: 'codeBlock',
    br: 'hardBreak',
    hr: 'horizontalRule',
};
const markAlias = {};
const SELECT_END = ']';
const SELECT_START = '[';
const labelTypes = {
    // Empty Selection
    '[]': /\[\]/,
    // Selection anchor
    [SELECT_START]: /\[(?!\])/,
    // Selection head
    [SELECT_END]: /(?<!\[)\]/,
};
const nodeLabelPosMap = new WeakMap();
const isNotValidLabel = (label) => !Boolean(labelTypes[label]);
const updateMap = (map, key, value) => map.set(key, safeMergeObject(map.get(key), value));
const getDocLabels = utils.weakCache((doc) => {
    let result = {};
    doc.nodesBetween(0, doc.content.size, (node, pos) => {
        const found = nodeLabelPosMap.get(node);
        if (!found) {
            return;
        }
        const resolvedLabels = utils.objectMapValues(found, (v) => {
            return typeof v === 'function'
                ? v(pos, node.content.content)
                : pos + v;
        });
        result = safeMergeObject(result, resolvedLabels);
    });
    return result;
});
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
function psx(name, attrs, ...childrenRaw) {
    return (schema) => {
        const children = []
            .concat(...childrenRaw)
            .map((c) => (typeof c === 'string' ? c : c(schema)));
        const hydratedChildren = children.flatMap((child) => {
            if (typeof child !== 'string') {
                return child;
            }
            const { text, labels } = matchLabel(child);
            if (!labels) {
                return schema.text(child);
            }
            // We cannot have empty string as a valid TextNode in Prosemirror.
            // For example in:
            //  <doc>
            //     <para>foo</para>
            //     <para>[]</para>
            //     <para>bar</para>
            //  </doc>
            // Unlike first and third paragraph, in the second paragraph, we do not create a TextNode
            // but instead return the string `[]` directly, so that when parent node
            // creates the Paragraph node, it sets up the position correctly. In this case
            // it will create a selection at start of paragraph node.
            // Note: paragraph nodes can be empty, but not textNodes.
            if (text === '') {
                if (Object.keys(labels).length > 1) {
                    throw new Error('Cannot have multiple labels in an empty node');
                }
                return Object.keys(labels)[0];
            }
            const pmText = schema.text(text);
            updateMap(nodeLabelPosMap, pmText, labels);
            return pmText;
        });
        const nodeSpec = schema.nodes[name] || schema.nodes[nodeAlias[name]];
        if (nodeSpec) {
            const node = nodeSpec.createChecked(attrs || {}, hydratedChildren.filter((r) => isNotValidLabel(r)));
            hydratedChildren.forEach((label, index) => {
                if (isNotValidLabel(label)) {
                    return;
                }
                updateMap(nodeLabelPosMap, node, {
                    [label]: (pos) => {
                        const validChildren = hydratedChildren
                            .slice(0, index)
                            .filter((r) => isNotValidLabel(r));
                        const relPos = validChildren.reduce((prev, cur) => prev + cur.nodeSize, 0);
                        // Add a 1 to put it inside the the node.
                        // for example in A<p>B</p>, pos + relPos will get us A
                        // adding 1 will put us inside.
                        return pos + relPos + 1;
                    },
                });
            });
            return node;
        }
        const markSpec = schema.marks[name] || schema.marks[markAlias[name]];
        if (markSpec) {
            const mark = markSpec.create(attrs || {});
            return hydratedChildren.map((node) => {
                if (mark.type.isInSet(node.marks)) {
                    return node;
                }
                const newNode = node.mark(mark.addToSet(node.marks));
                const labels = nodeLabelPosMap.get(node);
                // forward any labels as we are creating a new node
                updateMap(nodeLabelPosMap, newNode, labels);
                return newNode;
            });
        }
        throw new Error('Cannot find schema for ' + name);
    };
}
function matchLabel(text) {
    const matcher = (regex) => {
        const ranges = utils.matchAllPlus(regex, text);
        const matches = ranges.filter((r) => r.match);
        if (matches.length === 0) {
            return {
                text,
                labels: undefined,
            };
        }
        return {
            text: ranges
                .filter((r) => !r.match)
                .reduce((prev, cur) => prev + cur.subString, ''),
            labels: matches.reduce((prev, r) => {
                let pos = r.start;
                // Reduce selection end position by 1
                // since all of the positions after SELECT_START are off by 1
                // as `[` takes 1 space.
                if (r.subString === SELECT_END &&
                    matches.some((m) => m.subString === SELECT_START)) {
                    pos = pos - 1;
                }
                return safeMergeObject(prev, { [r.subString]: pos });
            }, {}),
        };
    };
    return matcher(new RegExp(Object.values(labelTypes)
        .map((r) => '(' + r.source + ')')
        .join('|'), 'g'));
}
function safeMergeObject(obj1 = {}, obj2 = {}) {
    const culpritKey = Object.keys(obj1).find((key) => hasOwnProperty(obj2, key));
    if (culpritKey) {
        throw new Error(`Key ${culpritKey} already exists `);
    }
    return {
        ...obj1,
        ...obj2,
    };
}
function hasOwnProperty(obj, property) {
    return Object.prototype.hasOwnProperty.call(obj, property);
}

/**
 * @jest-environment jsdom
 */
const mountedEditors = new Set();
if (typeof afterEach === 'function') {
    afterEach(() => {
        [...mountedEditors].forEach((editor) => {
            editor.destroy();
            mountedEditors.delete(editor);
        });
    });
}
/**
 *
 * @param {*} param0
 * @param {SpecRegistry | undefined | Object} param0.specRegistry pass an object to set properties to all default
 *                        specs, for example calling `renderTestEditor({ specRegistry: {heading: {level : 4}}}))`
 *                        will use all the defaultSpecs with heading spec getting the options `{level:4}`.
 * @param {Array<PluginFactory> | undefined | Object} param0.specRegistry passing an object behaves similar to specRegistry param.
 * @param {*} testId
 */
function renderTestEditor({ specRegistry, plugins }, testId = 'test-editor') {
    if (!specRegistry) {
        throw new Error('Please provide SpecRegistry');
    }
    if (!plugins) {
        throw new Error('Please provide Plugins');
    }
    let newPlugins = plugins;
    // To bypass the deprecation of plugin being a function
    plugins = () => newPlugins;
    const container = document.body.appendChild(document.createElement('div'));
    container.setAttribute('data-testid', testId);
    return (testDoc) => {
        let view;
        const editorProps = {
            attributes: { class: 'bangle-editor content' },
        };
        let editor = new core.BangleEditor(container, {
            state: new core.BangleEditorState({ specRegistry, plugins, editorProps }),
        });
        view = editor.view;
        mountedEditors.add(editor);
        let posLabels;
        if (testDoc) {
            posLabels = updateDoc(testDoc);
        }
        function updateDoc(doc) {
            if (!doc) {
                return;
            }
            const editorView = view;
            const dispatch = editorView.dispatch;
            const defaultDoc = doc(editorView.state.schema);
            const tr = editorView.state.tr.replaceWith(0, editorView.state.doc.nodeSize - 2, defaultDoc.content);
            tr.setMeta('addToHistory', false);
            dispatch(tr);
            const positionExists = (position) => typeof position === 'number';
            const posLabels = getDocLabels(defaultDoc);
            if (posLabels) {
                if (positionExists(posLabels['[]'])) {
                    setTextSelection(editorView, posLabels['[]']);
                }
                else if (positionExists(posLabels['[']) ||
                    positionExists(posLabels[']'])) {
                    if (!positionExists(posLabels['[']) ||
                        !positionExists(posLabels[']'])) {
                        throw new Error('`[``]` must come in pair.');
                    }
                    setTextSelection(editorView, posLabels['['], posLabels[']']);
                }
            }
            return posLabels;
        }
        return {
            get editor() {
                return editor;
            },
            get view() {
                return editor === null || editor === void 0 ? void 0 : editor.view;
            },
            container,
            editorState: view.state,
            schema: view.state.schema,
            // TODO deprecate editorView
            editorView: view,
            selection: view.state.selection,
            posLabels,
            updateDoc,
            destroy: () => {
                editor === null || editor === void 0 ? void 0 : editor.destroy();
                editor = null;
            },
            debugString: () => {
                return editor === null || editor === void 0 ? void 0 : editor.view.state.doc.toString();
            },
        };
    };
}
function setTextSelection(view, anchor, head) {
    const { state } = view;
    const tr = state.tr.setSelection(pm.TextSelection.create(state.doc, anchor, head));
    view.dispatch(tr);
}

function setSelectionNear(view, pos) {
    let tr = view.state.tr;
    view.dispatch(tr.setSelection(pm.Selection.near(tr.doc.resolve(pos))));
}

const selectNodeAt = (view, pos) => {
    const tr = view.state.tr;
    view.dispatch(tr.setSelection(pm.NodeSelection.create(tr.doc, pos)));
};
/**
 *
 * @param {*} schema
 * @param {*} psxArray An array of psx nodes eg. [<para>hi</para>, <para>bye</para>]
 */
const createPSXFragment = (schema, psxArray) => {
    return pm.Fragment.fromArray(psxArray.map((r) => r(schema)));
};

exports.createEvent = createEvent;
exports.createPSXFragment = createPSXFragment;
exports.dispatchPasteEvent = dispatchPasteEvent;
exports.getDocLabels = getDocLabels;
exports.psx = psx;
exports.renderTestEditor = renderTestEditor;
exports.selectNodeAt = selectNodeAt;
exports.sendKeyToPm = sendKeyToPm;
exports.setSelectionNear = setSelectionNear;
exports.sleep = sleep;
exports.typeChar = typeChar;
exports.typeText = typeText;
