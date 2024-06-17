import { DOMSerializer, PluginKey, Plugin as Plugin$1, NodeSelection, InputRule, TextSelection, keymap, Fragment, Node, Selection } from '@bangle.dev/pm';
import { Plugin } from '@bangle.dev/core';
import { bangleWarn, createObject, filter, assertNotUndefined, findFirstMarkPosition, safeInsert, isChromeWithSelectionBug } from '@bangle.dev/utils';
import arrow from '@popperjs/core/lib/modifiers/arrow';
import flip from '@popperjs/core/lib/modifiers/flip';
import offset from '@popperjs/core/lib/modifiers/offset';
import popperOffsets from '@popperjs/core/lib/modifiers/popperOffsets';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { createPopper } from '@popperjs/core/lib/popper-lite';

function createTooltipDOM(tooltipDOMSpec = [
    'div',
    {
        class: 'bangle-tooltip',
        role: 'tooltip',
    },
    [
        'div',
        {
            class: 'bangle-tooltip-content',
        },
        0,
    ],
], arrow = false) {
    const { dom, contentDOM } = DOMSerializer.renderSpec(window.document, tooltipDOMSpec);
    if (arrow && !dom.querySelector('.bangle-tooltip-arrow')) {
        const arrowElement = DOMSerializer.renderSpec(window.document, [
            'div',
            {
                'class': 'bangle-tooltip-arrow',
                'data-popper-arrow': '',
            },
        ]);
        dom.appendChild(arrowElement.dom);
    }
    return { dom, contentDOM };
}

const plugins$2 = tooltipPlacement;
const rem = typeof window === 'undefined'
    ? 12
    : parseFloat(getComputedStyle(document.documentElement).fontSize);
function tooltipPlacement({ stateKey, renderOpts: { tooltipDOMSpec, placement = 'top', getReferenceElement, getScrollContainer = (view) => {
    return view.dom.parentElement;
}, onUpdateTooltip = (_state, _dispatch, _view) => { }, onHideTooltip = (_state, _dispatch, _view) => { }, tooltipOffset = () => {
    return [0, 0.5 * rem];
}, fallbackPlacements = ['bottom', 'top'], customPopperModifiers, }, }) {
    const plugin = new Plugin({
        view: (view) => {
            return new TooltipPlacementView(view);
        },
    });
    class TooltipPlacementView {
        constructor(view) {
            this.popperInstance = null;
            this._view = view;
            const { dom: tooltipDOM } = createTooltipDOM(tooltipDOMSpec);
            this._tooltip = tooltipDOM;
            this._scrollContainerDOM = getScrollContainer(view);
            // TODO should this be this plugins responsibility
            this._view.dom.parentNode.appendChild(this._tooltip);
            const pluginState = stateKey.getState(view.state);
            validateState(pluginState);
            // if the initial state is to show, setup the tooltip
            if (pluginState.show) {
                this._showTooltip();
                return;
            }
        }
        destroy() {
            if (this.popperInstance) {
                this.popperInstance.destroy();
                this.popperInstance = null;
            }
            this._view.dom.parentNode.removeChild(this._tooltip);
        }
        update(view, prevState) {
            const pluginState = stateKey.getState(view.state);
            if (pluginState === stateKey.getState(prevState)) {
                return;
            }
            if (pluginState.show) {
                onUpdateTooltip.call(this, view.state, view.dispatch, view);
                this._showTooltip();
            }
            else {
                this._hideTooltip();
            }
        }
        _createPopperInstance(view) {
            if (this.popperInstance) {
                return;
            }
            const showTooltipArrow = this._tooltip.querySelector('[data-popper-arrow]');
            const defaultModifiers = [
                offset,
                preventOverflow,
                flip,
                {
                    name: 'offset',
                    options: {
                        offset: (popperState) => {
                            return tooltipOffset(popperState);
                        },
                    },
                },
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements,
                        padding: 10,
                    },
                },
                {
                    name: 'preventOverflow',
                    options: {
                        boundary: this._scrollContainerDOM,
                    },
                },
                popperOffsets,
                showTooltipArrow ? arrow : undefined,
                showTooltipArrow
                    ? {
                        name: 'arrow',
                        options: {
                            element: showTooltipArrow,
                        },
                    }
                    : undefined,
            ].filter(Boolean);
            this.popperInstance = createPopper(getReferenceElement(view, this._tooltip, this._scrollContainerDOM), this._tooltip, {
                placement,
                modifiers: customPopperModifiers
                    ? customPopperModifiers(view, this._tooltip, this._scrollContainerDOM, defaultModifiers)
                    : defaultModifiers,
            });
            onUpdateTooltip.call(this, view.state, view.dispatch, view);
        }
        _hideTooltip() {
            if (this.popperInstance) {
                this._tooltip.removeAttribute('data-show');
                this.popperInstance.destroy();
                this.popperInstance = null;
                onHideTooltip.call(this, this._view.state, this._view.dispatch, this._view);
            }
        }
        _showTooltip() {
            this._tooltip.setAttribute('data-show', '');
            this._createPopperInstance(this._view);
            this.popperInstance.update();
        }
    }
    return plugin;
}
function validateState(state) {
    if (typeof state.show !== 'boolean') {
        bangleWarn(`Tooltip must be controlled by a plugin having a boolean field "show" in its state, but received the state=`, state);
        throw new Error('"show" field required.');
    }
}

var tooltipPlacement$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    plugins: plugins$2
});

const plugins$1 = selectionTooltip;
const commands$1 = {
    updateSelectionTooltipType,
    hideSelectionTooltip,
    queryIsSelectionTooltipActive,
    querySelectionTooltipType,
};
let log = () => { };
function selectionTooltip({ key = new PluginKey('selectionTooltipPlugin'), calculateType = (state, _prevType) => {
    return state.selection.empty ? null : 'default';
}, tooltipRenderOpts = {}, }) {
    return () => {
        // - We are creating tooltipDOMSpec inside the callback because if we create outside
        //   it might get reused by multiple view instances if the caller of
        //   selectionTooltip is not careful and does not make a new selectionTooltip() call.
        //   Though this doesn't mitigate the risk of caller using real
        //   dom instances in the `tooltipRenderOpts.tooltipDOMSpec`.
        // - We are converting to DOM elements so that their instances
        //   can be shared across plugins.
        const tooltipDOMSpec = createTooltipDOM(tooltipRenderOpts.tooltipDOMSpec);
        return [
            selectionTooltipState({
                key: key,
                tooltipDOMSpec,
                calculateType,
            }),
            selectionTooltipController({ stateKey: key }),
            plugins$2({
                stateKey: key,
                renderOpts: {
                    ...tooltipRenderOpts,
                    getReferenceElement: getSelectionReferenceElement,
                    tooltipDOMSpec,
                },
            }),
        ];
    };
}
function selectionTooltipState({ key, calculateType, tooltipDOMSpec, }) {
    return new Plugin$1({
        key,
        state: {
            init: (_, state) => {
                const type = calculateType(state, null);
                return {
                    type,
                    tooltipContentDOM: tooltipDOMSpec.contentDOM,
                    // For tooltipPlacement plugin
                    show: typeof type === 'string',
                    // helpers
                    calculateType,
                };
            },
            apply: (tr, pluginState) => {
                const meta = tr.getMeta(key);
                if (meta === undefined) {
                    return pluginState;
                }
                // Do not change object reference if 'type' was and is null
                if (meta.type == null && pluginState.type == null) {
                    return pluginState;
                }
                log('update tooltip state to ', meta.type);
                return {
                    ...pluginState,
                    type: meta.type,
                    show: typeof meta.type === 'string',
                };
            },
        },
    });
}
function selectionTooltipController({ stateKey }) {
    let mouseDown = false;
    return new Plugin$1({
        props: {
            handleDOMEvents: {
                mousedown: (_view, _event) => {
                    mouseDown = true;
                    return false;
                },
                mouseup: (view, _event) => {
                    mouseDown = false;
                    _syncTooltipOnUpdate(stateKey)(view.state, view.dispatch, view);
                    return false;
                },
            },
        },
        view() {
            return {
                update(view, lastState) {
                    const state = view.state;
                    if (mouseDown || lastState === state) {
                        return;
                    }
                    if (lastState &&
                        lastState.doc.eq(state.doc) &&
                        lastState.selection.eq(state.selection)) {
                        return;
                    }
                    return _syncTooltipOnUpdate(stateKey)(view.state, view.dispatch, view);
                },
            };
        },
    });
}
function getSelectionReferenceElement(view) {
    return {
        getBoundingClientRect: () => {
            const { selection } = view.state;
            let { head, from } = selection;
            // since head is dependent on the users choice of direction,
            // it is not always equal to `from`.
            // For textSelections we want to show the tooltip at head of the
            // selection.
            // But for NodeSelection we always want `from` since, if we go with `head`
            // coordsAtPos(head) might get the position `to` in head, resulting in
            // incorrectly getting position of the node after the selected Node.
            const pos = selection instanceof NodeSelection ? from : head;
            const start = view.coordsAtPos(pos);
            let { top, bottom, left, right } = start;
            let width = right - left;
            // Not sure why, but coordsAtPos does not return the correct
            // width of the element, so doing this to override it.
            if (selection instanceof NodeSelection) {
                const domNode = view.nodeDOM(pos);
                width = domNode ? domNode.clientWidth : width;
            }
            return {
                width,
                height: bottom - top,
                top: top,
                right: right,
                bottom: bottom,
                left: left,
            };
        },
    };
}
function _syncTooltipOnUpdate(key) {
    return (state, dispatch, view) => {
        const tooltipState = key.getState(state);
        const newType = tooltipState.calculateType(state, tooltipState.type);
        if (typeof newType === 'string') {
            return updateSelectionTooltipType(key, newType)(state, dispatch, view);
        }
        // Only hide if it is not already hidden
        if (newType == null && tooltipState.type != null) {
            return hideSelectionTooltip(key)(state, dispatch, view);
        }
        return false;
    };
}
/** Commands  */
// This command will rerender if you call it with the type
// it already has. This is done in order to update the position of a tooltip.
function updateSelectionTooltipType(key, type) {
    return (state, dispatch, _view) => {
        if (dispatch) {
            dispatch(state.tr.setMeta(key, { type }).setMeta('addToHistory', false));
        }
        return true;
    };
}
function hideSelectionTooltip(key) {
    return (state, dispatch, _view) => {
        if (dispatch) {
            dispatch(state.tr.setMeta(key, { type: null }).setMeta('addToHistory', false));
        }
        return true;
    };
}
function queryIsSelectionTooltipActive(key) {
    return (state) => {
        const pluginState = key.getState(state);
        return pluginState && typeof pluginState.type === 'string' ? true : false;
    };
}
function querySelectionTooltipType(key) {
    return (state) => {
        const pluginState = key.getState(state);
        return pluginState && pluginState.type;
    };
}

var selectionTooltip$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    plugins: plugins$1,
    commands: commands$1,
    _syncTooltipOnUpdate: _syncTooltipOnUpdate,
    updateSelectionTooltipType: updateSelectionTooltipType,
    hideSelectionTooltip: hideSelectionTooltip,
    queryIsSelectionTooltipActive: queryIsSelectionTooltipActive,
    querySelectionTooltipType: querySelectionTooltipType
});

// ProseMirror uses the Unicode Character 'OBJECT REPLACEMENT CHARACTER' (U+FFFC) as text representation for
// leaf nodes, i.e. nodes that don't have any content or text property (e.g. hardBreak, emoji)
// It was introduced because of https://github.com/ProseMirror/prosemirror/issues/262
// This can be used in an input rule regex to be able to include or exclude such nodes.
const leafNodeReplacementCharacter = '\ufffc';
function triggerInputRule(schema, markName, trigger) {
    const regexStart = new RegExp(`(^|[.!?\\s${leafNodeReplacementCharacter}])(${escapeRegExp(trigger)})$`);
    const startRule = new InputRule(regexStart, (editorState, match) => {
        /**
         * Why using match 2 and 3?  Regex:
         * (allowed characters before trigger)(joined|triggers|(sub capture groups))
         *            match[1]                     match[2]          match[3] – optional
         */
        const trigger = match[3] || match[2];
        if (!trigger) {
            return null;
        }
        const mark = schema.mark(markName, { trigger });
        const { tr, selection } = editorState;
        // set the selection to cover the trigger
        // when the trigger is bigger than 1 char.
        // for 1 char length you dont need a non empty selection.
        if (trigger.length > 1) {
            const textSelection = TextSelection.create(tr.doc, selection.from, selection.from - trigger.length + 1);
            tr.setSelection(textSelection);
        }
        const marks = selection.$from.marks(); // selection would tell the cursor position, in this case from == to as no selection
        return tr.replaceSelectionWith(schema.text(trigger, [mark, ...marks]), false);
    });
    return startRule;
}
/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);
/**
 * Escapes the `RegExp` special characters "^", "$", "\", ".", "*", "+",
 * "?", "(", ")", "[", "]", "{", "}", and "|" in `string`.
 *
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @see escape, escapeRegExp, unescape
 * @example
 *
 * escapeRegExp('[lodash](https://lodash.com/)')
 * // => '\[lodash\]\(https://lodash\.com/\)'
 */
function escapeRegExp(string) {
    return string && reHasRegExpChar.test(string)
        ? string.replace(reRegExpChar, '\\$&')
        : string || '';
}

const spec = specFactory;
const plugins = pluginsFactory;
const commands = {
    queryTriggerText,
    queryIsSuggestTooltipActive,
    replaceSuggestMarkWith,
    incrementSuggestTooltipCounter,
    decrementSuggestTooltipCounter,
    resetSuggestTooltipCounter,
};
const defaultKeys = {
    select: 'Enter',
    up: 'ArrowUp',
    down: 'ArrowDown',
    hide: 'Escape',
    right: undefined,
    left: undefined,
};
function specFactory({ markName, trigger, markColor = '#005893', }) {
    return {
        name: markName,
        type: 'mark',
        schema: {
            inclusive: true,
            excludes: '_',
            group: 'suggestTriggerMarks',
            parseDOM: [{ tag: `span[data-${markName}]` }],
            toDOM: (mark) => {
                return [
                    'span',
                    {
                        'data-bangle-name': markName,
                        'data-suggest-trigger': mark.attrs['trigger'],
                        'style': `color: ${markColor}`,
                    },
                ];
            },
            attrs: {
                trigger: { default: trigger },
            },
        },
        markdown: {
            toMarkdown: {
                open: '',
                close: '',
                mixable: true,
            },
        },
    };
}
function pluginsFactory({ key = new PluginKey('suggest_tooltip'), markName, trigger, tooltipRenderOpts, keybindings = defaultKeys, onEnter = (state, dispatch, view) => {
    return removeSuggestMark(key)(state, dispatch, view);
}, onArrowDown = incrementSuggestTooltipCounter(key), onArrowUp = decrementSuggestTooltipCounter(key), onEscape = (state, dispatch, view) => {
    return removeSuggestMark(key)(state, dispatch, view);
}, onArrowLeft, onArrowRight, }) {
    return ({ schema }) => {
        const isActiveCheck = queryIsSuggestTooltipActive(key);
        return [
            new Plugin$1({
                key,
                state: {
                    init(_, _state) {
                        return {
                            trigger,
                            markName,
                            triggerText: '',
                            show: false,
                            counter: 0,
                        };
                    },
                    apply(tr, pluginState, _oldState, newState) {
                        const meta = tr.getMeta(key);
                        if (meta === undefined) {
                            return pluginState;
                        }
                        if (meta.type === 'RENDER_TOOLTIP') {
                            return {
                                ...pluginState,
                                // Cannot use queryTriggerText because it relies on
                                // reading the pluginState which will not be there in newState.
                                triggerText: getTriggerText(newState, markName, trigger),
                                show: true,
                            };
                        }
                        if (meta.type === 'HIDE_TOOLTIP') {
                            // Do not change object reference if show was and is false
                            if (pluginState.show === false) {
                                return pluginState;
                            }
                            return {
                                ...pluginState,
                                triggerText: '',
                                show: false,
                                counter: 0,
                            };
                        }
                        if (meta.type === 'INCREMENT_COUNTER') {
                            return { ...pluginState, counter: pluginState.counter + 1 };
                        }
                        if (meta.type === 'RESET_COUNTER') {
                            return { ...pluginState, counter: 0 };
                        }
                        if (meta.type === 'UPDATE_COUNTER') {
                            return { ...pluginState, counter: meta.value };
                        }
                        if (meta.type === 'DECREMENT_COUNTER') {
                            return { ...pluginState, counter: pluginState.counter - 1 };
                        }
                        throw new Error('Unknown type');
                    },
                },
            }),
            plugins$2({
                stateKey: key,
                renderOpts: {
                    ...tooltipRenderOpts,
                    getReferenceElement: referenceElement((state) => {
                        const markType = schema.marks[markName];
                        assertNotUndefined(markType, `markType ${markName} not found`);
                        const { selection } = state;
                        return findFirstMarkPosition(markType, state.doc, selection.from - 1, selection.to);
                    }),
                },
            }),
            triggerInputRule(schema, markName, trigger),
            tooltipController({
                trigger,
                markName,
                key,
            }),
            keybindings &&
                keymap(createObject([
                    [keybindings.select, filter(isActiveCheck, onEnter)],
                    [keybindings.up, filter(isActiveCheck, onArrowUp)],
                    [keybindings.down, filter(isActiveCheck, onArrowDown)],
                    [keybindings.left, filter(isActiveCheck, onArrowLeft)],
                    [keybindings.right, filter(isActiveCheck, onArrowRight)],
                    [keybindings.hide, filter(isActiveCheck, onEscape)],
                ])),
        ];
    };
}
function referenceElement(getActiveMarkPos) {
    return (view, _tooltipDOM, _scrollContainerDOM) => {
        return {
            getBoundingClientRect: () => {
                let state = view.state;
                const markPos = getActiveMarkPos(state);
                // add by + so that we get the position right after trigger
                const startPos = markPos.start > -1 ? markPos.start + 1 : 0;
                const start = view.coordsAtPos(startPos);
                // if the suggestMark text spanned two lines, we want to show the tooltip based on the end pos
                // so that it doesn't hide the text
                const end = view.coordsAtPos(markPos.end > -1 ? markPos.end : startPos);
                let { left, right } = start;
                let { top, bottom } = end;
                const x = left;
                const y = top;
                const width = right - left;
                const height = bottom - top;
                return new DOMRect(x, y, width, height);
            },
        };
    };
}
function tooltipController({ key, trigger, markName, }) {
    return new Plugin$1({
        view() {
            return {
                update: (view, lastState) => {
                    const { state } = view;
                    if (lastState === state || !state.selection.empty) {
                        return;
                    }
                    const markType = state.schema.marks[markName];
                    assertNotUndefined(markType, `markType ${markName} not found`);
                    if (lastState.doc.eq(state.doc) &&
                        state.selection.eq(lastState && lastState.selection) &&
                        // This is a shorthand for checking if the stored mark  of `markType`
                        // has changed within the last step. If it has we need to update the state
                        isStoredMark(state, markType) === isStoredMark(lastState, markType)) {
                        return;
                    }
                    const isMarkActive = isSuggestMarkActive(markName)(state);
                    // clear the mark if the user delete the trigger but remaining mark text
                    // stayed.
                    // Example `<mark>/hello</mark>` --(user deletes the /)-> `<mark>hello</mark>`
                    // -> (clear) ->  hello
                    if (isMarkActive && !doesQueryHaveTrigger(state, markType, trigger)) {
                        removeSuggestMark(key)(state, view.dispatch, view);
                        return;
                    }
                    if (!isMarkActive) {
                        // performance optimization to prevent unnecessary dispatches
                        if (key.getState(state).show === true) {
                            hideSuggestionsTooltip(key)(view.state, view.dispatch, view);
                        }
                        return;
                    }
                    renderSuggestionsTooltip(key)(view.state, view.dispatch, view);
                    return;
                },
            };
        },
    });
}
function isStoredMark(state, markType) {
    return state && state.storedMarks && markType.isInSet(state.storedMarks);
}
function isSuggestMarkActive(markName) {
    return (state) => {
        const { from, to } = state.selection;
        const markType = state.schema.marks[markName];
        assertNotUndefined(markType, `markType ${markName} not found`);
        return state.doc.rangeHasMark(from - 1, to, markType);
    };
}
function doesQueryHaveTrigger(state, markType, trigger) {
    const { nodeBefore } = state.selection.$from;
    // nodeBefore in a new line (a new paragraph) is null
    if (!nodeBefore) {
        return false;
    }
    const suggestMark = markType.isInSet(nodeBefore.marks || []);
    // suggestMark is undefined if you delete the trigger while keeping rest of the query alive
    if (!suggestMark) {
        return false;
    }
    const textContent = nodeBefore.textContent || '';
    return textContent.includes(trigger);
}
function renderSuggestionsTooltip(key) {
    return (state, dispatch, _view) => {
        if (dispatch) {
            dispatch(state.tr
                .setMeta(key, { type: 'RENDER_TOOLTIP' })
                .setMeta('addToHistory', false));
        }
        return true;
    };
}
function hideSuggestionsTooltip(key) {
    return (state, dispatch, _view) => {
        if (dispatch) {
            dispatch(state.tr
                .setMeta(key, { type: 'HIDE_TOOLTIP' })
                .setMeta('addToHistory', false));
        }
        return true;
    };
}
function getTriggerText(state, markName, trigger) {
    const markType = state.schema.marks[markName];
    assertNotUndefined(markType, `markType ${markName} not found`);
    const { nodeBefore } = state.selection.$from;
    // nodeBefore in a new line (a new paragraph) is null
    if (!nodeBefore) {
        return '';
    }
    const suggestMark = markType.isInSet(nodeBefore.marks || []);
    // suggestMark is undefined if you delete the trigger while keeping rest of the query alive
    if (!suggestMark) {
        return '';
    }
    const textContent = nodeBefore.textContent || '';
    return (textContent
        // eslint-disable-next-line no-control-regex
        .replace(/^([^\x00-\xFF]|[\s\n])+/g, '')
        .replace(trigger, ''));
}
/** Commands */
function queryTriggerText(key) {
    return (state) => {
        const { trigger, markName } = key.getState(state);
        return getTriggerText(state, markName, trigger);
    };
}
function queryIsSuggestTooltipActive(key) {
    return (state) => {
        return key.getState(state) && key.getState(state).show;
    };
}
function replaceSuggestMarkWith(key, maybeNode) {
    return (state, dispatch, view) => {
        const { markName } = key.getState(state);
        const { schema } = state;
        const markType = schema.marks[markName];
        assertNotUndefined(markType, `markType ${markName} not found`);
        const { selection } = state;
        const queryMark = findFirstMarkPosition(markType, state.doc, selection.from - 1, selection.to);
        if (!queryMark || queryMark.start === -1) {
            return false;
        }
        const getTr = () => {
            const { start, end } = queryMark;
            let tr = state.tr
                .removeStoredMark(markType)
                .replaceWith(start, end, Fragment.empty);
            if (!maybeNode) {
                return tr;
            }
            const isInputFragment = maybeNode instanceof Fragment;
            let node;
            try {
                node =
                    maybeNode instanceof Node || isInputFragment
                        ? maybeNode
                        : typeof maybeNode === 'string'
                            ? state.schema.text(maybeNode)
                            : Node.fromJSON(state.schema, maybeNode);
            }
            catch (e) {
                console.error(e);
                return tr;
            }
            if (node.isText) {
                tr = tr.replaceWith(start, start, node);
            }
            else if (node.isBlock) {
                tr = safeInsert(node)(tr);
            }
            else if (node.isInline || isInputFragment) {
                const fragment = isInputFragment
                    ? node
                    : Fragment.fromArray([node, state.schema.text(' ')]);
                tr = tr.replaceWith(start, start, fragment);
                // This problem affects Chrome v58+. See: https://github.com/ProseMirror/prosemirror/issues/710
                if (isChromeWithSelectionBug) {
                    const selection = document.getSelection();
                    if (selection) {
                        selection.empty();
                    }
                }
                // Placing cursor after node + space.
                tr = tr.setSelection(Selection.near(tr.doc.resolve(start + fragment.size)));
                return tr;
            }
            return tr;
        };
        const tr = getTr();
        if (dispatch) {
            view === null || view === void 0 ? void 0 : view.focus();
            dispatch(tr);
        }
        return true;
    };
}
function removeSuggestMark(key) {
    return (state, dispatch, _view) => {
        const { markName } = key.getState(state);
        const { schema, selection } = state;
        const markType = schema.marks[markName];
        assertNotUndefined(markType, `markType ${markName} not found`);
        const queryMark = findFirstMarkPosition(markType, state.doc, selection.from - 1, selection.to);
        const { start, end } = queryMark;
        if (start === -1 &&
            state.storedMarks &&
            markType.isInSet(state.storedMarks)) {
            if (dispatch) {
                dispatch(state.tr.removeStoredMark(markType));
            }
            return true;
        }
        if (start === -1) {
            return false;
        }
        if (dispatch) {
            dispatch(state.tr
                .removeMark(start, end, markType)
                // stored marks are marks which will be carried forward to whatever
                // the user types next, like if current mark
                // is bold, new input continues being bold
                .removeStoredMark(markType)
                // This helps us avoid the case:
                // when a user deleted the trigger/ in '<suggest_mark>/something</suggest_mark>'
                // and then performs undo.
                // If we do not hide this from history, command z will bring
                // us in the state of `<suggest_mark>something<suggest_mark>` without the trigger `/`
                // and seeing this state `tooltipActivatePlugin` plugin will dispatch a new command removing
                // the mark, hence never allowing the user to command z.
                .setMeta('addToHistory', false));
        }
        return true;
    };
}
function incrementSuggestTooltipCounter(key) {
    return (state, dispatch, _view) => {
        if (dispatch) {
            dispatch(state.tr
                .setMeta(key, { type: 'INCREMENT_COUNTER' })
                .setMeta('addToHistory', false));
        }
        return true;
    };
}
function decrementSuggestTooltipCounter(key) {
    return (state, dispatch, _view) => {
        if (dispatch) {
            dispatch(state.tr
                .setMeta(key, { type: 'DECREMENT_COUNTER' })
                .setMeta('addToHistory', false));
        }
        return true;
    };
}
function resetSuggestTooltipCounter(key) {
    return (state, dispatch, _view) => {
        if (dispatch) {
            dispatch(state.tr
                .setMeta(key, { type: 'RESET_COUNTER' })
                .setMeta('addToHistory', false));
        }
        return true;
    };
}
function updateSuggestTooltipCounter(key, counter) {
    return (state, dispatch, _view) => {
        if (dispatch) {
            dispatch(state.tr
                .setMeta(key, { type: 'UPDATE_COUNTER', value: counter })
                .setMeta('addToHistory', false));
        }
        return true;
    };
}

var suggestTooltip = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec,
    plugins: plugins,
    commands: commands,
    defaultKeys: defaultKeys,
    queryTriggerText: queryTriggerText,
    queryIsSuggestTooltipActive: queryIsSuggestTooltipActive,
    replaceSuggestMarkWith: replaceSuggestMarkWith,
    removeSuggestMark: removeSuggestMark,
    incrementSuggestTooltipCounter: incrementSuggestTooltipCounter,
    decrementSuggestTooltipCounter: decrementSuggestTooltipCounter,
    resetSuggestTooltipCounter: resetSuggestTooltipCounter,
    updateSuggestTooltipCounter: updateSuggestTooltipCounter
});

export { createTooltipDOM, selectionTooltip$1 as selectionTooltip, suggestTooltip, tooltipPlacement$1 as tooltipPlacement };
