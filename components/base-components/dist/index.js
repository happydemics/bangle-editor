import { wrappingInputRule, keymap, wrapIn, toggleMark, InputRule, findWrapping, canJoin, TextSelection, ReplaceAroundStep, Slice, Fragment, NodeRange, liftTarget, NodeSelection, autoJoin, wrapInList as wrapInList$1, sinkListItem, liftListItem as liftListItem$1, chainCommands, Selection, textblockTypeInputRule, setBlockType, exitCode, Plugin, PluginKey } from '@bangle.dev/pm';
import { moveNode, copyEmptyCommand, cutEmptyCommand, parentHasDirectParentOfType, jumpToStartOfNode, jumpToEndOfNode } from '@bangle.dev/pm-commands';
import { getNodeType, createObject, findParentNodeOfType, filter, getParaNodeType, insertEmpty, markPasteRule as markPasteRule$1, markInputRule, assertNotUndefined, isMarkActiveInSelection, getListLiftTarget, isRangeOfType, sanitiseSelectionMarksForWrapping, extendDispatch, flatten, compose, isEmptySelectionAtStart, isFirstChildOfParent, hasVisibleContent, isNodeEmpty, hasParentNodeOfType, GapCursorSelection, findCutBefore, findPositionOfNodeBefore, findParentNode, validListParent, validPos, safeInsert, browser, findChildren, getMarkAttrs, matchAllPlus, mapSlice, createElement, domSerializationHelpers } from '@bangle.dev/utils';
import { NodeView } from '@bangle.dev/core';
export { doc, editorStateCounter, history, paragraph, text } from '@bangle.dev/core';

const spec$e = specFactory$e;
const plugins$e = pluginsFactory$e;
const commands$c = {
    queryIsBlockquoteActive,
    wrapInBlockquote,
};
const defaultKeys$b = {
    wrapIn: 'Ctrl-ArrowRight',
    moveDown: 'Alt-ArrowDown',
    moveUp: 'Alt-ArrowUp',
    emptyCopy: 'Mod-c',
    emptyCut: 'Mod-x',
    insertEmptyParaAbove: 'Mod-Shift-Enter',
    insertEmptyParaBelow: 'Mod-Enter',
};
const name$e = 'blockquote';
function specFactory$e() {
    return {
        type: 'node',
        name: name$e,
        schema: {
            content: 'block*',
            group: 'block',
            defining: true,
            draggable: false,
            parseDOM: [{ tag: 'blockquote' }],
            toDOM: () => {
                return ['blockquote', 0];
            },
        },
        markdown: {
            toMarkdown: (state, node) => {
                state.wrapBlock('> ', null, node, () => state.renderContent(node));
            },
            parseMarkdown: {
                blockquote: {
                    block: name$e,
                },
            },
        },
    };
}
function pluginsFactory$e({ markdownShortcut = true, keybindings = defaultKeys$b, } = {}) {
    return ({ schema }) => {
        const type = getNodeType(schema, name$e);
        return [
            markdownShortcut && wrappingInputRule(/^\s*>\s$/, type),
            keybindings &&
                keymap(createObject([
                    [keybindings.wrapIn, wrapInBlockquote()],
                    [keybindings.moveUp, moveNode(type, 'UP')],
                    [keybindings.moveDown, moveNode(type, 'DOWN')],
                    [keybindings.emptyCopy, copyEmptyCommand(type)],
                    [keybindings.emptyCut, cutEmptyCommand(type)],
                    [keybindings.insertEmptyParaAbove, insertEmptyParaAbove$1()],
                    [keybindings.insertEmptyParaBelow, insertEmptyParaBelow$1()],
                ])),
        ];
    };
}
function queryIsBlockquoteActive() {
    return (state) => {
        const type = getNodeType(state, name$e);
        return Boolean(findParentNodeOfType(type)(state.selection));
    };
}
function wrapInBlockquote() {
    return filter((state) => !queryIsBlockquoteActive()(state), (state, dispatch, _view) => {
        const type = getNodeType(state, name$e);
        return wrapIn(type)(state, dispatch);
    });
}
function insertEmptyParaAbove$1() {
    const isInBlockquote = queryIsBlockquoteActive();
    return (state, dispatch, view) => {
        const para = getParaNodeType(state);
        return filter(isInBlockquote, insertEmpty(para, 'above', true))(state, dispatch, view);
    };
}
function insertEmptyParaBelow$1() {
    const isInBlockquote = queryIsBlockquoteActive();
    return (state, dispatch, view) => {
        const para = getParaNodeType(state);
        return filter(isInBlockquote, insertEmpty(para, 'below', true))(state, dispatch, view);
    };
}

var blockquote = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$e,
    plugins: plugins$e,
    commands: commands$c,
    defaultKeys: defaultKeys$b,
    queryIsBlockquoteActive: queryIsBlockquoteActive,
    wrapInBlockquote: wrapInBlockquote,
    insertEmptyParaAbove: insertEmptyParaAbove$1,
    insertEmptyParaBelow: insertEmptyParaBelow$1
});

const spec$d = specFactory$d;
const plugins$d = pluginsFactory$d;
const commands$b = {
    toggleBold,
    queryIsBoldActive,
};
const defaultKeys$a = {
    toggleBold: 'Mod-b',
};
const name$d = 'bold';
const getTypeFromSchema$5 = (schema) => {
    const markType = schema.marks[name$d];
    assertNotUndefined(markType, `markType ${name$d} not found`);
    return markType;
};
function specFactory$d() {
    return {
        type: 'mark',
        name: name$d,
        schema: {
            parseDOM: [
                {
                    tag: 'strong',
                },
                {
                    tag: 'b',
                    // making node any type as there is some problem with pm-model types
                    getAttrs: (node) => node.style.fontWeight !== 'normal' && null,
                },
                {
                    style: 'font-weight',
                    getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
                },
            ],
            toDOM: () => ['strong', 0],
        },
        markdown: {
            toMarkdown: {
                open: '**',
                close: '**',
                mixable: true,
                expelEnclosingWhitespace: true,
            },
            parseMarkdown: {
                strong: { mark: name$d },
            },
        },
    };
}
function pluginsFactory$d({ markdownShortcut = true, keybindings = defaultKeys$a, } = {}) {
    return ({ schema }) => {
        const type = getTypeFromSchema$5(schema);
        return [
            markdownShortcut &&
                markPasteRule$1(/(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))/g, type),
            markdownShortcut &&
                markPasteRule$1(/(?:^|\s)((?:__)((?:[^__]+))(?:__))/g, type),
            markdownShortcut &&
                markInputRule(/(?:^|\s)((?:__)((?:[^__]+))(?:__))$/, type),
            markdownShortcut &&
                markInputRule(/(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/, type),
            keybindings &&
                keymap(createObject([[keybindings.toggleBold, toggleBold()]])),
        ];
    };
}
function toggleBold() {
    return (state, dispatch, _view) => {
        const markType = state.schema.marks[name$d];
        assertNotUndefined(markType, `markType ${name$d} not found`);
        return toggleMark(markType)(state, dispatch);
    };
}
function queryIsBoldActive() {
    return (state) => {
        const markType = state.schema.marks[name$d];
        assertNotUndefined(markType, `markType ${name$d} not found`);
        return isMarkActiveInSelection(markType)(state);
    };
}

var bold = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$d,
    plugins: plugins$d,
    commands: commands$b,
    defaultKeys: defaultKeys$a,
    toggleBold: toggleBold,
    queryIsBoldActive: queryIsBoldActive
});

const isNodeTodo = (node, schema) => {
    return (node.type === getNodeType(schema, 'listItem') &&
        typeof node.attrs['todoChecked'] === 'boolean');
};
/**
 * remove todoChecked attribute from a listItem
 * no-op if not listitem
 * @param {*} tr
 * @param {*} schema
 * @param {*} node
 * @param {*} pos
 */
const removeTodoCheckedAttr = (tr, schema, node, pos) => {
    if (isNodeTodo(node, schema)) {
        tr = tr.setNodeMarkup(pos, undefined, Object.assign({}, node.attrs, { todoChecked: null }));
    }
    return tr;
};
/**
 * set todoChecked attribute to a listItem
 * no-op if not listitem or if already todo
 * @param {*} tr
 * @param {*} schema
 * @param {*} node
 * @param {*} pos
 */
const setTodoCheckedAttr = (tr, schema, node, pos) => {
    if (node.type === getNodeType(schema, 'listItem') &&
        !isNodeTodo(node, schema)) {
        tr = tr.setNodeMarkup(pos, undefined, Object.assign({}, node.attrs, { todoChecked: false }));
    }
    return tr;
};
/**
 * A command to remove the todoChecked attribute (if any) to nodes in and around of the
 * selection. Uses the rules of siblingsAndNodesBetween to shortlist the nodes.
 * If no nodes with todoChecked attr are found returns false otherwise true
 */
const removeTodo = filter([isSelectionParentBulletList, (state) => todoCount(state).todos !== 0], (state, dispatch) => {
    const { schema } = state;
    let tr = state.tr;
    siblingsAndNodesBetween(state, (node, pos) => {
        tr = removeTodoCheckedAttr(tr, schema, node, pos);
    });
    if (dispatch) {
        dispatch(tr);
    }
    return true;
});
/**
 * A command to set the todoChecked attribute to nodes in and around of the
 * selection. Uses the rules of siblingsAndNodesBetween to shortlist the nodes.
 * If all nodes are already having todoChecked attr returns false otherwise true
 */
const setTodo = filter([
    isSelectionParentBulletList,
    (state) => {
        const { todos, lists } = todoCount(state);
        // If all the list items are todo or none of them are todo
        // return false so we can run the vanilla toggleList
        return todos !== lists;
    },
], (state, dispatch) => {
    let { tr, schema } = state;
    siblingsAndNodesBetween(state, (node, pos) => {
        tr = setTodoCheckedAttr(tr, schema, node, pos);
    });
    if (dispatch) {
        dispatch(tr);
    }
    return true;
});
// Alteration of PM's wrappingInputRule
function wrappingInputRuleForTodo(regexp, getAttrs) {
    return new InputRule(regexp, function (state, match, start, end) {
        const nodeType = getNodeType(state, 'listItem');
        var attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
        var tr = state.tr.delete(start, end);
        var $start = tr.doc.resolve(start), range = $start.blockRange(), wrapping = range && findWrapping(range, nodeType, attrs);
        if (!wrapping) {
            return null;
        }
        tr.wrap(range, wrapping);
        var before = tr.doc.resolve(start - 1).nodeBefore;
        if (before &&
            before.type === getNodeType(state, 'bulletList') &&
            canJoin(tr.doc, start - 1) &&
            before.lastChild &&
            // only join if before is todo
            isNodeTodo(before.lastChild, state.schema)) {
            tr.join(start - 1);
        }
        return tr;
    });
}
/**
 * given a bullet/ordered list it will call callback for each node
 *  which
 *    - strictly lies inside the range provided
 *    - nodes that are sibblings of the top level nodes
 *      which lie in the range.
 *
 * Example
 *         <ul>
 *              <li>[A
 *                 <list-A's kids/>
 *              </li>
 *              <li><B]></li>
 *              <li><C></li>
 *              <li>D <list-D's kids </li>
 *           </ul>
 *
 * In the above the callback will be called for everyone
 *  A, list-A's kids, B, C, D _but_ not list-D's kids.
 */
function siblingsAndNodesBetween(state, callback) {
    const { schema, selection: { $from, $to }, } = state;
    const range = $from.blockRange($to, (node) => node.childCount > 0 &&
        node.firstChild.type === getNodeType(schema, 'listItem'));
    if (!range) {
        return;
    }
    const { parent, startIndex, endIndex } = range;
    // NOTE: this gets us to start pos inside of the parent bullet list
    //        <ul>{} <nth-item> ..[.]. </nth-item></ul>
    //        {} - is the pos of offset
    let startPos = range.$from.start(range.depth);
    for (let i = 0; i < parent.childCount; i++) {
        const child = parent.child(i);
        callback(child, startPos);
        // also call callback for children of nodes
        // that lie inside the selection
        if (i >= startIndex && i < endIndex - 1) {
            child.nodesBetween(0, child.content.size, callback, startPos + 1);
        }
        startPos += child.nodeSize;
    }
    return;
}
function isSelectionParentBulletList(state) {
    const { selection } = state;
    const fromNode = selection.$from.node(-2);
    const endNode = selection.$to.node(-2);
    return (fromNode &&
        fromNode.type === getNodeType(state, 'bulletList') &&
        endNode &&
        endNode.type === getNodeType(state, 'bulletList'));
}
function todoCount(state) {
    let lists = 0;
    let todos = 0;
    const { schema } = state;
    siblingsAndNodesBetween(state, (node, _pos) => {
        // TODO it might create problem by counting ol 's listItem?
        if (node.type === getNodeType(schema, 'listItem')) {
            lists++;
        }
        if (isNodeTodo(node, schema)) {
            todos++;
        }
    });
    return {
        lists: lists,
        todos: todos,
    };
}

function liftListItem(type, state, selection, tr) {
    let { $from, $to } = selection;
    let listItem = type;
    if (!listItem) {
        listItem = getNodeType(state, 'listItem');
    }
    let range = $from.blockRange($to, (node) => !!node.childCount &&
        !!node.firstChild &&
        node.firstChild.type === listItem);
    if (!range ||
        range.depth < 2 ||
        $from.node(range.depth - 1).type !== listItem) {
        return tr;
    }
    let end = range.end;
    let endOfList = $to.end(range.depth);
    if (end < endOfList) {
        tr.step(new ReplaceAroundStep(end - 1, endOfList, end, endOfList, new Slice(Fragment.from(listItem.create(undefined, range.parent.copy())), 1, 0), 1, true));
        range = new NodeRange(tr.doc.resolve($from.pos), tr.doc.resolve(endOfList), range.depth);
    }
    return tr.lift(range, liftTarget(range)).scrollIntoView();
}
// Function will lift list item following selection to level-1.
function liftFollowingList(type, state, from, to, rootListDepth, tr) {
    let listItem = type;
    if (!listItem) {
        listItem = getNodeType(state, 'listItem');
    }
    let lifted = false;
    tr.doc.nodesBetween(from, to, (node, pos) => {
        if (!lifted && node.type === listItem && pos > from) {
            lifted = true;
            let listDepth = rootListDepth + 3;
            while (listDepth > rootListDepth + 2) {
                const start = tr.doc.resolve(tr.mapping.map(pos));
                listDepth = start.depth;
                const end = tr.doc.resolve(tr.mapping.map(pos + node.content.size));
                const sel = new TextSelection(start, end);
                tr = liftListItem(listItem, state, sel, tr);
            }
        }
    });
    return tr;
}
// The function will list paragraphs in selection out to level 1 below root list.
function liftSelectionList(type, state, tr) {
    const { from, to } = state.selection;
    const { paragraph } = state.schema.nodes;
    const listCol = [];
    tr.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type === paragraph) {
            listCol.push({ node, pos });
        }
    });
    for (let i = listCol.length - 1; i >= 0; i--) {
        const paragraph = listCol[i];
        const start = tr.doc.resolve(tr.mapping.map(paragraph.pos));
        if (start.depth > 0) {
            let end;
            if (paragraph.node.textContent && paragraph.node.textContent.length > 0) {
                end = tr.doc.resolve(tr.mapping.map(paragraph.pos + paragraph.node.textContent.length));
            }
            else {
                end = tr.doc.resolve(tr.mapping.map(paragraph.pos + 1));
            }
            const range = start.blockRange(end);
            if (range) {
                tr.lift(range, getListLiftTarget(type, state.schema, start));
            }
        }
    }
    return tr;
}

const maxIndentation = 4;
// Returns the number of nested lists that are ancestors of the given selection
const numberNestedLists = (resolvedPos, nodes) => {
    const { bulletList, orderedList } = nodes;
    let count = 0;
    for (let i = resolvedPos.depth - 1; i > 0; i--) {
        const node = resolvedPos.node(i);
        if (node.type === bulletList || node.type === orderedList) {
            count += 1;
        }
    }
    return count;
};
const isInsideList = (state, listType) => {
    const { $from } = state.selection;
    const parent = $from.node(-2);
    const grandGrandParent = $from.node(-3);
    return ((parent && parent.type === listType) ||
        (grandGrandParent && grandGrandParent.type === listType));
};
const canOutdent = (type) => (state) => {
    const { parent } = state.selection.$from;
    let listItem = type;
    if (!listItem) {
        ({ listItem } = state.schema.nodes);
    }
    const { paragraph } = state.schema.nodes;
    if (state.selection instanceof GapCursorSelection) {
        return parent.type === listItem;
    }
    return (parent.type === paragraph && hasParentNodeOfType(listItem)(state.selection));
};
/**
 * Check if we can sink the list.
 * @returns {boolean} - true if we can sink the list
 *                    - false if we reach the max indentation level
 */
function canSink(initialIndentationLevel, state) {
    /*
        - Keep going forward in document until indentation of the node is < than the initial
        - If indentation is EVER > max indentation, return true and don't sink the list
        */
    let currentIndentationLevel;
    let currentPos = state.tr.selection.$to.pos;
    do {
        const resolvedPos = state.doc.resolve(currentPos);
        currentIndentationLevel = numberNestedLists(resolvedPos, state.schema.nodes);
        if (currentIndentationLevel > maxIndentation) {
            // Cancel sink list.
            // If current indentation less than the initial, it won't be
            // larger than the max, and the loop will terminate at end of this iteration
            return false;
        }
        currentPos++;
    } while (currentIndentationLevel >= initialIndentationLevel);
    return true;
}
const isInsideListItem = (type) => (state) => {
    const { $from } = state.selection;
    let listItem = type;
    if (!listItem) {
        listItem = getNodeType(state, 'listItem');
    }
    const { paragraph } = state.schema.nodes;
    if (state.selection instanceof GapCursorSelection) {
        return $from.parent.type === listItem;
    }
    return (hasParentNodeOfType(listItem)(state.selection) &&
        $from.parent.type === paragraph);
};
// Get the depth of the nearest ancestor list
const rootListDepth = (type, pos, nodes) => {
    let listItem = type;
    const { bulletList, orderedList } = nodes;
    let depth;
    for (let i = pos.depth - 1; i > 0; i--) {
        const node = pos.node(i);
        if (node.type === bulletList || node.type === orderedList) {
            depth = i;
        }
        if (node.type !== bulletList &&
            node.type !== orderedList &&
            node.type !== listItem) {
            break;
        }
    }
    return depth;
};
function canToJoinToPreviousListItem(state) {
    const { $from } = state.selection;
    const { bulletList, orderedList } = state.schema.nodes;
    const $before = state.doc.resolve($from.pos - 1);
    let nodeBefore = $before ? $before.nodeBefore : null;
    if (state.selection instanceof GapCursorSelection) {
        nodeBefore = $from.nodeBefore;
    }
    return (!!nodeBefore && [bulletList, orderedList].indexOf(nodeBefore.type) > -1);
}
/**
 * ------------------
 * Command Factories
 * ------------------
 */
/**
 *
 * @param {Object} listType  bulletList, orderedList,
 * @param {Object} itemType   'listItem'
 * @param {boolean} todo if true and the final result of toggle is a bulletList
 *                      set `todoChecked` attr for each listItem.
 */
function toggleList(listType, itemType, todo) {
    return (state, dispatch, view) => {
        const { selection } = state;
        const fromNode = selection.$from.node(selection.$from.depth - 2);
        const endNode = selection.$to.node(selection.$to.depth - 2);
        if (!fromNode ||
            fromNode.type.name !== listType.name ||
            !endNode ||
            endNode.type.name !== listType.name) {
            return toggleListCommand(listType, todo)(state, dispatch, view);
        }
        else {
            // If current ListType is the same as `listType` in arg,
            // toggle the list to `p`.
            const listItem = itemType ? itemType : getNodeType(state, 'listItem');
            const depth = rootListDepth(listItem, selection.$to, state.schema.nodes);
            let liftFrom = selection.$to.pos;
            // I am not fully sure the best solution,
            // but if we donot handle the the nodeSelection of itemType
            // an incorrect content error in thrown by liftFollowingList.
            if (selection instanceof NodeSelection &&
                selection.node.type === listItem) {
                liftFrom =
                    selection.$from.pos + selection.node.firstChild.content.size;
            }
            let baseTr = state.tr;
            let tr = liftFollowingList(listItem, state, liftFrom, selection.$to.end(depth), depth || 0, baseTr);
            tr = liftSelectionList(listItem, state, tr);
            if (dispatch) {
                dispatch(tr);
            }
            return true;
        }
    };
}
function toggleListCommand(listType, todo = false) {
    /**
     * A function which will set todoChecked attribute
     * in any of the nodes that have modified on the tr
     */
    const setTodoListTr = (schema) => (tr) => {
        if (!tr.isGeneric) {
            return tr;
        }
        // The following code gets a list of ranges that were changed
        // From wrapDispatchForJoin: https://github.com/prosemirror/prosemirror-commands/blob/e5f8c303be55147086bfe4521cf7419e6effeb8f/src%2Fcommands.js#L495
        // and https://discuss.prosemirror.net/t/finding-out-what-changed-in-a-transaction/2372
        let ranges = [];
        for (let i = 0; i < tr.mapping.maps.length; i++) {
            let map = tr.mapping.maps[i];
            for (let j = 0; j < ranges.length; j++) {
                ranges[j] = map.map(ranges[j]);
            }
            map.forEach((_s, _e, from, to) => {
                ranges.push(from, to);
            });
        }
        const canBeTodo = (node, parentNode) => node.type === getNodeType(schema, 'listItem') &&
            (parentNode === null || parentNode === void 0 ? void 0 : parentNode.type) === getNodeType(schema, 'bulletList');
        for (let i = 0; i < ranges.length; i += 2) {
            let from = ranges[i];
            let to = ranges[i + 1];
            tr.doc.nodesBetween(from, to, (node, pos, parentNode) => {
                if (pos >= from && pos < to && canBeTodo(node, parentNode)) {
                    setTodoCheckedAttr(tr, schema, node, pos);
                }
            });
        }
        return tr;
    };
    return function (state, dispatch, view) {
        if (dispatch) {
            dispatch(state.tr.setSelection(adjustSelectionInList(state.doc, state.selection)));
        }
        if (!view) {
            return false;
        }
        state = view.state;
        const { $from, $to } = state.selection;
        const isRangeOfSingleType = isRangeOfType(state.doc, $from, $to, listType);
        if (isInsideList(state, listType) && isRangeOfSingleType) {
            return liftListItems()(state, dispatch);
        }
        else {
            // Converts list type e.g. bulletList -> orderedList if needed
            if (!isRangeOfSingleType) {
                liftListItems()(state, dispatch);
                state = view.state;
            }
            // Remove any invalid marks that are not supported
            const tr = sanitiseSelectionMarksForWrapping(state, listType);
            if (tr && dispatch) {
                dispatch(tr);
                state = view.state;
            }
            // Wraps selection in list
            return wrapInList(listType)(state, todo ? extendDispatch(dispatch, setTodoListTr(state.schema)) : dispatch);
        }
    };
}
function wrapInList(nodeType, attrs) {
    return autoJoin(wrapInList$1(nodeType, attrs), (before, after) => before.type === after.type && before.type === nodeType);
}
function liftListItems() {
    return function (state, dispatch) {
        const { tr } = state;
        const { $from, $to } = state.selection;
        tr.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
            // Following condition will ensure that block types paragraph, heading, codeBlock, blockquote, panel are lifted.
            // isTextblock is true for paragraph, heading, codeBlock.
            if (node.isTextblock) {
                const sel = new NodeSelection(tr.doc.resolve(tr.mapping.map(pos)));
                const range = sel.$from.blockRange(sel.$to);
                if (!range ||
                    ![getNodeType(state, 'listItem')].includes(sel.$from.parent.type)) {
                    return false;
                }
                const target = range && liftTarget(range);
                if (target === undefined || target === null) {
                    return false;
                }
                tr.lift(range, target);
            }
            return;
        });
        if (dispatch) {
            dispatch(tr);
        }
        return true;
    };
}
/**
 * Sometimes a selection in the editor can be slightly offset, for example:
 * it's possible for a selection to start or end at an empty node at the very end of
 * a line. This isn't obvious by looking at the editor and it's likely not what the
 * user intended - so we need to adjust the selection a bit in scenarios like that.
 */
function adjustSelectionInList(doc, selection) {
    let { $from, $to } = selection;
    const isSameLine = $from.pos === $to.pos;
    let startPos = $from.pos;
    let endPos = $to.pos;
    if (isSameLine && startPos === doc.nodeSize - 3) {
        // Line is empty, don't do anything
        return selection;
    }
    // Selection started at the very beginning of a line and therefor points to the previous line.
    if ($from.nodeBefore && !isSameLine) {
        startPos++;
        let node = doc.nodeAt(startPos);
        while (!node || (node && !node.isText)) {
            startPos++;
            node = doc.nodeAt(startPos);
        }
    }
    if (endPos === startPos) {
        return new TextSelection(doc.resolve(startPos));
    }
    return new TextSelection(doc.resolve(startPos), doc.resolve(endPos));
}
function indentList(type) {
    const handleTodo = (schema) => (tr) => {
        if (!tr.isGeneric) {
            return tr;
        }
        const range = tr.selection.$from.blockRange(tr.selection.$to, (node) => node.childCount > 0 &&
            node.firstChild.type === getNodeType(schema, 'listItem'));
        if (!range ||
            // we donot have an existing node to check if todo is needed or not
            range.startIndex === 0) {
            return tr;
        }
        const isNodeBeforeATodo = isNodeTodo(range.parent.child(range.startIndex - 1), schema);
        const { parent, startIndex, endIndex } = range;
        let offset = 0;
        for (let i = startIndex; i < endIndex; i++) {
            const child = parent.child(i);
            const pos = range.start + offset;
            tr = isNodeBeforeATodo
                ? setTodoCheckedAttr(tr, schema, child, pos)
                : removeTodoCheckedAttr(tr, schema, child, pos);
            offset += child.nodeSize;
        }
        return tr;
    };
    return function indentListCommand(state, dispatch) {
        let listItem = type;
        if (!listItem) {
            listItem = getNodeType(state, 'listItem');
        }
        if (isInsideListItem(listItem)(state)) {
            // Record initial list indentation
            const initialIndentationLevel = numberNestedLists(state.selection.$from, state.schema.nodes);
            if (canSink(initialIndentationLevel, state)) {
                sinkListItem(listItem)(state, extendDispatch(dispatch, handleTodo(state.schema)));
            }
            return true;
        }
        return false;
    };
}
function outdentList(type) {
    return function (state, dispatch, view) {
        let listItem = type;
        if (!listItem) {
            listItem = getNodeType(state, 'listItem');
        }
        const { $from, $to } = state.selection;
        if (!isInsideListItem(listItem)(state)) {
            return false;
        }
        // if we're backspacing at the start of a list item, unindent it
        // take the the range of nodes we might be lifting
        // the predicate is for when you're backspacing a top level list item:
        // we don't want to go up past the doc node, otherwise the range
        // to clear will include everything
        let range = $from.blockRange($to, (node) => node.childCount > 0 && node.firstChild.type === listItem);
        if (!range) {
            return false;
        }
        const isGreatGrandTodo = isNodeTodo(state.selection.$from.node(-3), state.schema);
        // TODO this is not quite as lean as the indent approach of todo
        // check if we need to set todoCheck attribute
        if (dispatch && view) {
            const grandParent = state.selection.$from.node(-2);
            const grandParentPos = state.selection.$from.start(-2);
            let tr = state.tr;
            for (const { node, pos } of flatten(grandParent, false)) {
                const absPos = pos + grandParentPos;
                // -1 so that we cover the entire list item
                if (absPos >= state.selection.$from.before(-1) &&
                    absPos < state.selection.$to.after(-1)) {
                    if (isGreatGrandTodo) {
                        setTodoCheckedAttr(tr, state.schema, node, absPos);
                    }
                    else {
                        removeTodoCheckedAttr(tr, state.schema, node, absPos);
                    }
                }
            }
            dispatch(tr);
            state = view.state;
        }
        const composedCommand = compose(mergeLists(listItem, range), // 2. Check if I need to merge nearest list
        liftListItem$1)(listItem);
        return composedCommand(state, dispatch, view);
    };
}
/**
 * Merge closest bullet list blocks into one
 *
 * @param {NodeType} listItem
 * @param {NodeRange} range
 * @returns
 */
function mergeLists(listItem, range) {
    return (command) => {
        return (state, dispatch, view) => {
            const newDispatch = (tr) => {
                /* we now need to handle the case that we lifted a sublist out,
                 * and any listItems at the current level get shifted out to
                 * their own new list; e.g.:
                 *
                 * unorderedList
                 *  listItem(A)
                 *  listItem
                 *    unorderedList
                 *      listItem(B)
                 *  listItem(C)
                 *
                 * becomes, after unindenting the first, top level listItem, A:
                 *
                 * content of A
                 * unorderedList
                 *  listItem(B)
                 * unorderedList
                 *  listItem(C)
                 *
                 * so, we try to merge these two lists if they're of the same type, to give:
                 *
                 * content of A
                 * unorderedList
                 *  listItem(B)
                 *  listItem(C)
                 */
                const $start = state.doc.resolve(range.start);
                const $end = state.doc.resolve(range.end);
                const $join = tr.doc.resolve(tr.mapping.map(range.end - 1));
                if ($join.nodeBefore &&
                    $join.nodeAfter &&
                    $join.nodeBefore.type === $join.nodeAfter.type) {
                    if ($end.nodeAfter &&
                        $end.nodeAfter.type === listItem &&
                        $end.parent.type === $start.parent.type) {
                        tr.join($join.pos);
                    }
                }
                if (dispatch) {
                    dispatch(tr.scrollIntoView());
                }
            };
            return command(state, newDispatch, view);
        };
    };
}
// Chaining runs each command until one of them returns true
const backspaceKeyCommand = (type) => (state, dispatch, view) => {
    return chainCommands(
    // if we're at the start of a list item, we need to either backspace
    // directly to an empty list item above, or outdent this node
    filter([
        isInsideListItem(type),
        isEmptySelectionAtStart,
        // list items might have multiple paragraphs; only do this at the first one
        isFirstChildOfParent,
        canOutdent(type),
    ], chainCommands(deletePreviousEmptyListItem(type), outdentList(type))), 
    // if we're just inside a paragraph node (or gapcursor is shown) and backspace, then try to join
    // the text to the previous list item, if one exists
    filter([isEmptySelectionAtStart, canToJoinToPreviousListItem], joinToPreviousListItem(type)))(state, dispatch, view);
};
function enterKeyCommand(type) {
    return (state, dispatch, view) => {
        const { selection } = state;
        if (selection.empty) {
            const { $from } = selection;
            let listItem = type;
            if (!listItem) {
                listItem = getNodeType(state, 'listItem');
            }
            const { codeBlock } = state.schema.nodes;
            const node = $from.node($from.depth);
            const wrapper = $from.node($from.depth - 1);
            if (wrapper && wrapper.type === listItem) {
                /** Check if the wrapper has any visible content */
                const wrapperHasContent = hasVisibleContent(wrapper);
                if (isNodeEmpty(node) && !wrapperHasContent) {
                    const grandParent = $from.node($from.depth - 3);
                    // To allow for cases where a non-todo item is nested inside a todo item
                    // pressing enter should convert that type into a todo listItem and outdent.
                    if (isNodeTodo(grandParent, state.schema) &&
                        !isNodeTodo(wrapper, state.schema)) {
                        return outdentList(getNodeType(state, 'listItem'))(state, dispatch, view);
                    }
                    else {
                        return outdentList(listItem)(state, dispatch, view);
                    }
                }
                else if (!codeBlock || !hasParentNodeOfType(codeBlock)(selection)) {
                    return splitListItem(listItem, (node) => {
                        if (!isNodeTodo(node, state.schema)) {
                            return node.attrs;
                        }
                        return {
                            ...node.attrs,
                            todoChecked: false,
                        };
                    })(state, dispatch);
                }
            }
        }
        return false;
    };
}
/***
 * Implementation taken from PM and mk-2
 * Splits the list items, specific implementation take from PM
 *
 * splitAttrs(node): attrs - if defined the new split item will get attrs returned by this.
 *                        where node is the currently active node.
 */
function splitListItem(itemType, splitAttrs) {
    return function (state, dispatch) {
        const ref = state.selection;
        const $from = ref.$from;
        const $to = ref.$to;
        const node = ref.node;
        if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to)) {
            return false;
        }
        const grandParent = $from.node(-1);
        if (grandParent.type !== itemType) {
            return false;
        }
        /** --> The following line changed from the original PM implementation to allow list additions with multiple paragraphs */
        if (
        // @ts-ignore Fragment.content is missing in @types/prosemirror-model
        grandParent.content.content.length <= 1 &&
            $from.parent.content.size === 0 &&
            !(grandParent.content.size === 0)) {
            // In an empty block. If this is a nested list, the wrapping
            // list item should be split. Otherwise, bail out and let next
            // command handle lifting.
            if ($from.depth === 2 ||
                $from.node(-3).type !== itemType ||
                $from.index(-2) !== $from.node(-2).childCount - 1) {
                return false;
            }
            if (dispatch) {
                let wrap = Fragment.empty;
                const keepItem = $from.index(-1) > 0;
                // Build a fragment containing empty versions of the structure
                // from the outer list item to the parent node of the cursor
                for (let d = $from.depth - (keepItem ? 1 : 2); d >= $from.depth - 3; d--) {
                    wrap = Fragment.from($from.node(d).copy(wrap));
                }
                // Add a second list item with an empty default start node
                wrap = wrap.append(Fragment.from(itemType.createAndFill()));
                const tr$1 = state.tr.replace($from.before(keepItem ? undefined : -1), $from.after(-3), new Slice(wrap, keepItem ? 3 : 2, 2));
                tr$1.setSelection(Selection.near(tr$1.doc.resolve($from.pos + (keepItem ? 3 : 2))));
                dispatch(tr$1.scrollIntoView());
            }
            return true;
        }
        const nextType = $to.pos === $from.end()
            ? grandParent.contentMatchAt(0).defaultType
            : undefined;
        const tr = state.tr.delete($from.pos, $to.pos);
        const types = [
            splitAttrs
                ? { type: itemType, attrs: splitAttrs(grandParent) }
                : undefined,
            nextType && { type: nextType },
        ];
        if (dispatch) {
            dispatch(tr.split($from.pos, 2, types).scrollIntoView());
        }
        return true;
    };
}
function joinToPreviousListItem(type) {
    return (state, dispatch) => {
        let listItem = type;
        if (!listItem) {
            ({ listItem } = state.schema.nodes);
        }
        const { $from } = state.selection;
        const { paragraph, codeBlock, heading, bulletList, orderedList } = state.schema.nodes;
        const isGapCursorShown = state.selection instanceof GapCursorSelection;
        const $cutPos = isGapCursorShown ? state.doc.resolve($from.pos + 1) : $from;
        let $cut = findCutBefore($cutPos);
        if (!$cut) {
            return false;
        }
        // see if the containing node is a list
        if ($cut.nodeBefore &&
            [bulletList, orderedList].indexOf($cut.nodeBefore.type) > -1) {
            // and the node after this is a paragraph / codeBlock / heading
            if ($cut.nodeAfter &&
                [paragraph, codeBlock, heading].indexOf($cut.nodeAfter.type) > -1) {
                // find the nearest paragraph that precedes this node
                let $lastNode = $cut.doc.resolve($cut.pos - 1);
                while ($lastNode.parent.type !== paragraph) {
                    $lastNode = state.doc.resolve($lastNode.pos - 1);
                }
                let { tr } = state;
                if (isGapCursorShown) {
                    const nodeBeforePos = findPositionOfNodeBefore(tr.selection);
                    if (typeof nodeBeforePos !== 'number') {
                        return false;
                    }
                    // append the paragraph / codeblock / heading to the list node
                    const list = $cut.nodeBefore.copy($cut.nodeBefore.content.append(Fragment.from(listItem.createChecked({}, $cut.nodeAfter))));
                    tr.replaceWith(nodeBeforePos, $from.pos + $cut.nodeAfter.nodeSize, list);
                }
                else {
                    // take the text content of the paragraph and insert after the paragraph up until before the the cut
                    tr = tr.step(new ReplaceAroundStep($lastNode.pos, $cut.pos + $cut.nodeAfter.nodeSize, $cut.pos + 1, $cut.pos + $cut.nodeAfter.nodeSize - 1, state.tr.doc.slice($lastNode.pos, $cut.pos), 0, true));
                }
                // find out if there's now another list following and join them
                // as in, [list, p, list] => [list with p, list], and we want [joined list]
                let $postCut = tr.doc.resolve(tr.mapping.map($cut.pos + $cut.nodeAfter.nodeSize));
                if ($postCut.nodeBefore &&
                    $postCut.nodeAfter &&
                    $postCut.nodeBefore.type === $postCut.nodeAfter.type &&
                    [bulletList, orderedList].indexOf($postCut.nodeBefore.type) > -1) {
                    tr = tr.join($postCut.pos);
                }
                if (dispatch) {
                    dispatch(tr.scrollIntoView());
                }
                return true;
            }
        }
        return false;
    };
}
function deletePreviousEmptyListItem(type) {
    return (state, dispatch) => {
        const { $from } = state.selection;
        let listItem = type;
        if (!listItem) {
            listItem = getNodeType(state, 'listItem');
        }
        const $cut = findCutBefore($from);
        if (!$cut || !$cut.nodeBefore || !($cut.nodeBefore.type === listItem)) {
            return false;
        }
        const previousListItemEmpty = $cut.nodeBefore.childCount === 1 &&
            $cut.nodeBefore.firstChild.nodeSize <= 2;
        if (previousListItemEmpty) {
            const { tr } = state;
            if (dispatch) {
                dispatch(tr
                    .delete($cut.pos - $cut.nodeBefore.nodeSize, $from.pos)
                    .scrollIntoView());
            }
            return true;
        }
        return false;
    };
}
function moveEdgeListItem(type, dir = 'UP') {
    const isDown = dir === 'DOWN';
    const isItemAtEdge = (state) => {
        const currentResolved = findParentNodeOfType(type)(state.selection);
        if (!currentResolved) {
            return false;
        }
        const currentNode = currentResolved.node;
        const { $from } = state.selection;
        const parent = $from.node(currentResolved.depth - 1);
        const matchedChild = parent && parent[isDown ? 'lastChild' : 'firstChild'];
        if (currentNode && matchedChild === currentNode) {
            return true;
        }
        return false;
    };
    const command = (state, dispatch, view) => {
        let listItem = type;
        if (!listItem) {
            listItem = getNodeType(state, 'listItem');
        }
        if (!state.selection.empty) {
            return false;
        }
        const grandParent = findParentNode((node) => validListParent(node.type, state.schema.nodes))(state.selection);
        const parent = findParentNodeOfType(listItem)(state.selection);
        if (!(grandParent && grandParent.node) || !(parent && parent.node)) {
            return false;
        }
        // outdent if the not nested list item i.e. top level
        if (state.selection.$from.depth === 3) {
            return outdentList(listItem)(state, dispatch, view);
        }
        // If there is only one element, we need to delete the entire
        // bulletList/orderedList so as not to leave any empty list behind.
        let nodeToRemove = grandParent.node.childCount === 1 ? grandParent : parent;
        let tr = state.tr.delete(nodeToRemove.pos, nodeToRemove.pos + nodeToRemove.node.nodeSize);
        // - first // doing a (-1) will move us to end of 'first' hence allowing us to add an item
        // - second  // start(-3) will give 11 which is the start of this listItem,
        //   - third{<>}
        let insertPos = state.selection.$from.before(-3);
        // when going down move the position by the size of remaining content (after deletion)
        if (isDown) {
            let uncleNodePos = state.selection.$from.after(-3);
            insertPos = uncleNodePos - nodeToRemove.node.nodeSize;
            let uncle = validPos(uncleNodePos, state.doc) && state.doc.nodeAt(uncleNodePos);
            if (uncle && uncle.type === listItem) {
                // Example
                // - first
                // - second
                //   - third{<>}
                // - uncle
                // {x} <== you want to go down here
                insertPos += uncle.nodeSize;
            }
        }
        let nodeToInsert = parent.node;
        const newTr = safeInsert(nodeToInsert, insertPos)(tr);
        // no change hence dont mutate anything
        if (newTr === tr) {
            return false;
        }
        if (dispatch) {
            dispatch(newTr);
        }
        return true;
    };
    return filter([isItemAtEdge], command);
}
function updateNodeAttrs(type, cb) {
    return (state, dispatch) => {
        const { $from } = state.selection;
        const current = $from.node(-1);
        if (current && current.type === type) {
            const { tr } = state;
            const nodePos = $from.before(-1);
            const newAttrs = cb(current.attrs);
            if (newAttrs !== current.attrs) {
                tr.setNodeMarkup(nodePos, undefined, cb(current.attrs));
                dispatch && dispatch(tr);
                return true;
            }
        }
        return false;
    };
}

// markdown parsing helper
function listIsTight(tokens, i) {
    while (++i < tokens.length) {
        let token = tokens[i];
        if (token && token.type !== 'list_item_open') {
            return token.hidden;
        }
    }
    return false;
}

const spec$c = specFactory$c;
const plugins$c = pluginsFactory$c;
const commands$a = {
    toggleBulletList,
    queryIsBulletListActive,
};
const defaultKeys$9 = {
    toggle: 'Shift-Ctrl-8',
    toggleTodo: 'Shift-Ctrl-7',
};
const name$c = 'bulletList';
function specFactory$c() {
    return {
        type: 'node',
        name: name$c,
        schema: {
            content: 'listItem+',
            group: 'block',
            parseDOM: [{ tag: 'ul' }],
            toDOM: () => ['ul', 0],
            attrs: {
                // a style preference attribute which be used for
                // rendering output.
                // For example markdown serializer can render a new line in
                // between or not.
                tight: {
                    default: false,
                },
            },
        },
        markdown: {
            toMarkdown(state, node) {
                state.renderList(node, '  ', () => '- ');
            },
            parseMarkdown: {
                bullet_list: {
                    block: name$c,
                    getAttrs: (_, tokens, i) => {
                        return { tight: listIsTight(tokens, i) };
                    },
                },
            },
        },
    };
}
function pluginsFactory$c({ markdownShortcut = true, todoMarkdownShortcut = true, keybindings = defaultKeys$9, } = {}) {
    return ({ schema }) => {
        const type = getNodeType(schema, name$c);
        return [
            keybindings &&
                keymap(createObject([
                    [keybindings.toggle, toggleBulletList()],
                    [keybindings.toggleTodo, toggleTodoList()],
                ])),
            markdownShortcut &&
                wrappingInputRule(/^\s*([-+*])\s$/, type, undefined, (_str, node) => {
                    if (node.lastChild && isNodeTodo(node.lastChild, schema)) {
                        return false;
                    }
                    return true;
                }),
            todoMarkdownShortcut &&
                wrappingInputRuleForTodo(/^\s*(\[ \])\s$/, {
                    todoChecked: false,
                }),
        ];
    };
}
function toggleBulletList() {
    const handleBulletLists = (state, dispatch, view) => toggleList(getNodeType(state, 'bulletList'), getNodeType(state, 'listItem'))(state, dispatch, view);
    return chainCommands(removeTodo, handleBulletLists);
}
function toggleTodoList() {
    const fallback = (state, dispatch, view) => toggleList(getNodeType(state, 'bulletList'), getNodeType(state, 'listItem'), true)(state, dispatch, view);
    return chainCommands(setTodo, fallback);
}
function queryIsBulletListActive() {
    return (state) => {
        return parentHasDirectParentOfType(getNodeType(state, 'listItem'), [
            getNodeType(state, 'bulletList'),
        ])(state);
    };
}
function queryIsTodoListActive() {
    return (state) => {
        const { schema } = state;
        return (parentHasDirectParentOfType(getNodeType(state, 'listItem'), [
            getNodeType(state, 'bulletList'),
        ])(state) && isNodeTodo(state.selection.$from.node(-1), schema));
    };
}

var bulletList = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$c,
    plugins: plugins$c,
    commands: commands$a,
    defaultKeys: defaultKeys$9,
    toggleBulletList: toggleBulletList,
    toggleTodoList: toggleTodoList,
    queryIsBulletListActive: queryIsBulletListActive,
    queryIsTodoListActive: queryIsTodoListActive
});

const spec$b = specFactory$b;
const plugins$b = pluginsFactory$b;
const commands$9 = {
    toggleCode,
    queryIsCodeActive,
};
const defaultKeys$8 = {
    toggleCode: 'Mod-`',
};
const name$b = 'code';
const getTypeFromSchema$4 = (schema) => {
    const markType = schema.marks[name$b];
    assertNotUndefined(markType, `markType ${name$b} not found`);
    return markType;
};
const getTypeFromState = (state) => {
    const markType = state.schema.marks[name$b];
    assertNotUndefined(markType, `markType ${name$b} not found`);
    return markType;
};
function specFactory$b() {
    return {
        type: 'mark',
        name: name$b,
        schema: {
            excludes: '_',
            parseDOM: [{ tag: name$b }],
            toDOM: () => [name$b, 0],
        },
        markdown: {
            toMarkdown: {
                open(_state, _mark, parent, index) {
                    return backticksFor(parent.child(index), -1);
                },
                close(_state, _mark, parent, index) {
                    return backticksFor(parent.child(index - 1), 1);
                },
                escape: false,
            },
            parseMarkdown: {
                code_inline: { mark: name$b, noCloseToken: true },
            },
        },
    };
}
function pluginsFactory$b({ markdownShortcut = true, escapeAtEdge = true, keybindings = defaultKeys$8, } = {}) {
    return ({ schema }) => {
        const type = getTypeFromSchema$4(schema);
        const escapeFilters = [
            // The $cursor is a safe way to check if it is a textSelection,
            // It is also used in a bunch of placed in pm-commands when dealing with marks
            // Ref: https://discuss.prosemirror.net/t/what-is-an-example-of-an-empty-selection-that-has-a-cursor/3071
            (state) => state.selection.empty && state.selection.$cursor,
        ];
        return [
            markdownShortcut && markPasteRule$1(/(?:`)([^`]+)(?:`)/g, type),
            markdownShortcut && markInputRule(/(?:`)([^`]+)(?:`)$/, type),
            keybindings &&
                keymap(createObject([[keybindings.toggleCode, toggleMark(type)]])),
            escapeAtEdge &&
                keymap({
                    ArrowRight: filter(escapeFilters, moveRight),
                    ArrowLeft: filter(escapeFilters, moveLeft),
                }),
        ];
    };
}
const posHasCode = (state, pos) => {
    // This logic exists because
    // in  rtl (right to left) $<code>text#</code>  (where $ and # represent possible cursor positions)
    // at the edges of code only $ and # are valid positions by default.
    // Put other ways, typing at $ cursor pos will not produce regular text,
    // and typing in # will produce code mark text.
    // To know if a pos will be inside code or not we check for a range.
    //    0      1   2   3   4   5   6        7
    // <para/>     a   b   c   d   e    </para>
    // if the mark is [bcd], and we are moving left from 6
    // we will need to check for rangeHasMark(4,5) to get that 5
    // is having a code mark, hence we do a `pos-1`
    // but if we are moving right and from 2, we donot need to add or subtract
    // because just doing rangeHasMark(2, 3) will give us correct answer.
    if (pos < 0 || pos > state.doc.content.size) {
        return false;
    }
    const code = getTypeFromState(state);
    const node = state.doc.nodeAt(pos);
    return node ? node.marks.some((mark) => mark.type === code) : false;
};
var moveRight = (state, dispatch) => {
    const code = getTypeFromState(state);
    const $cursor = state.selection.$cursor;
    let storedMarks = state.tr.storedMarks;
    const insideCode = markActive(state, code);
    const currentPosHasCode = state.doc.rangeHasMark($cursor.pos, $cursor.pos, code);
    const nextPosHasCode = state.doc.rangeHasMark($cursor.pos, $cursor.pos + 1, code);
    const enteringCode = !currentPosHasCode &&
        nextPosHasCode &&
        !(storedMarks && storedMarks.length > 0);
    // entering code mark (from the left edge): don't move the cursor, just add the mark
    if (!insideCode && enteringCode) {
        if (dispatch) {
            dispatch(state.tr.addStoredMark(code.create()));
        }
        return true;
    }
    const exitingCode = !currentPosHasCode &&
        !nextPosHasCode &&
        !(storedMarks && storedMarks.length === 0);
    // exiting code mark: don't move the cursor, just remove the mark
    if (insideCode && exitingCode) {
        if (dispatch) {
            dispatch(state.tr.removeStoredMark(code));
        }
        return true;
    }
    return false;
};
var moveLeft = (state, dispatch) => {
    const code = getTypeFromState(state);
    const insideCode = markActive(state, code);
    const $cursor = state.selection.$cursor;
    const { storedMarks } = state.tr;
    const currentPosHasCode = posHasCode(state, $cursor.pos);
    const nextPosHasCode = posHasCode(state, $cursor.pos - 1);
    const nextNextPosHasCode = posHasCode(state, $cursor.pos - 2);
    const exitingCode = currentPosHasCode && !nextPosHasCode && Array.isArray(storedMarks);
    const atLeftEdge = nextPosHasCode &&
        !nextNextPosHasCode &&
        (storedMarks === null ||
            (Array.isArray(storedMarks) && !!storedMarks.length));
    const atRightEdge = ((exitingCode && Array.isArray(storedMarks) && !storedMarks.length) ||
        (!exitingCode && storedMarks === null)) &&
        !nextPosHasCode &&
        nextNextPosHasCode;
    const enteringCode = !currentPosHasCode &&
        nextPosHasCode &&
        Array.isArray(storedMarks) &&
        !storedMarks.length;
    // at the right edge: remove code mark and move the cursor to the left
    if (!insideCode && atRightEdge) {
        const tr = state.tr.setSelection(Selection.near(state.doc.resolve($cursor.pos - 1)));
        if (dispatch) {
            dispatch(tr.removeStoredMark(code));
        }
        return true;
    }
    // entering code mark (from right edge): don't move the cursor, just add the mark
    if (!insideCode && enteringCode) {
        if (dispatch) {
            dispatch(state.tr.addStoredMark(code.create()));
        }
        return true;
    }
    // at the left edge: add code mark and move the cursor to the left
    if (insideCode && atLeftEdge) {
        const tr = state.tr.setSelection(Selection.near(state.doc.resolve($cursor.pos - 1)));
        if (dispatch) {
            dispatch(tr.addStoredMark(code.create()));
        }
        return true;
    }
    // exiting code mark (or at the beginning of the line): don't move the cursor, just remove the mark
    const isFirstChild = $cursor.index($cursor.depth - 1) === 0;
    if (insideCode && (exitingCode || (!$cursor.nodeBefore && isFirstChild))) {
        if (dispatch) {
            dispatch(state.tr.removeStoredMark(code));
        }
        return true;
    }
    return false;
};
function backticksFor(node, side) {
    let ticks = /`+/g;
    let m;
    let len = 0;
    if (node.isText) {
        while ((m = ticks.exec(node.text))) {
            let res = m[0];
            if (typeof res === 'string') {
                len = Math.max(len, res.length);
            }
        }
    }
    let result = len > 0 && side > 0 ? ' `' : '`';
    for (let i = 0; i < len; i++) {
        result += '`';
    }
    if (len > 0 && side < 0) {
        result += ' ';
    }
    return result;
}
function markActive(state, mark) {
    const { from, to, empty } = state.selection;
    // When the selection is empty, only the active marks apply.
    if (empty) {
        return !!mark.isInSet(state.tr.storedMarks || state.selection.$from.marks());
    }
    // For a non-collapsed selection, the marks on the nodes matter.
    let found = false;
    state.doc.nodesBetween(from, to, (node) => {
        found = found || !!mark.isInSet(node.marks);
    });
    return found;
}
function toggleCode() {
    return (state, dispatch) => {
        const markType = state.schema.marks[name$b];
        assertNotUndefined(markType, `markType ${name$b} not found`);
        return toggleMark(markType)(state, dispatch);
    };
}
function queryIsCodeActive() {
    return (state) => {
        const markType = state.schema.marks[name$b];
        assertNotUndefined(markType, `markType ${name$b} not found`);
        return isMarkActiveInSelection(markType)(state);
    };
}

var code = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$b,
    plugins: plugins$b,
    commands: commands$9,
    defaultKeys: defaultKeys$8,
    toggleCode: toggleCode,
    queryIsCodeActive: queryIsCodeActive
});

const spec$a = specFactory$a;
const plugins$a = pluginsFactory$a;
const commands$8 = {
    queryIsCodeActiveBlock,
};
const defaultKeys$7 = {
    toCodeBlock: 'Shift-Ctrl-\\',
    moveDown: 'Alt-ArrowDown',
    moveUp: 'Alt-ArrowUp',
    insertEmptyParaAbove: 'Mod-Shift-Enter',
    insertEmptyParaBelow: 'Mod-Enter',
};
const name$a = 'codeBlock';
function specFactory$a() {
    return {
        type: 'node',
        name: name$a,
        schema: {
            attrs: {
                language: { default: '' },
            },
            content: 'text*',
            marks: '',
            group: 'block',
            code: true,
            defining: true,
            draggable: false,
            parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
            toDOM: () => ['pre', ['code', 0]],
        },
        markdown: {
            toMarkdown(state, node) {
                state.write('```' + (node.attrs['language'] || '') + '\n');
                state.text(node.textContent, false);
                state.ensureNewLine();
                state.write('```');
                state.closeBlock(node);
            },
            parseMarkdown: {
                code_block: { block: name$a, noCloseToken: true },
                fence: {
                    block: name$a,
                    getAttrs: (tok) => ({ language: tok.info || '' }),
                    noCloseToken: true,
                },
            },
        },
    };
}
function pluginsFactory$a({ markdownShortcut = true, keybindings = defaultKeys$7, } = {}) {
    return ({ schema }) => {
        const type = getNodeType(schema, name$a);
        return [
            markdownShortcut && textblockTypeInputRule(/^```$/, type),
            keybindings &&
                keymap(createObject([
                    [keybindings.toCodeBlock, setBlockType(type)],
                    [keybindings.moveUp, moveNode(type, 'UP')],
                    [keybindings.moveDown, moveNode(type, 'DOWN')],
                    [
                        keybindings.insertEmptyParaAbove,
                        filter(queryIsCodeActiveBlock(), insertEmpty(getParaNodeType(schema), 'above', false)),
                    ],
                    [
                        keybindings.insertEmptyParaBelow,
                        filter(queryIsCodeActiveBlock(), insertEmpty(getParaNodeType(schema), 'below', false)),
                    ],
                ])),
        ];
    };
}
function queryIsCodeActiveBlock() {
    return (state) => {
        const type = getNodeType(state, name$a);
        return Boolean(findParentNodeOfType(type)(state.selection));
    };
}

var codeBlock = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$a,
    plugins: plugins$a,
    commands: commands$8,
    defaultKeys: defaultKeys$7,
    queryIsCodeActiveBlock: queryIsCodeActiveBlock
});

const spec$9 = specFactory$9;
const plugins$9 = pluginsFactory$9;
const defaultKeys$6 = {
    insert: 'Shift-Enter',
};
const name$9 = 'hardBreak';
function specFactory$9() {
    return {
        type: 'node',
        name: name$9,
        schema: {
            inline: true,
            group: 'inline',
            selectable: false,
            parseDOM: [{ tag: 'br' }],
            toDOM: () => ['br'],
        },
        markdown: {
            toMarkdown(state, node, parent, index) {
                for (let i = index + 1; i < parent.childCount; i++) {
                    if (parent.child(i).type !== node.type) {
                        state.write('\\\n');
                        return;
                    }
                }
            },
            parseMarkdown: {
                hardbreak: { node: 'hardBreak' },
            },
        },
    };
}
function pluginsFactory$9({ keybindings = defaultKeys$6 } = {}) {
    return ({ schema }) => {
        const type = getNodeType(schema, name$9);
        const command = chainCommands(exitCode, (state, dispatch) => {
            if (dispatch) {
                dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
            }
            return true;
        });
        return [
            keybindings && keymap(createObject([[keybindings.insert, command]])),
        ];
    };
}

var hardBreak = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$9,
    plugins: plugins$9,
    defaultKeys: defaultKeys$6
});

const spec$8 = specFactory$8;
const plugins$8 = pluginsFactory$8;
const commands$7 = {
    toggleHeading,
    queryIsHeadingActive,
};
const defaultKeys$5 = {
    toH1: 'Shift-Ctrl-1',
    toH2: 'Shift-Ctrl-2',
    toH3: 'Shift-Ctrl-3',
    toH4: 'Shift-Ctrl-4',
    toH5: 'Shift-Ctrl-5',
    toH6: 'Shift-Ctrl-6',
    moveDown: 'Alt-ArrowDown',
    moveUp: 'Alt-ArrowUp',
    emptyCopy: 'Mod-c',
    emptyCut: 'Mod-x',
    insertEmptyParaAbove: 'Mod-Shift-Enter',
    jumpToStartOfHeading: browser.mac ? 'Ctrl-a' : 'Ctrl-Home',
    jumpToEndOfHeading: browser.mac ? 'Ctrl-e' : 'Ctrl-End',
    insertEmptyParaBelow: 'Mod-Enter',
    toggleCollapse: undefined,
};
const name$8 = 'heading';
const defaultLevels = [1, 2, 3, 4, 5, 6];
const checkIsInHeading = (state) => {
    const type = getNodeType(state, name$8);
    return findParentNodeOfType(type)(state.selection);
};
const parseLevel = (levelStr) => {
    const level = parseInt(levelStr, 10);
    return Number.isNaN(level) ? undefined : level;
};
function specFactory$8({ levels = defaultLevels } = {}) {
    if (levels.some((r) => typeof r !== 'number')) {
        throw new Error('levels must be number');
    }
    const options = {
        levels,
    };
    return {
        type: 'node',
        name: name$8,
        schema: {
            attrs: {
                level: {
                    default: 1,
                },
                collapseContent: {
                    default: null,
                },
            },
            content: 'inline*',
            group: 'block',
            defining: true,
            draggable: false,
            parseDOM: levels.map((level) => {
                return {
                    tag: `h${level}`,
                    getAttrs: (dom) => {
                        const result = { level: parseLevel(level) };
                        const attrs = dom.getAttribute('data-bangle-attrs');
                        if (!attrs) {
                            return result;
                        }
                        const obj = JSON.parse(attrs);
                        return Object.assign({}, result, obj);
                    },
                };
            }),
            toDOM: (node) => {
                const result = [`h${node.attrs['level']}`, {}, 0];
                if (node.attrs['collapseContent']) {
                    result[1]['data-bangle-attrs'] = JSON.stringify({
                        collapseContent: node.attrs['collapseContent'],
                    });
                    result[1]['class'] = 'bangle-heading-collapsed';
                }
                return result;
            },
        },
        markdown: {
            toMarkdown(state, node) {
                state.write(state.repeat('#', node.attrs['level']) + ' ');
                state.renderInline(node);
                state.closeBlock(node);
            },
            parseMarkdown: {
                heading: {
                    block: name$8,
                    getAttrs: (tok) => {
                        return { level: parseLevel(tok.tag.slice(1)) };
                    },
                },
            },
        },
        options,
    };
}
function pluginsFactory$8({ markdownShortcut = true, keybindings = defaultKeys$5, } = {}) {
    return ({ schema, specRegistry }) => {
        const { levels } = specRegistry.options[name$8];
        const type = getNodeType(schema, name$8);
        const levelBindings = Object.fromEntries(levels.map((level) => [
            keybindings[`toH${level}`],
            setBlockType(type, { level }),
        ]));
        return [
            keybindings &&
                keymap({
                    ...levelBindings,
                    ...createObject([
                        [keybindings['moveUp'], moveNode(type, 'UP')],
                        [keybindings['moveDown'], moveNode(type, 'DOWN')],
                        [keybindings['jumpToStartOfHeading'], jumpToStartOfNode(type)],
                        [keybindings['jumpToEndOfHeading'], jumpToEndOfNode(type)],
                        [keybindings['emptyCopy'], copyEmptyCommand(type)],
                        [keybindings['emptyCut'], cutEmptyCommand(type)],
                        [keybindings['insertEmptyParaAbove'], insertEmptyParaAbove()],
                        [keybindings['insertEmptyParaBelow'], insertEmptyParaBelow()],
                        [keybindings['toggleCollapse'], toggleHeadingCollapse()],
                    ]),
                }),
            ...(markdownShortcut ? levels : []).map((level) => textblockTypeInputRule(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({
                level,
            }))),
        ];
    };
}
function toggleHeading(level = 3) {
    return (state, dispatch) => {
        if (queryIsHeadingActive(level)(state)) {
            const para = getParaNodeType(state);
            return setBlockType(para)(state, dispatch);
        }
        return setBlockType(getNodeType(state, name$8), { level })(state, dispatch);
    };
}
function queryIsHeadingActive(level) {
    return (state) => {
        const match = findParentNodeOfType(getNodeType(state, name$8))(state.selection);
        if (!match) {
            return false;
        }
        const { node } = match;
        if (level == null) {
            return true;
        }
        return node.attrs['level'] === level;
    };
}
function queryIsCollapseActive() {
    return (state) => {
        const match = findParentNodeOfType(getNodeType(state, name$8))(state.selection);
        if (!match || !isCollapsible(match)) {
            return false;
        }
        return Boolean(match.node.attrs['collapseContent']);
    };
}
function collapseHeading() {
    return (state, dispatch) => {
        const match = findParentNodeOfType(getNodeType(state, name$8))(state.selection);
        if (!match || !isCollapsible(match)) {
            return false;
        }
        const isCollapsed = queryIsCollapseActive()(state);
        if (isCollapsed) {
            return false;
        }
        const result = findCollapseFragment(match.node, state.doc);
        if (!result) {
            return false;
        }
        const { fragment, start, end } = result;
        let tr = state.tr.replaceWith(start, end, getNodeType(state, name$8).createChecked({
            ...match.node.attrs,
            collapseContent: fragment.toJSON(),
        }, match.node.content));
        if (state.selection instanceof TextSelection) {
            tr = tr.setSelection(TextSelection.create(tr.doc, state.selection.from));
        }
        if (dispatch) {
            dispatch(tr);
        }
        return true;
    };
}
function uncollapseHeading() {
    return (state, dispatch) => {
        const match = findParentNodeOfType(getNodeType(state, name$8))(state.selection);
        if (!match || !isCollapsible(match)) {
            return false;
        }
        const isCollapsed = queryIsCollapseActive()(state);
        if (!isCollapsed) {
            return false;
        }
        const frag = Fragment.fromJSON(state.schema, match.node.attrs['collapseContent']);
        let tr = state.tr.replaceWith(match.pos, match.pos + match.node.nodeSize, Fragment.fromArray([
            getNodeType(state, name$8).createChecked({
                ...match.node.attrs,
                collapseContent: null,
            }, match.node.content),
        ]).append(frag));
        if (state.selection instanceof TextSelection) {
            tr = tr.setSelection(TextSelection.create(tr.doc, state.selection.from));
        }
        if (dispatch) {
            dispatch(tr);
        }
        return true;
    };
}
function insertEmptyParaAbove() {
    return filter(checkIsInHeading, (state, dispatch, view) => {
        const para = getParaNodeType(state);
        return insertEmpty(para, 'above', false)(state, dispatch, view);
    });
}
function insertEmptyParaBelow() {
    return filter(checkIsInHeading, (state, dispatch, view) => {
        const para = getParaNodeType(state);
        return insertEmpty(para, 'below', false)(state, dispatch, view);
    });
}
function toggleHeadingCollapse() {
    return (state, dispatch) => {
        const match = findParentNodeOfType(getNodeType(state, name$8))(state.selection);
        if (!match || match.depth !== 1) {
            return false;
        }
        const isCollapsed = queryIsCollapseActive()(state);
        return isCollapsed
            ? uncollapseHeading()(state, dispatch)
            : collapseHeading()(state, dispatch);
    };
}
function uncollapseAllHeadings() {
    return (state, dispatch) => {
        const collapsibleNodes = listCollapsedHeading(state);
        let tr = state.tr;
        let offset = 0;
        for (const { node, pos } of collapsibleNodes) {
            let baseFrag = Fragment.fromJSON(state.schema, flattenFragmentJSON(node.attrs['collapseContent']));
            tr = tr.replaceWith(offset + pos, offset + pos + node.nodeSize, Fragment.fromArray([
                getNodeType(state, name$8).createChecked({
                    ...node.attrs,
                    collapseContent: null,
                }, node.content),
            ]).append(baseFrag));
            offset += baseFrag.size;
        }
        if (state.selection instanceof TextSelection) {
            tr = tr.setSelection(TextSelection.create(tr.doc, state.selection.from));
        }
        if (dispatch) {
            dispatch(tr);
        }
        return true;
    };
}
function listCollapsedHeading(state) {
    return findChildren(state.doc, (node) => node.type === getNodeType(state, name$8) &&
        Boolean(node.attrs['collapseContent']), false);
}
function listCollapsibleHeading(state) {
    return findChildren(state.doc, (node) => node.type === getNodeType(state, name$8), false);
}
const flattenFragmentJSON = (fragJSON) => {
    let result = [];
    fragJSON.forEach((nodeJSON) => {
        if (nodeJSON['type'] === 'heading' && nodeJSON['attrs'].collapseContent) {
            const collapseContent = nodeJSON['attrs'].collapseContent;
            result.push({
                ...nodeJSON,
                attrs: {
                    ...nodeJSON['attrs'],
                    collapseContent: null,
                },
            });
            result.push(...flattenFragmentJSON(collapseContent));
        }
        else {
            result.push(nodeJSON);
        }
    });
    return result;
};
// TODO
/**
 *
 * collapse all headings of given level
 */
// export function collapseHeadings(level) {}
/**
 * Collapsible headings are only allowed at depth of 1
 */
function isCollapsible(match) {
    if (match.depth !== 1) {
        return false;
    }
    return true;
}
function findCollapseFragment(matchNode, doc) {
    // Find the last child that will be inside of the collapse
    let start = undefined;
    let end = undefined;
    let isDone = false;
    const breakCriteria = (node) => {
        if (node.type !== matchNode.type) {
            return false;
        }
        if (node.attrs['level'] <= matchNode.attrs['level']) {
            return true;
        }
        return false;
    };
    doc.forEach((node, offset, index) => {
        if (isDone) {
            return;
        }
        if (node === matchNode) {
            start = { index, offset, node };
            return;
        }
        if (start) {
            if (breakCriteria(node)) {
                isDone = true;
                return;
            }
            // Avoid including trailing empty nodes
            // (like empty paragraphs inserted by trailing-node-plugins)
            // This is done to prevent trailing-node from inserting a new empty node
            // every time we toggle on off the collapse.
            if (node.content.size !== 0) {
                end = { index, offset, node };
            }
        }
    });
    if (!end) {
        return null;
    }
    // We are not adding parents position (doc will be parent always) to
    // the offsets since it will be 0
    const slice = doc.slice(start.offset + start.node.nodeSize, 
    // @ts-ignore end was incorrectly inferred as "never" here
    end.offset + end.node.nodeSize);
    return {
        fragment: slice.content,
        start: start.offset,
        // @ts-ignore end was incorrectly inferred as "never" here
        end: end.offset + end.node.nodeSize,
    };
}

var heading = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$8,
    plugins: plugins$8,
    commands: commands$7,
    defaultKeys: defaultKeys$5,
    toggleHeading: toggleHeading,
    queryIsHeadingActive: queryIsHeadingActive,
    queryIsCollapseActive: queryIsCollapseActive,
    collapseHeading: collapseHeading,
    uncollapseHeading: uncollapseHeading,
    insertEmptyParaAbove: insertEmptyParaAbove,
    insertEmptyParaBelow: insertEmptyParaBelow,
    toggleHeadingCollapse: toggleHeadingCollapse,
    uncollapseAllHeadings: uncollapseAllHeadings,
    listCollapsedHeading: listCollapsedHeading,
    listCollapsibleHeading: listCollapsibleHeading,
    flattenFragmentJSON: flattenFragmentJSON
});

const spec$7 = specFactory$7;
const plugins$7 = pluginsFactory$7;
const name$7 = 'horizontalRule';
function specFactory$7() {
    return {
        type: 'node',
        name: name$7,
        schema: {
            group: 'block',
            parseDOM: [{ tag: 'hr' }],
            toDOM: () => ['hr'],
        },
        markdown: {
            toMarkdown(state, node) {
                state.write(node.attrs['markup'] || '---');
                state.closeBlock(node);
            },
            parseMarkdown: { hr: { node: name$7 } },
        },
    };
}
function pluginsFactory$7({ markdownShortcut = true } = {}) {
    return ({ schema }) => {
        const type = getNodeType(schema, name$7);
        return [
            markdownShortcut &&
                new InputRule(/^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end) => {
                    if (!match[0]) {
                        return null;
                    }
                    let tr = state.tr.replaceWith(start - 1, end, type.createChecked());
                    // Find the paragraph that contains the "---" shortcut text, we need
                    // it below for deciding whether to insert a new paragraph after the
                    // hr.
                    const $para = state.doc.resolve(start);
                    let insertParaAfter = false;
                    if ($para.end() != end) {
                        // if the paragraph has more characters, e.g. "---abc", then no
                        // need to insert a new paragraph
                        insertParaAfter = false;
                    }
                    else if ($para.after() == $para.end(-1)) {
                        // if the paragraph is the last child of its parent, then insert a
                        // new paragraph
                        insertParaAfter = true;
                    }
                    else {
                        const nextNode = state.doc.resolve($para.after()).nodeAfter;
                        // if the next node is a hr, then insert a new paragraph
                        insertParaAfter = nextNode.type === type;
                    }
                    return insertParaAfter
                        ? safeInsert(getParaNodeType(state).createChecked(), tr.mapping.map($para.after()))(tr)
                        : tr;
                }),
        ];
    };
}

var horizontalRule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$7,
    plugins: plugins$7
});

// From Prosemirror https://github.com/prosemirror/prosemirror-markdown/blob/6107527995873d6199bc533a753b614378747056/src/to_markdown.ts#L380
// Tries to wrap the string with `"` , if not `''` else `()`
function quote(str) {
    var wrap = str.indexOf('"') === -1 ? '""' : str.indexOf("'") === -1 ? "''" : '()';
    return wrap[0] + str + wrap[1];
}

const spec$6 = specFactory$6;
const plugins$6 = pluginsFactory$6;
const commands$6 = {};
const name$6 = 'image';
function specFactory$6() {
    return {
        type: 'node',
        name: name$6,
        schema: {
            inline: true,
            attrs: {
                src: {},
                alt: {
                    default: null,
                },
                title: {
                    default: null,
                },
            },
            group: 'inline',
            draggable: true,
            parseDOM: [
                {
                    tag: 'img[src]',
                    getAttrs: (dom) => ({
                        src: dom.getAttribute('src'),
                        title: dom.getAttribute('title'),
                        alt: dom.getAttribute('alt'),
                    }),
                },
            ],
            toDOM: (node) => {
                return ['img', node.attrs];
            },
        },
        markdown: {
            toMarkdown(state, node) {
                const text = state.esc(node.attrs['alt'] || '');
                const url = state.esc(node.attrs['src']) +
                    (node.attrs['title'] ? ' ' + quote(node.attrs['title']) : '');
                state.write(`![${text}](${url})`);
            },
            parseMarkdown: {
                image: {
                    node: name$6,
                    getAttrs: (tok) => ({
                        src: tok.attrGet('src'),
                        title: tok.attrGet('title') || null,
                        alt: (tok.children[0] && tok.children[0].content) || null,
                    }),
                },
            },
        },
    };
}
function pluginsFactory$6({ handleDragAndDrop = true, acceptFileType = 'image/*', createImageNodes = defaultCreateImageNodes, } = {}) {
    return ({ schema }) => {
        const type = getNodeType(schema, name$6);
        return [
            new InputRule(/!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/, (state, match, start, end) => {
                let [, alt, src, title] = match;
                if (!src) {
                    return null;
                }
                if (!title) {
                    title = alt;
                }
                return state.tr.replaceWith(start, end, type.create({
                    src,
                    alt,
                    title,
                }));
            }),
            handleDragAndDrop &&
                new Plugin({
                    key: new PluginKey(name$6 + '-drop-paste'),
                    props: {
                        handleDOMEvents: {
                            drop(view, _event) {
                                const event = _event;
                                if (event.dataTransfer == null) {
                                    return false;
                                }
                                const files = getFileData(event.dataTransfer, acceptFileType, true);
                                // TODO should we handle all drops but just show error?
                                // returning false here would just default to native behaviour
                                // But then any drop handler would fail to work.
                                if (!files || files.length === 0) {
                                    return false;
                                }
                                event.preventDefault();
                                const coordinates = view.posAtCoords({
                                    left: event.clientX,
                                    top: event.clientY,
                                });
                                createImageNodes(files, getNodeType(view.state, name$6), view).then((imageNodes) => {
                                    addImagesToView(view, coordinates == null ? undefined : coordinates.pos, imageNodes);
                                });
                                return true;
                            },
                        },
                        handlePaste: (view, rawEvent) => {
                            const event = rawEvent;
                            if (!event.clipboardData) {
                                return false;
                            }
                            const files = getFileData(event.clipboardData, acceptFileType, true);
                            if (!files || files.length === 0) {
                                return false;
                            }
                            createImageNodes(files, getNodeType(view.state, name$6), view).then((imageNodes) => {
                                addImagesToView(view, view.state.selection.from, imageNodes);
                            });
                            return true;
                        },
                    },
                }),
        ];
    };
}
async function defaultCreateImageNodes(files, imageType, _view) {
    let resolveBinaryStrings = await Promise.all(files.map((file) => readFileAsBinaryString(file)));
    return resolveBinaryStrings.map((binaryStr) => {
        return imageType.create({
            src: binaryStr,
        });
    });
}
function addImagesToView(view, pos, imageNodes) {
    for (const node of imageNodes) {
        const { tr } = view.state;
        let newTr = safeInsert(node, pos)(tr);
        if (newTr === tr) {
            continue;
        }
        view.dispatch(newTr);
    }
}
function readFileAsBinaryString(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const onLoadBinaryString = (readerEvt) => {
            const binarySrc = btoa(readerEvt.target.result);
            resolve(`data:${file.type};base64,${binarySrc}`);
        };
        const onLoadDataUrl = (readerEvt) => {
            resolve(readerEvt.target.result);
        };
        reader.onerror = () => {
            reject(new Error('Error reading file' + file.name));
        };
        // Some browsers do not support this
        if ('readAsDataURL' in reader) {
            reader.onload = onLoadDataUrl;
            reader.readAsDataURL(file);
        }
        else {
            // @ts-ignore reader was incorrectly inferred as 'never'
            reader.onload = onLoadBinaryString;
            // @ts-ignore
            reader.readAsBinaryString(file);
        }
    });
}
function getFileData(data, accept, multiple) {
    const dragDataItems = getMatchingItems(data.items, accept, multiple);
    const files = [];
    dragDataItems.forEach((item) => {
        const file = item && item.getAsFile();
        if (file == null) {
            return;
        }
        files.push(file);
    });
    return files;
}
function getMatchingItems(list, accept, multiple) {
    const dataItems = Array.from(list);
    let results;
    // Return the first item (or undefined) if our filter is for all files
    if (accept === '') {
        results = dataItems.filter((item) => item.kind === 'file');
        return multiple ? results : [results[0]];
    }
    const accepts = accept
        .toLowerCase()
        .split(',')
        .map((accept) => {
        return accept.split('/').map((part) => part.trim());
    })
        .filter((acceptParts) => acceptParts.length === 2); // Filter invalid values
    const predicate = (item) => {
        if (item.kind !== 'file') {
            return false;
        }
        const [typeMain, typeSub] = item.type
            .toLowerCase()
            .split('/')
            .map((s) => s.trim());
        for (const [acceptMain, acceptSub] of accepts) {
            // Look for an exact match, or a partial match if * is accepted, eg image/*.
            if (typeMain === acceptMain &&
                (acceptSub === '*' || typeSub === acceptSub)) {
                return true;
            }
        }
        return false;
    };
    results = results = dataItems.filter(predicate);
    if (multiple === false) {
        results = [results[0]];
    }
    return results;
}
const updateImageNodeAttribute = (attr = {}) => (state, dispatch) => {
    if (!(state.selection instanceof NodeSelection) || !state.selection.node) {
        return false;
    }
    const { node } = state.selection;
    if (node.type !== getNodeType(state, name$6)) {
        return false;
    }
    if (dispatch) {
        dispatch(state.tr.setNodeMarkup(state.selection.$from.pos, undefined, {
            ...node.attrs,
            ...attr,
        }));
    }
    return true;
};

var image = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$6,
    plugins: plugins$6,
    commands: commands$6,
    updateImageNodeAttribute: updateImageNodeAttribute
});

const spec$5 = specFactory$5;
const plugins$5 = pluginsFactory$5;
const commands$5 = {
    toggleItalic,
    queryIsItalicActive,
};
const defaultKeys$4 = {
    toggleItalic: 'Mod-i',
};
const name$5 = 'italic';
const getTypeFromSchema$3 = (schema) => {
    const markType = schema.marks[name$5];
    assertNotUndefined(markType, `markType ${name$5} not found`);
    return markType;
};
function specFactory$5() {
    return {
        type: 'mark',
        name: name$5,
        schema: {
            parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
            toDOM: () => ['em', 0],
        },
        markdown: {
            toMarkdown: {
                open: '_',
                close: '_',
                mixable: true,
                expelEnclosingWhitespace: true,
            },
            parseMarkdown: {
                em: { mark: name$5 },
            },
        },
    };
}
function pluginsFactory$5({ keybindings = defaultKeys$4 } = {}) {
    return ({ schema }) => {
        const type = getTypeFromSchema$3(schema);
        return [
            markPasteRule$1(/_([^_]+)_/g, type),
            markPasteRule$1(/\*([^*]+)\*/g, type),
            markInputRule(/(?:^|\s)((?:_)((?:[^_]+))(?:_))$/, type),
            markInputRule(/(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/, type),
            keybindings &&
                keymap(createObject([[keybindings.toggleItalic, toggleMark(type)]])),
        ];
    };
}
function toggleItalic() {
    return (state, dispatch, _view) => {
        const markType = state.schema.marks[name$5];
        assertNotUndefined(markType, `markType ${name$5} not found`);
        return toggleMark(markType)(state, dispatch);
    };
}
function queryIsItalicActive() {
    return (state) => {
        const markType = state.schema.marks[name$5];
        assertNotUndefined(markType, `markType ${name$5} not found`);
        return isMarkActiveInSelection(markType)(state);
    };
}

var italic = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$5,
    plugins: plugins$5,
    commands: commands$5,
    defaultKeys: defaultKeys$4,
    toggleItalic: toggleItalic,
    queryIsItalicActive: queryIsItalicActive
});

const spec$4 = specFactory$4;
const plugins$4 = pluginsFactory$4;
const commands$4 = {
    createLink,
    updateLink,
    queryLinkAttrs,
    queryIsLinkAllowedInRange,
    queryIsLinkActive,
    queryIsSelectionAroundLink,
};
const name$4 = 'link';
const getTypeFromSchema$2 = (schema) => {
    const markType = schema.marks[name$4];
    assertNotUndefined(markType, `markType ${name$4} not found`);
    return markType;
};
function specFactory$4({ openOnClick = false, openOnNewTab = true, } = {}) {
    return {
        type: 'mark',
        name: name$4,
        schema: {
            attrs: {
                href: {
                    default: null,
                },
            },
            inclusive: false,
            parseDOM: [
                {
                    tag: 'a[href]',
                    getAttrs: (dom) => ({
                        href: dom.getAttribute('href'),
                    }),
                },
            ],
            toDOM: (node) => [
                'a',
                openOnNewTab
                    ? {
                        ...node.attrs,
                        rel: 'noopener noreferrer nofollow',
                        target: '_blank',
                    }
                    : {
                        ...node.attrs,
                        rel: 'noopener noreferrer nofollow',
                    },
                0,
            ],
        },
        markdown: {
            toMarkdown: {
                open(_state, mark, parent, index) {
                    return isPlainURL(mark, parent, index, 1) ? '<' : '[';
                },
                close(state, mark, parent, index) {
                    return isPlainURL(mark, parent, index, -1)
                        ? '>'
                        : '](' +
                            state.esc(mark.attrs['href']) +
                            (mark.attrs['title'] ? ' ' + quote(mark.attrs['title']) : '') +
                            ')';
                },
            },
            parseMarkdown: {
                link: {
                    mark: 'link',
                    getAttrs: (tok) => ({
                        href: tok.attrGet('href'),
                        title: tok.attrGet('title') || null,
                    }),
                },
            },
        },
        options: {
            openOnClick,
        },
    };
}
function pluginsFactory$4() {
    return ({ schema, specRegistry }) => {
        // TODO why is this an option in schema
        const { openOnClick } = specRegistry.options[name$4];
        const type = getTypeFromSchema$2(schema);
        return [
            autoLinkInputRule(type),
            pasteLink(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g),
            markPasteRule(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g, type, (match) => ({ href: match })),
            openOnClick &&
                new Plugin({
                    props: {
                        handleClick: (view, _pos, event) => {
                            const { schema } = view.state;
                            const attrs = getMarkAttrs(view.state, getTypeFromSchema$2(schema));
                            if (attrs['href'] && event.target instanceof HTMLAnchorElement) {
                                event.stopPropagation();
                                window.open(attrs['href']);
                            }
                            return false;
                        },
                    },
                }),
        ];
    };
}
// scheme :: name :: tld
// TLDs are from http://data.iana.org/TLD/tlds-alpha-by-domain.txt
const URL_REGEX = /(^|\s)(((http|https|ftp):\/\/)?(?:[^\s.:\/]+\.)+(?:aaa|aarp|abarth|abb|abbott|abbvie|abc|able|abogado|abudhabi|ac|academy|accenture|accountant|accountants|aco|actor|ad|adac|ads|adult|ae|aeg|aero|aetna|af|afamilycompany|afl|africa|ag|agakhan|agency|ai|aig|airbus|airforce|airtel|akdn|al|alfaromeo|alibaba|alipay|allfinanz|allstate|ally|alsace|alstom|am|amazon|americanexpress|americanfamily|amex|amfam|amica|amsterdam|analytics|android|anquan|anz|ao|aol|apartments|app|apple|aq|aquarelle|ar|arab|aramco|archi|army|arpa|art|arte|as|asda|asia|associates|at|athleta|attorney|au|auction|audi|audible|audio|auspost|author|auto|autos|avianca|aw|aws|ax|axa|az|azure|ba|baby|baidu|banamex|bananarepublic|band|bank|bar|barcelona|barclaycard|barclays|barefoot|bargains|baseball|basketball|bauhaus|bayern|bb|bbc|bbt|bbva|bcg|bcn|bd|be|beats|beauty|beer|bentley|berlin|best|bestbuy|bet|bf|bg|bh|bharti|bi|bible|bid|bike|bing|bingo|bio|biz|bj|black|blackfriday|blockbuster|blog|bloomberg|blue|bm|bms|bmw|bn|bnpparibas|bo|boats|boehringer|bofa|bom|bond|boo|book|booking|bosch|bostik|boston|bot|boutique|box|br|bradesco|bridgestone|broadway|broker|brother|brussels|bs|bt|budapest|bugatti|build|builders|business|buy|buzz|bv|bw|by|bz|bzh|ca|cab|cafe|cal|call|calvinklein|cam|camera|camp|cancerresearch|canon|capetown|capital|capitalone|car|caravan|cards|care|career|careers|cars|casa|case|cash|casino|cat|catering|catholic|cba|cbn|cbre|cbs|cc|cd|center|ceo|cern|cf|cfa|cfd|cg|ch|chanel|channel|charity|chase|chat|cheap|chintai|christmas|chrome|church|ci|cipriani|circle|cisco|citadel|citi|citic|city|cityeats|ck|cl|claims|cleaning|click|clinic|clinique|clothing|cloud|club|clubmed|cm|cn|co|coach|codes|coffee|college|cologne|com|comcast|commbank|community|company|compare|computer|comsec|condos|construction|consulting|contact|contractors|cooking|cookingchannel|cool|coop|corsica|country|coupon|coupons|courses|cpa|cr|credit|creditcard|creditunion|cricket|crown|crs|cruise|cruises|csc|cu|cuisinella|cv|cw|cx|cy|cymru|cyou|cz|dabur|dad|dance|data|date|dating|datsun|day|dclk|dds|de|deal|dealer|deals|degree|delivery|dell|deloitte|delta|democrat|dental|dentist|desi|design|dev|dhl|diamonds|diet|digital|direct|directory|discount|discover|dish|diy|dj|dk|dm|dnp|do|docs|doctor|dog|domains|dot|download|drive|dtv|dubai|duck|dunlop|dupont|durban|dvag|dvr|dz|earth|eat|ec|eco|edeka|edu|education|ee|eg|email|emerck|energy|engineer|engineering|enterprises|epson|equipment|er|ericsson|erni|es|esq|estate|et|etisalat|eu|eurovision|eus|events|exchange|expert|exposed|express|extraspace|fage|fail|fairwinds|faith|family|fan|fans|farm|farmers|fashion|fast|fedex|feedback|ferrari|ferrero|fi|fiat|fidelity|fido|film|final|finance|financial|fire|firestone|firmdale|fish|fishing|fit|fitness|fj|fk|flickr|flights|flir|florist|flowers|fly|fm|fo|foo|food|foodnetwork|football|ford|forex|forsale|forum|foundation|fox|fr|free|fresenius|frl|frogans|frontdoor|frontier|ftr|fujitsu|fun|fund|furniture|futbol|fyi|ga|gal|gallery|gallo|gallup|game|games|gap|garden|gay|gb|gbiz|gd|gdn|ge|gea|gent|genting|george|gf|gg|ggee|gh|gi|gift|gifts|gives|giving|gl|glade|glass|gle|global|globo|gm|gmail|gmbh|gmo|gmx|gn|godaddy|gold|goldpoint|golf|goo|goodyear|goog|google|gop|got|gov|gp|gq|gr|grainger|graphics|gratis|green|gripe|grocery|group|gs|gt|gu|guardian|gucci|guge|guide|guitars|guru|gw|gy|hair|hamburg|hangout|haus|hbo|hdfc|hdfcbank|health|healthcare|help|helsinki|here|hermes|hgtv|hiphop|hisamitsu|hitachi|hiv|hk|hkt|hm|hn|hockey|holdings|holiday|homedepot|homegoods|homes|homesense|honda|horse|hospital|host|hosting|hot|hoteles|hotels|hotmail|house|how|hr|hsbc|ht|hu|hughes|hyatt|hyundai|ibm|icbc|ice|icu|id|ie|ieee|ifm|ikano|il|im|imamat|imdb|immo|immobilien|in|inc|industries|infiniti|info|ing|ink|institute|insurance|insure|int|international|intuit|investments|io|ipiranga|iq|ir|irish|is|ismaili|ist|istanbul|it|itau|itv|jaguar|java|jcb|je|jeep|jetzt|jewelry|jio|jll|jm|jmp|jnj|jo|jobs|joburg|jot|joy|jp|jpmorgan|jprs|juegos|juniper|kaufen|kddi|ke|kerryhotels|kerrylogistics|kerryproperties|kfh|kg|kh|ki|kia|kim|kinder|kindle|kitchen|kiwi|km|kn|koeln|komatsu|kosher|kp|kpmg|kpn|kr|krd|kred|kuokgroup|kw|ky|kyoto|kz|la|lacaixa|lamborghini|lamer|lancaster|lancia|land|landrover|lanxess|lasalle|lat|latino|latrobe|law|lawyer|lb|lc|lds|lease|leclerc|lefrak|legal|lego|lexus|lgbt|li|lidl|life|lifeinsurance|lifestyle|lighting|like|lilly|limited|limo|lincoln|linde|link|lipsy|live|living|lixil|lk|llc|llp|loan|loans|locker|locus|loft|lol|london|lotte|lotto|love|lpl|lplfinancial|lr|ls|lt|ltd|ltda|lu|lundbeck|luxe|luxury|lv|ly|ma|macys|madrid|maif|maison|makeup|man|management|mango|map|market|marketing|markets|marriott|marshalls|maserati|mattel|mba|mc|mckinsey|md|me|med|media|meet|melbourne|meme|memorial|men|menu|merckmsd|mg|mh|miami|microsoft|mil|mini|mint|mit|mitsubishi|mk|ml|mlb|mls|mm|mma|mn|mo|mobi|mobile|moda|moe|moi|mom|monash|money|monster|mormon|mortgage|moscow|moto|motorcycles|mov|movie|mp|mq|mr|ms|msd|mt|mtn|mtr|mu|museum|mutual|mv|mw|mx|my|mz|na|nab|nagoya|name|natura|navy|nba|nc|ne|nec|net|netbank|netflix|network|neustar|new|news|next|nextdirect|nexus|nf|nfl|ng|ngo|nhk|ni|nico|nike|nikon|ninja|nissan|nissay|nl|no|nokia|northwesternmutual|norton|now|nowruz|nowtv|np|nr|nra|nrw|ntt|nu|nyc|nz|obi|observer|off|office|okinawa|olayan|olayangroup|oldnavy|ollo|om|omega|one|ong|onl|online|ooo|open|oracle|orange|org|organic|origins|osaka|otsuka|ott|ovh|pa|page|panasonic|paris|pars|partners|parts|party|passagens|pay|pccw|pe|pet|pf|pfizer|pg|ph|pharmacy|phd|philips|phone|photo|photography|photos|physio|pics|pictet|pictures|pid|pin|ping|pink|pioneer|pizza|pk|pl|place|play|playstation|plumbing|plus|pm|pn|pnc|pohl|poker|politie|porn|post|pr|pramerica|praxi|press|prime|pro|prod|productions|prof|progressive|promo|properties|property|protection|pru|prudential|ps|pt|pub|pw|pwc|py|qa|qpon|quebec|quest|qvc|racing|radio|raid|re|read|realestate|realtor|realty|recipes|red|redstone|redumbrella|rehab|reise|reisen|reit|reliance|ren|rent|rentals|repair|report|republican|rest|restaurant|review|reviews|rexroth|rich|richardli|ricoh|ril|rio|rip|rmit|ro|rocher|rocks|rodeo|rogers|room|rs|rsvp|ru|rugby|ruhr|run|rw|rwe|ryukyu|sa|saarland|safe|safety|sakura|sale|salon|samsclub|samsung|sandvik|sandvikcoromant|sanofi|sap|sarl|sas|save|saxo|sb|sbi|sbs|sc|sca|scb|schaeffler|schmidt|scholarships|school|schule|schwarz|science|scjohnson|scot|sd|se|search|seat|secure|security|seek|select|sener|services|ses|seven|sew|sex|sexy|sfr|sg|sh|shangrila|sharp|shaw|shell|shia|shiksha|shoes|shop|shopping|shouji|show|showtime|si|silk|sina|singles|site|sj|sk|ski|skin|sky|skype|sl|sling|sm|smart|smile|sn|sncf|so|soccer|social|softbank|software|sohu|solar|solutions|song|sony|soy|spa|space|sport|spot|sr|srl|ss|st|stada|staples|star|statebank|statefarm|stc|stcgroup|stockholm|storage|store|stream|studio|study|style|su|sucks|supplies|supply|support|surf|surgery|suzuki|sv|swatch|swiftcover|swiss|sx|sy|sydney|systems|sz|tab|taipei|talk|taobao|target|tatamotors|tatar|tattoo|tax|taxi|tc|tci|td|tdk|team|tech|technology|tel|temasek|tennis|teva|tf|tg|th|thd|theater|theatre|tiaa|tickets|tienda|tiffany|tips|tires|tirol|tj|tjmaxx|tjx|tk|tkmaxx|tl|tm|tmall|tn|to|today|tokyo|tools|top|toray|toshiba|total|tours|town|toyota|toys|tr|trade|trading|training|travel|travelchannel|travelers|travelersinsurance|trust|trv|tt|tube|tui|tunes|tushu|tv|tvs|tw|tz|ua|ubank|ubs|ug|uk|unicom|university|uno|uol|ups|us|uy|uz|va|vacations|vana|vanguard|vc|ve|vegas|ventures|verisign|versicherung|vet|vg|vi|viajes|video|vig|viking|villas|vin|vip|virgin|visa|vision|viva|vivo|vlaanderen|vn|vodka|volkswagen|volvo|vote|voting|voto|voyage|vu|vuelos|wales|walmart|walter|wang|wanggou|watch|watches|weather|weatherchannel|webcam|weber|website|wed|wedding|weibo|weir|wf|whoswho|wien|wiki|williamhill|win|windows|wine|winners|wme|wolterskluwer|woodside|work|works|world|wow|ws|wtc|wtf|xbox|xerox|xfinity|xihuan|xin|xn--11b4c3d|xn--1ck2e1b|xn--1qqw23a|xn--2scrj9c|xn--30rr7y|xn--3bst00m|xn--3ds443g|xn--3e0b707e|xn--3hcrj9c|xn--3oq18vl8pn36a|xn--3pxu8k|xn--42c2d9a|xn--45br5cyl|xn--45brj9c|xn--45q11c|xn--4dbrk0ce|xn--4gbrim|xn--54b7fta0cc|xn--55qw42g|xn--55qx5d|xn--5su34j936bgsg|xn--5tzm5g|xn--6frz82g|xn--6qq986b3xl|xn--80adxhks|xn--80ao21a|xn--80aqecdr1a|xn--80asehdb|xn--80aswg|xn--8y0a063a|xn--90a3ac|xn--90ae|xn--90ais|xn--9dbq2a|xn--9et52u|xn--9krt00a|xn--b4w605ferd|xn--bck1b9a5dre4c|xn--c1avg|xn--c2br7g|xn--cck2b3b|xn--cckwcxetd|xn--cg4bki|xn--clchc0ea0b2g2a9gcd|xn--czr694b|xn--czrs0t|xn--czru2d|xn--d1acj3b|xn--d1alf|xn--e1a4c|xn--eckvdtc9d|xn--efvy88h|xn--fct429k|xn--fhbei|xn--fiq228c5hs|xn--fiq64b|xn--fiqs8s|xn--fiqz9s|xn--fjq720a|xn--flw351e|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--fzys8d69uvgm|xn--g2xx48c|xn--gckr3f0f|xn--gecrj9c|xn--gk3at1e|xn--h2breg3eve|xn--h2brj9c|xn--h2brj9c8c|xn--hxt814e|xn--i1b6b1a6a2e|xn--imr513n|xn--io0a7i|xn--j1aef|xn--j1amh|xn--j6w193g|xn--jlq480n2rg|xn--jlq61u9w7b|xn--jvr189m|xn--kcrx77d1x4a|xn--kprw13d|xn--kpry57d|xn--kput3i|xn--l1acc|xn--lgbbat1ad8j|xn--mgb9awbf|xn--mgba3a3ejt|xn--mgba3a4f16a|xn--mgba7c0bbn0a|xn--mgbaakc7dvf|xn--mgbaam7a8h|xn--mgbab2bd|xn--mgbah1a3hjkrd|xn--mgbai9azgqp6j|xn--mgbayh7gpa|xn--mgbbh1a|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgbca7dzdo|xn--mgbcpq6gpa1a|xn--mgberp4a5d4ar|xn--mgbgu82a|xn--mgbi4ecexp|xn--mgbpl2fh|xn--mgbt3dhd|xn--mgbtx2b|xn--mgbx4cd0ab|xn--mix891f|xn--mk1bu44c|xn--mxtq1m|xn--ngbc5azd|xn--ngbe9e0a|xn--ngbrx|xn--node|xn--nqv7f|xn--nqv7fs00ema|xn--nyqy26a|xn--o3cw4h|xn--ogbpf8fl|xn--otu796d|xn--p1acf|xn--p1ai|xn--pgbs0dh|xn--pssy2u|xn--q7ce6a|xn--q9jyb4c|xn--qcka1pmc|xn--qxa6a|xn--qxam|xn--rhqv96g|xn--rovu88b|xn--rvc1e0am3e|xn--s9brj9c|xn--ses554g|xn--t60b56a|xn--tckwe|xn--tiq49xqyj|xn--unup4y|xn--vermgensberater-ctb|xn--vermgensberatung-pwb|xn--vhquv|xn--vuq861b|xn--w4r85el8fhu5dnra|xn--w4rs40l|xn--wgbh1c|xn--wgbl6a|xn--xhq521b|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--y9a3aq|xn--yfro4i67o|xn--ygbi2ammx|xn--zfr164b|xxx|xyz|yachts|yahoo|yamaxun|yandex|ye|yodobashi|yoga|yokohama|you|youtube|yt|yun|za|zappos|zara|zero|zip|zm|zone|zuerich|zw))\s$/;
function autoLinkInputRule(type) {
    return new InputRule(URL_REGEX, (state, match, start, end) => {
        if (!match[0]) {
            return null;
        }
        const [_, leadingSpace, text, scheme] = match;
        if (!leadingSpace) {
            // Do nothing if there is already a link within [start, end]. This is for
            // cases like "<link>abc.com</link>def.com[]". In such case typing a space
            // after def.com should not auto link.
            let ignore = false;
            state.doc.nodesBetween(start, end, (node) => {
                if (ignore) {
                    return false;
                }
                if (type.isInSet(node.marks)) {
                    ignore = true;
                    return false;
                }
                return true;
            });
            if (ignore) {
                return null;
            }
        }
        // If no scheme, use default scheme "http://". Most https sites would do a
        // redirect for http request anyway.
        const href = scheme ? text : `http://${text}`;
        const tr = state.tr;
        tr.addMark(
        // Ignore the leading space, if any
        leadingSpace && leadingSpace.length > 0 ? start + 1 : start, end, type.create({ href: href }));
        // Append the space after the link
        tr.insertText(' ', end);
        return tr;
    });
}
function pasteLink(regexp) {
    return new Plugin({
        props: {
            handlePaste: function handlePastedLink(view, rawEvent) {
                const event = rawEvent;
                if (!event.clipboardData) {
                    return false;
                }
                let text = event.clipboardData.getData('text/plain');
                const html = event.clipboardData.getData('text/html');
                const isPlainText = text && !html;
                if (!isPlainText || view.state.selection.empty) {
                    return false;
                }
                const { state, dispatch } = view;
                const match = matchAllPlus(regexp, text);
                const singleMatch = match.length === 1 && match.every((m) => m.match);
                // Only handle if paste has one URL
                if (!singleMatch) {
                    return false;
                }
                return createLink(text)(state, dispatch);
            },
        },
    });
}
function markPasteRule(regexp, type, getAttrs) {
    return new Plugin({
        props: {
            transformPasted: function transformPasted(slice) {
                return mapSlice(slice, (node) => {
                    if (!node.isText) {
                        return node;
                    }
                    const text = node.text;
                    const matches = matchAllPlus(regexp, text);
                    return matches.map(({ start, end, match, subString }) => {
                        let newNode = node.cut(start, end);
                        if (match) {
                            var attrs = getAttrs instanceof Function ? getAttrs(subString) : getAttrs;
                            newNode = newNode.mark(type.create(attrs).addToSet(node.marks));
                        }
                        return newNode;
                    });
                });
            },
        },
    });
}
function isPlainURL(link, parent, index, side) {
    if (link.attrs['title'] || !/^\w+:/.test(link.attrs['href'])) {
        return false;
    }
    let content = parent.child(index + (side < 0 ? -1 : 0));
    if (!content.isText ||
        content.text !== link.attrs['href'] ||
        content.marks[content.marks.length - 1] !== link) {
        return false;
    }
    if (index === (side < 0 ? 1 : parent.childCount - 1)) {
        return true;
    }
    let next = parent.child(index + (side < 0 ? -2 : 1));
    return !link.isInSet(next.marks);
}
function isTextAtPos(pos) {
    return (state) => {
        const node = state.doc.nodeAt(pos);
        return !!node && node.isText;
    };
}
function setLink(from, to, href) {
    href = href && href.trim();
    return filter((state) => isTextAtPos(from)(state), (state, dispatch) => {
        const linkMark = getTypeFromSchema$2(state.schema);
        let tr = state.tr.removeMark(from, to, linkMark);
        if (href) {
            const mark = getTypeFromSchema$2(state.schema).create({
                href: href,
            });
            tr.addMark(from, to, mark);
        }
        if (dispatch) {
            dispatch(tr);
        }
        return true;
    });
}
/**
 *
 * Commands
 *
 */
/**
 * Sets the selection to href
 * @param {*} href
 */
function createLink(href) {
    return filter((state) => queryIsLinkAllowedInRange(state.selection.$from.pos, state.selection.$to.pos)(state), (state, dispatch) => {
        const [from, to] = [state.selection.$from.pos, state.selection.$to.pos];
        const linkMark = getTypeFromSchema$2(state.schema);
        let tr = state.tr.removeMark(from, to, linkMark);
        if (href.trim()) {
            const mark = getTypeFromSchema$2(state.schema).create({
                href: href,
            });
            tr.addMark(from, to, mark);
        }
        if (dispatch) {
            dispatch(tr);
        }
        return true;
    });
}
function updateLink(href) {
    return (state, dispatch) => {
        if (!state.selection.empty) {
            return setLink(state.selection.$from.pos, state.selection.$to.pos, href)(state, dispatch);
        }
        const { $from } = state.selection;
        const pos = $from.pos - $from.textOffset;
        const node = state.doc.nodeAt(pos);
        let to = pos;
        if (node) {
            to += node.nodeSize;
        }
        return setLink(pos, to, href)(state, dispatch);
    };
}
function queryLinkAttrs() {
    return (state) => {
        const { $from } = state.selection;
        const pos = $from.pos - $from.textOffset;
        const $pos = state.doc.resolve(pos);
        const node = state.doc.nodeAt(pos);
        const { nodeAfter } = $pos;
        if (!nodeAfter) {
            return undefined;
        }
        const type = getTypeFromSchema$2(state.schema);
        const mark = type.isInSet(nodeAfter.marks || []);
        if (mark) {
            return {
                href: mark.attrs['href'],
                text: node.textContent,
            };
        }
        return undefined;
    };
}
function queryIsLinkAllowedInRange(from, to) {
    return (state) => {
        const $from = state.doc.resolve(from);
        const $to = state.doc.resolve(to);
        const link = getTypeFromSchema$2(state.schema);
        if ($from.parent === $to.parent && $from.parent.isTextblock) {
            return $from.parent.type.allowsMarkType(link);
        }
        return undefined;
    };
}
function queryIsLinkActive() {
    return (state) => Boolean(getTypeFromSchema$2(state.schema).isInSet(state.selection.$from.marks()));
}
function queryIsSelectionAroundLink() {
    return (state) => {
        const { $from, $to } = state.selection;
        const node = $from.nodeAfter;
        return (!!node &&
            $from.textOffset === 0 &&
            $to.pos - $from.pos === node.nodeSize &&
            Boolean(getTypeFromSchema$2(state.schema).isInSet(node.marks)));
    };
}

var link = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$4,
    plugins: plugins$4,
    commands: commands$4,
    URL_REGEX: URL_REGEX,
    createLink: createLink,
    updateLink: updateLink,
    queryLinkAttrs: queryLinkAttrs,
    queryIsLinkAllowedInRange: queryIsLinkAllowedInRange,
    queryIsLinkActive: queryIsLinkActive,
    queryIsSelectionAroundLink: queryIsSelectionAroundLink
});

let log = () => { };
function listItemNodeViewPlugin(name) {
    const checkParentBulletList = (state, pos) => {
        if (pos === undefined) {
            return false;
        }
        return state.doc.resolve(pos).parent.type.name === 'bulletList';
    };
    const removeCheckbox = (instance) => {
        // already removed
        if (!instance.containerDOM.hasAttribute('data-bangle-is-todo')) {
            return;
        }
        instance.containerDOM.removeAttribute('data-bangle-is-todo');
        instance.containerDOM.removeChild(instance.containerDOM.firstChild);
    };
    const setupCheckbox = (attrs, updateAttrs, instance) => {
        // no need to create as it is already created
        if (instance.containerDOM.hasAttribute('data-bangle-is-todo')) {
            return;
        }
        const checkbox = createCheckbox(attrs['todoChecked'], (newValue) => {
            updateAttrs({
                // Fetch latest attrs as the one in outer
                // closure can be stale.
                todoChecked: newValue,
            });
        });
        instance.containerDOM.setAttribute('data-bangle-is-todo', '');
        instance.containerDOM.prepend(checkbox);
    };
    const createCheckbox = (todoChecked, onUpdate) => {
        const checkBox = createElement([
            'span',
            // @ts-ignore DOMOutputSpec from @types/prosemirror-model is buggy
            { contentEditable: false },
            [
                'input',
                {
                    type: 'checkbox',
                },
            ],
        ]);
        const inputElement = checkBox.querySelector('input');
        if (todoChecked) {
            inputElement.setAttribute('checked', '');
        }
        inputElement.addEventListener('input', (_event) => {
            log('change event', inputElement.checked);
            onUpdate(
            // note:  inputElement.checked is a bool
            inputElement.checked);
        });
        return checkBox;
    };
    return NodeView.createPlugin({
        name,
        containerDOM: [
            'li',
            {
                // To style our todo friend different than a regular li
                'data-bangle-name': name,
            },
        ],
        contentDOM: ['span', {}],
        renderHandlers: {
            create: (instance, { attrs, updateAttrs, getPos, view }) => {
                const todoChecked = attrs['todoChecked'];
                // branch if todo needs to be created
                if (todoChecked != null) {
                    // todo only makes sense if parent is bullet list
                    if (checkParentBulletList(view.state, getPos())) {
                        setupCheckbox(attrs, updateAttrs, instance);
                    }
                }
                // Connect the two contentDOM and containerDOM for pm to write to
                instance.containerDOM.appendChild(instance.contentDOM);
            },
            // We need to achieve a two way binding of the todoChecked state.
            // First binding: dom -> editor : done by  inputElement's `input` event listener
            // Second binding: editor -> dom: Done by the `update` handler below
            update: (instance, { attrs, view, getPos, updateAttrs }) => {
                const { todoChecked } = attrs;
                if (todoChecked == null) {
                    removeCheckbox(instance);
                    return;
                }
                // if parent is not bulletList i.e. it is orderedList
                if (!checkParentBulletList(view.state, getPos())) {
                    return;
                }
                // assume nothing about the dom elements state.
                // for example it is possible that the checkbox is not created
                // when a regular list is converted to todo list only update handler
                // will be called. The create handler was called in the past
                // but without the checkbox element, hence the checkbox wont be there
                setupCheckbox(attrs, updateAttrs, instance);
                const checkbox = instance.containerDOM.firstChild
                    .firstChild;
                checkbox.checked = todoChecked;
            },
            destroy: () => { },
        },
    });
}

const spec$3 = specFactory$3;
const plugins$3 = pluginsFactory$3;
const commands$3 = {
    indentListItem,
    outdentListItem,
    moveListItemUp,
    moveListItemDown,
};
const defaultKeys$3 = {
    toggleDone: browser.mac ? 'Ctrl-Enter' : 'Ctrl-I',
    indent: 'Tab',
    outdent: 'Shift-Tab',
    moveDown: 'Alt-ArrowDown',
    moveUp: 'Alt-ArrowUp',
    emptyCopy: 'Mod-c',
    emptyCut: 'Mod-x',
    insertEmptyListAbove: 'Mod-Shift-Enter',
    insertEmptyListBelow: 'Mod-Enter',
};
const name$3 = 'listItem';
const isValidList = (state) => {
    const type = getNodeType(state, name$3);
    return parentHasDirectParentOfType(type, [
        getNodeType(state, 'bulletList'),
        getNodeType(state, 'orderedList'),
    ]);
};
function specFactory$3() {
    const { toDOM, parseDOM } = domSerializationHelpers(name$3, {
        tag: 'li',
        // @ts-ignore DOMOutputSpec in @types is buggy
        content: 0,
    });
    return {
        type: 'node',
        name: name$3,
        schema: {
            content: '(paragraph) (paragraph | bulletList | orderedList)*',
            defining: true,
            draggable: true,
            attrs: {
                // We overload the todoChecked value to
                // decide if its a regular bullet list or a list with todo
                // todoChecked can take following values:
                //   null => regular bullet list
                //   true => todo list with checked
                //   false => todo list with no check
                todoChecked: {
                    default: null,
                },
            },
            toDOM,
            parseDOM,
        },
        markdown: {
            toMarkdown(state, node) {
                if (node.attrs['todoChecked'] != null) {
                    state.write(node.attrs['todoChecked'] ? '[x] ' : '[ ] ');
                }
                state.renderContent(node);
            },
            parseMarkdown: {
                list_item: {
                    block: name$3,
                    getAttrs: (tok) => {
                        let todoChecked = null;
                        const todoIsDone = tok.attrGet('isDone');
                        if (todoIsDone === 'yes') {
                            todoChecked = true;
                        }
                        else if (todoIsDone === 'no') {
                            todoChecked = false;
                        }
                        return {
                            todoChecked,
                        };
                    },
                },
            },
        },
    };
}
function pluginsFactory$3({ keybindings = defaultKeys$3, nodeView = true, } = {}) {
    return ({ schema }) => {
        const type = getNodeType(schema, name$3);
        return [
            keybindings &&
                keymap({
                    [keybindings.toggleDone]: filter(isValidList, updateNodeAttrs(getNodeType(schema, 'listItem'), (attrs) => ({
                        ...attrs,
                        todoChecked: attrs['todoChecked'] == null ? false : !attrs['todoChecked'],
                    }))),
                    Backspace: backspaceKeyCommand(type),
                    Enter: enterKeyCommand(type),
                    ...createObject([
                        [keybindings.indent, indentListItem()],
                        [keybindings.outdent, outdentListItem()],
                        [keybindings.moveUp, moveListItemUp()],
                        [keybindings.moveDown, moveListItemDown()],
                        [keybindings.emptyCut, filter(isValidList, cutEmptyCommand(type))],
                        [
                            keybindings.emptyCopy,
                            filter(isValidList, copyEmptyCommand(type)),
                        ],
                        [keybindings.insertEmptyListAbove, insertEmptySiblingListAbove()],
                        [keybindings.insertEmptyListBelow, insertEmptySiblingListBelow()],
                    ]),
                }),
            nodeView && listItemNodeViewPlugin(name$3),
        ];
    };
}
function indentListItem() {
    return (state, dispatch) => {
        const type = getNodeType(state, name$3);
        return indentList(type)(state, dispatch);
    };
}
function outdentListItem() {
    return (state, dispatch, view) => {
        const type = getNodeType(state, name$3);
        return outdentList(type)(state, dispatch, view);
    };
}
const isSelectionInsideTodo = (state) => {
    return isNodeTodo(state.selection.$from.node(-1), state.schema);
};
function moveListItem(dir) {
    return (state, dispatch, view) => {
        const type = getNodeType(state, name$3);
        const isBulletList = parentHasDirectParentOfType(type, [
            getNodeType(state, 'bulletList'),
            getNodeType(state, 'orderedList'),
        ]);
        const move = (dir) => chainCommands(moveNode(type, dir), (state, dispatch, view) => {
            const node = state.selection.$from.node(-3);
            const isParentTodo = isNodeTodo(node, state.schema);
            const result = moveEdgeListItem(type, dir)(state, dispatch, view);
            if (!result) {
                return false;
            }
            // if parent was a todo convert the moved edge node
            // to todo bullet item
            if (isParentTodo && dispatch) {
                const state = view.state;
                let { tr, schema } = state;
                tr = setTodoCheckedAttr(tr, schema, state.selection.$from.node(-1), state.selection.$from.before(-1));
                dispatch(tr);
            }
            return true;
        });
        return filter(isBulletList, move(dir))(state, dispatch, view);
    };
}
function moveListItemUp() {
    return moveListItem('UP');
}
function moveListItemDown() {
    return moveListItem('DOWN');
}
function insertEmptySiblingList(isAbove = true) {
    return (state, dispatch, view) => {
        const type = getNodeType(state, name$3);
        return chainCommands(filter(isSelectionInsideTodo, insertEmpty(type, isAbove ? 'above' : 'below', true, {
            todoChecked: false,
        })), filter(isValidList, insertEmpty(type, isAbove ? 'above' : 'below', true)))(state, dispatch, view);
    };
}
function insertEmptySiblingListAbove() {
    return insertEmptySiblingList(true);
}
function insertEmptySiblingListBelow() {
    return insertEmptySiblingList(false);
}

var listItemComponent = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$3,
    plugins: plugins$3,
    commands: commands$3,
    defaultKeys: defaultKeys$3,
    indentListItem: indentListItem,
    outdentListItem: outdentListItem,
    moveListItemUp: moveListItemUp,
    moveListItemDown: moveListItemDown,
    insertEmptySiblingList: insertEmptySiblingList,
    insertEmptySiblingListAbove: insertEmptySiblingListAbove,
    insertEmptySiblingListBelow: insertEmptySiblingListBelow
});

const spec$2 = specFactory$2;
const plugins$2 = pluginsFactory$2;
const commands$2 = {
    toggleOrderedList,
    queryIsOrderedListActive,
};
const defaultKeys$2 = {
    toggle: 'Shift-Ctrl-9',
};
const name$2 = 'orderedList';
function specFactory$2() {
    return {
        type: 'node',
        name: name$2,
        schema: {
            attrs: {
                order: {
                    default: 1,
                },
                // a style preference attribute which be used for
                // rendering output.
                // For example markdown serializer can render a new line in
                // between or not.
                tight: {
                    default: false,
                },
            },
            content: 'listItem+',
            group: 'block',
            parseDOM: [
                {
                    tag: 'ol',
                    getAttrs: (dom) => ({
                        order: dom.hasAttribute('start') ? +dom.getAttribute('start') : 1,
                    }),
                },
            ],
            toDOM: (node) => node.attrs['order'] === 1
                ? ['ol', 0]
                : ['ol', { start: node.attrs['order'] }, 0],
        },
        markdown: {
            toMarkdown(state, node) {
                let start = node.attrs['order'] || 1;
                let maxW = String(start + node.childCount - 1).length;
                let space = state.repeat(' ', maxW + 2);
                state.renderList(node, space, (i) => {
                    let nStr = String(start + i);
                    return state.repeat(' ', maxW - nStr.length) + nStr + '. ';
                });
            },
            parseMarkdown: {
                ordered_list: {
                    block: name$2,
                    getAttrs: (tok, tokens, i) => {
                        var _a;
                        return {
                            tight: listIsTight(tokens, i),
                            order: +((_a = tok.attrGet('start')) !== null && _a !== void 0 ? _a : 1),
                        };
                    },
                },
            },
        },
    };
}
function pluginsFactory$2({ keybindings = defaultKeys$2 } = {}) {
    return ({ schema }) => {
        const type = getNodeType(schema, name$2);
        return [
            wrappingInputRule(/^(1)[.)]\s$/, type, (match) => ({ order: +match[1] }), (match, node) => node.childCount + node.attrs['order'] === +match[1]),
            keybindings &&
                keymap(createObject([[keybindings.toggle, toggleList(type)]])),
        ];
    };
}
function toggleOrderedList() {
    return (state, dispatch, view) => {
        return toggleList(getNodeType(state, name$2), getNodeType(state, 'listItem'))(state, dispatch, view);
    };
}
function queryIsOrderedListActive() {
    return (state) => {
        return parentHasDirectParentOfType(getNodeType(state, 'listItem'), [
            getNodeType(state, name$2),
        ])(state);
    };
}

var orderedList = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$2,
    plugins: plugins$2,
    commands: commands$2,
    defaultKeys: defaultKeys$2,
    toggleOrderedList: toggleOrderedList,
    queryIsOrderedListActive: queryIsOrderedListActive
});

const spec$1 = specFactory$1;
const plugins$1 = pluginsFactory$1;
const commands$1 = {
    toggleStrike,
    queryIsStrikeActive,
};
const defaultKeys$1 = {
    toggleStrike: 'Mod-d',
};
const name$1 = 'strike';
const getTypeFromSchema$1 = (schema) => {
    const markType = schema.marks[name$1];
    assertNotUndefined(markType, `markType ${name$1} not found`);
    return markType;
};
function specFactory$1() {
    return {
        type: 'mark',
        name: name$1,
        schema: {
            parseDOM: [
                {
                    tag: 's',
                },
                {
                    tag: 'del',
                },
                {
                    tag: 'strike',
                },
                {
                    style: 'text-decoration',
                    getAttrs: (value) => value === 'line-through' && null,
                },
            ],
            toDOM: () => ['s', 0],
        },
        markdown: {
            toMarkdown: {
                open: '~~',
                close: '~~',
                mixable: true,
                expelEnclosingWhitespace: true,
            },
            parseMarkdown: {
                s: { mark: 'strike' },
            },
        },
    };
}
function pluginsFactory$1({ keybindings = defaultKeys$1 } = {}) {
    return ({ schema }) => {
        const type = getTypeFromSchema$1(schema);
        return [
            markPasteRule$1(/(?:^|\s)((?:~~)((?:[^~]+))(?:~~))/g, type),
            markInputRule(/(?:^|\s)((?:~~)((?:[^~]+))(?:~~))$/, type),
            keybindings &&
                keymap(createObject([[keybindings.toggleStrike, toggleMark(type)]])),
        ];
    };
}
function toggleStrike() {
    return (state, dispatch, _view) => {
        const markType = state.schema.marks[name$1];
        assertNotUndefined(markType, `markType ${name$1} not found`);
        return toggleMark(markType)(state, dispatch);
    };
}
function queryIsStrikeActive() {
    return (state) => {
        const markType = state.schema.marks[name$1];
        assertNotUndefined(markType, `markType ${name$1} not found`);
        return isMarkActiveInSelection(markType)(state);
    };
}

var strike = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$1,
    plugins: plugins$1,
    commands: commands$1,
    defaultKeys: defaultKeys$1,
    toggleStrike: toggleStrike,
    queryIsStrikeActive: queryIsStrikeActive
});

const spec = specFactory;
const plugins = pluginsFactory;
const commands = {
    toggleUnderline,
    queryIsUnderlineActive,
};
const defaultKeys = {
    toggleUnderline: 'Mod-u',
};
const name = 'underline';
const getTypeFromSchema = (schema) => {
    const markType = schema.marks[name];
    assertNotUndefined(markType, `markType ${name} not found`);
    return markType;
};
function specFactory() {
    return {
        type: 'mark',
        name,
        schema: {
            parseDOM: [
                {
                    tag: 'u',
                },
                {
                    style: 'text-decoration',
                    getAttrs: (value) => value === name && null,
                },
            ],
            toDOM: () => ['u', 0],
        },
        markdown: {
            // TODO underline is not a real thing in markdown, what is the best option here?
            // I know this is cheating, but underlines are confusing
            // this moves them italic
            toMarkdown: {
                open: '_',
                close: '_',
                mixable: true,
                expelEnclosingWhitespace: true,
            },
        },
    };
}
function pluginsFactory({ keybindings = defaultKeys } = {}) {
    // @ts-ignore
    return ({ schema }) => {
        const type = getTypeFromSchema(schema);
        return [
            markInputRule(/~([^~]+)~$/, type),
            markPasteRule$1(/~([^~]+)~/g, type),
            keybindings
                ? keymap(createObject([[keybindings.toggleUnderline, toggleMark(type)]]))
                : undefined,
        ];
    };
}
function toggleUnderline() {
    return (state, dispatch, _view) => {
        const markType = state.schema.marks[name];
        assertNotUndefined(markType, `markType ${name} not found`);
        return toggleMark(markType)(state, dispatch);
    };
}
function queryIsUnderlineActive() {
    return (state) => {
        const markType = state.schema.marks[name];
        assertNotUndefined(markType, `markType ${name} not found`);
        return isMarkActiveInSelection(markType)(state);
    };
}

var underline = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec,
    plugins: plugins,
    commands: commands,
    defaultKeys: defaultKeys,
    toggleUnderline: toggleUnderline,
    queryIsUnderlineActive: queryIsUnderlineActive
});

export { blockquote, bold, bulletList, code, codeBlock, hardBreak, heading, horizontalRule, image, italic, link, listItemComponent as listItem, orderedList, strike, underline };
