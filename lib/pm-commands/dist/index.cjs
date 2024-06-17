'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pm = require('@bangle.dev/pm');
var utils = require('@bangle.dev/utils');

function getParentTextSelection(state, currentDepth) {
    const { $from } = state.selection;
    const parentPos = $from.start(currentDepth);
    let replaceStart = parentPos;
    let replaceEnd = $from.end(currentDepth);
    return pm.TextSelection.create(state.doc, replaceStart, replaceEnd);
}
function copyEmptyCommand(type) {
    return (state, dispatch, view) => {
        if (!state.selection.empty) {
            return false;
        }
        const current = utils.findParentNodeOfType(type)(state.selection);
        if (!current) {
            return false;
        }
        const selection = state.selection;
        let tr = state.tr;
        tr = tr.setSelection(getParentTextSelection(state, current.depth));
        if (dispatch) {
            dispatch(tr);
        }
        document.execCommand('copy');
        // restore the selection
        const tr2 = view.state.tr;
        if (dispatch) {
            dispatch(tr2.setSelection(pm.Selection.near(tr2.doc.resolve(selection.$from.pos))));
        }
        return true;
    };
}
function cutEmptyCommand(type) {
    return (state, dispatch) => {
        if (!state.selection.empty) {
            return false;
        }
        const parent = utils.findParentNodeOfType(type)(state.selection);
        if (!parent || !parent.node) {
            return false;
        }
        let tr = state.tr;
        tr = tr.setSelection(pm.NodeSelection.create(tr.doc, parent.pos));
        if (dispatch) {
            dispatch(tr);
        }
        document.execCommand('cut');
        return true;
    };
}
// Finds a parent node in the ancestors and check if that node has a direct parent of type `parentsParentType`
function parentHasDirectParentOfType(parentType, parentsParentType) {
    parentsParentType = Array.isArray(parentsParentType)
        ? parentsParentType
        : [parentsParentType];
    return (state) => {
        const currentResolved = utils.findParentNodeOfType(parentType)(state.selection);
        if (!currentResolved) {
            return false;
        }
        const depth = currentResolved.depth - 1;
        if (depth < 0) {
            return false;
        }
        const parentsParent = state.selection.$from.node(depth);
        return parentsParentType.includes(parentsParent.type);
    };
}
/**
 * Moves a node up and down. Please do a sanity check if the node is allowed to move or not
 * before calling this command.
 *
 * @param {PMNodeType} type The items type
 * @param {['UP', 'DOWN']} dir
 */
function moveNode(type, dir = 'UP') {
    const isDown = dir === 'DOWN';
    return (state, dispatch) => {
        if (!state.selection.empty) {
            return false;
        }
        const { $from } = state.selection;
        const currentResolved = utils.findParentNodeOfType(type)(state.selection);
        if (!currentResolved) {
            return false;
        }
        const { node: currentNode } = currentResolved;
        const parentDepth = currentResolved.depth - 1;
        const parent = $from.node(parentDepth);
        const parentPos = $from.start(parentDepth);
        if (currentNode.type !== type) {
            return false;
        }
        const arr = utils.mapChildren(parent, (node) => node);
        let index = arr.indexOf(currentNode);
        let swapWith = isDown ? index + 1 : index - 1;
        // If swap is out of bound
        if (swapWith >= arr.length || swapWith < 0) {
            return false;
        }
        const swapWithNodeSize = arr[swapWith].nodeSize;
        [arr[index], arr[swapWith]] = [arr[swapWith], arr[index]];
        let tr = state.tr;
        let replaceStart = parentPos;
        let replaceEnd = $from.end(parentDepth);
        const slice = new pm.Slice(pm.Fragment.fromArray(arr), 0, 0); // the zeros  lol -- are not depth they are something that represents the opening closing
        // .toString on slice gives you an idea. for this case we want them balanced
        tr = tr.step(new pm.ReplaceStep(replaceStart, replaceEnd, slice, false));
        tr = tr.setSelection(pm.Selection.near(tr.doc.resolve(isDown ? $from.pos + swapWithNodeSize : $from.pos - swapWithNodeSize)));
        if (dispatch) {
            dispatch(tr.scrollIntoView());
        }
        return true;
    };
}
const setSelectionAtEnd = (node) => {
    return (state, dispatch, _view) => {
        let pos = node.nodeSize - 1;
        if (node.type.name === 'doc') {
            pos = node.content.size - 1;
        }
        const tr = state.tr.setSelection(pm.TextSelection.create(state.doc, pos));
        if (dispatch) {
            dispatch(tr);
        }
        return true;
    };
};
function jumpToStartOfNode(type) {
    return (state, dispatch) => {
        const current = utils.findParentNodeOfType(type)(state.selection);
        if (!current) {
            return false;
        }
        if (dispatch) {
            const { start } = current;
            dispatch(state.tr.setSelection(pm.TextSelection.create(state.doc, start)));
        }
        return true;
    };
}
function jumpToEndOfNode(type) {
    return (state, dispatch) => {
        const current = utils.findParentNodeOfType(type)(state.selection);
        if (!current) {
            return false;
        }
        if (dispatch) {
            const { node, start } = current;
            dispatch(state.tr.setSelection(pm.TextSelection.create(state.doc, start + node.content.size)));
        }
        return true;
    };
}

exports.copyEmptyCommand = copyEmptyCommand;
exports.cutEmptyCommand = cutEmptyCommand;
exports.jumpToEndOfNode = jumpToEndOfNode;
exports.jumpToStartOfNode = jumpToStartOfNode;
exports.moveNode = moveNode;
exports.parentHasDirectParentOfType = parentHasDirectParentOfType;
exports.setSelectionAtEnd = setSelectionAtEnd;
