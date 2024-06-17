'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var prosemirrorCommands = require('prosemirror-commands');
var prosemirrorDropcursor = require('prosemirror-dropcursor');
var prosemirrorGapcursor = require('prosemirror-gapcursor');
var prosemirrorHistory = require('prosemirror-history');
var prosemirrorInputrules = require('prosemirror-inputrules');
var prosemirrorKeymap = require('prosemirror-keymap');
var prosemirrorModel = require('prosemirror-model');
var prosemirrorSchemaList = require('prosemirror-schema-list');
var prosemirrorState = require('prosemirror-state');
var prosemirrorTables = require('prosemirror-tables');
var prosemirrorTransform = require('prosemirror-transform');
var prosemirrorView = require('prosemirror-view');

function parseFromClipboard(view, text, html, plainText, $context) {
    return prosemirrorView.__parseFromClipboard(view, text, html, plainText, $context);
}
function serializeForClipboard(view, slice) {
    return prosemirrorView.__serializeForClipboard(view, slice);
}

Object.defineProperty(exports, 'autoJoin', {
    enumerable: true,
    get: function () { return prosemirrorCommands.autoJoin; }
});
Object.defineProperty(exports, 'baseKeymap', {
    enumerable: true,
    get: function () { return prosemirrorCommands.baseKeymap; }
});
Object.defineProperty(exports, 'chainCommands', {
    enumerable: true,
    get: function () { return prosemirrorCommands.chainCommands; }
});
Object.defineProperty(exports, 'createParagraphNear', {
    enumerable: true,
    get: function () { return prosemirrorCommands.createParagraphNear; }
});
Object.defineProperty(exports, 'deleteSelection', {
    enumerable: true,
    get: function () { return prosemirrorCommands.deleteSelection; }
});
Object.defineProperty(exports, 'exitCode', {
    enumerable: true,
    get: function () { return prosemirrorCommands.exitCode; }
});
Object.defineProperty(exports, 'joinBackward', {
    enumerable: true,
    get: function () { return prosemirrorCommands.joinBackward; }
});
Object.defineProperty(exports, 'joinDown', {
    enumerable: true,
    get: function () { return prosemirrorCommands.joinDown; }
});
Object.defineProperty(exports, 'joinForward', {
    enumerable: true,
    get: function () { return prosemirrorCommands.joinForward; }
});
Object.defineProperty(exports, 'joinUp', {
    enumerable: true,
    get: function () { return prosemirrorCommands.joinUp; }
});
Object.defineProperty(exports, 'lift', {
    enumerable: true,
    get: function () { return prosemirrorCommands.lift; }
});
Object.defineProperty(exports, 'liftEmptyBlock', {
    enumerable: true,
    get: function () { return prosemirrorCommands.liftEmptyBlock; }
});
Object.defineProperty(exports, 'macBaseKeymap', {
    enumerable: true,
    get: function () { return prosemirrorCommands.macBaseKeymap; }
});
Object.defineProperty(exports, 'newlineInCode', {
    enumerable: true,
    get: function () { return prosemirrorCommands.newlineInCode; }
});
Object.defineProperty(exports, 'pcBaseKeymap', {
    enumerable: true,
    get: function () { return prosemirrorCommands.pcBaseKeymap; }
});
Object.defineProperty(exports, 'selectAll', {
    enumerable: true,
    get: function () { return prosemirrorCommands.selectAll; }
});
Object.defineProperty(exports, 'selectNodeBackward', {
    enumerable: true,
    get: function () { return prosemirrorCommands.selectNodeBackward; }
});
Object.defineProperty(exports, 'selectNodeForward', {
    enumerable: true,
    get: function () { return prosemirrorCommands.selectNodeForward; }
});
Object.defineProperty(exports, 'selectParentNode', {
    enumerable: true,
    get: function () { return prosemirrorCommands.selectParentNode; }
});
Object.defineProperty(exports, 'setBlockType', {
    enumerable: true,
    get: function () { return prosemirrorCommands.setBlockType; }
});
Object.defineProperty(exports, 'splitBlock', {
    enumerable: true,
    get: function () { return prosemirrorCommands.splitBlock; }
});
Object.defineProperty(exports, 'splitBlockKeepMarks', {
    enumerable: true,
    get: function () { return prosemirrorCommands.splitBlockKeepMarks; }
});
Object.defineProperty(exports, 'toggleMark', {
    enumerable: true,
    get: function () { return prosemirrorCommands.toggleMark; }
});
Object.defineProperty(exports, 'wrapIn', {
    enumerable: true,
    get: function () { return prosemirrorCommands.wrapIn; }
});
Object.defineProperty(exports, 'dropCursor', {
    enumerable: true,
    get: function () { return prosemirrorDropcursor.dropCursor; }
});
Object.defineProperty(exports, 'gapCursor', {
    enumerable: true,
    get: function () { return prosemirrorGapcursor.gapCursor; }
});
Object.defineProperty(exports, 'closeHistory', {
    enumerable: true,
    get: function () { return prosemirrorHistory.closeHistory; }
});
Object.defineProperty(exports, 'history', {
    enumerable: true,
    get: function () { return prosemirrorHistory.history; }
});
Object.defineProperty(exports, 'redo', {
    enumerable: true,
    get: function () { return prosemirrorHistory.redo; }
});
Object.defineProperty(exports, 'redoDepth', {
    enumerable: true,
    get: function () { return prosemirrorHistory.redoDepth; }
});
Object.defineProperty(exports, 'undo', {
    enumerable: true,
    get: function () { return prosemirrorHistory.undo; }
});
Object.defineProperty(exports, 'undoDepth', {
    enumerable: true,
    get: function () { return prosemirrorHistory.undoDepth; }
});
Object.defineProperty(exports, 'InputRule', {
    enumerable: true,
    get: function () { return prosemirrorInputrules.InputRule; }
});
Object.defineProperty(exports, 'closeDoubleQuote', {
    enumerable: true,
    get: function () { return prosemirrorInputrules.closeDoubleQuote; }
});
Object.defineProperty(exports, 'closeSingleQuote', {
    enumerable: true,
    get: function () { return prosemirrorInputrules.closeSingleQuote; }
});
Object.defineProperty(exports, 'ellipsis', {
    enumerable: true,
    get: function () { return prosemirrorInputrules.ellipsis; }
});
Object.defineProperty(exports, 'emDash', {
    enumerable: true,
    get: function () { return prosemirrorInputrules.emDash; }
});
Object.defineProperty(exports, 'inputRules', {
    enumerable: true,
    get: function () { return prosemirrorInputrules.inputRules; }
});
Object.defineProperty(exports, 'openDoubleQuote', {
    enumerable: true,
    get: function () { return prosemirrorInputrules.openDoubleQuote; }
});
Object.defineProperty(exports, 'openSingleQuote', {
    enumerable: true,
    get: function () { return prosemirrorInputrules.openSingleQuote; }
});
Object.defineProperty(exports, 'smartQuotes', {
    enumerable: true,
    get: function () { return prosemirrorInputrules.smartQuotes; }
});
Object.defineProperty(exports, 'textblockTypeInputRule', {
    enumerable: true,
    get: function () { return prosemirrorInputrules.textblockTypeInputRule; }
});
Object.defineProperty(exports, 'undoInputRule', {
    enumerable: true,
    get: function () { return prosemirrorInputrules.undoInputRule; }
});
Object.defineProperty(exports, 'wrappingInputRule', {
    enumerable: true,
    get: function () { return prosemirrorInputrules.wrappingInputRule; }
});
Object.defineProperty(exports, 'keydownHandler', {
    enumerable: true,
    get: function () { return prosemirrorKeymap.keydownHandler; }
});
Object.defineProperty(exports, 'keymap', {
    enumerable: true,
    get: function () { return prosemirrorKeymap.keymap; }
});
Object.defineProperty(exports, 'ContentMatch', {
    enumerable: true,
    get: function () { return prosemirrorModel.ContentMatch; }
});
Object.defineProperty(exports, 'DOMParser', {
    enumerable: true,
    get: function () { return prosemirrorModel.DOMParser; }
});
Object.defineProperty(exports, 'DOMSerializer', {
    enumerable: true,
    get: function () { return prosemirrorModel.DOMSerializer; }
});
Object.defineProperty(exports, 'Fragment', {
    enumerable: true,
    get: function () { return prosemirrorModel.Fragment; }
});
Object.defineProperty(exports, 'Mark', {
    enumerable: true,
    get: function () { return prosemirrorModel.Mark; }
});
Object.defineProperty(exports, 'MarkType', {
    enumerable: true,
    get: function () { return prosemirrorModel.MarkType; }
});
Object.defineProperty(exports, 'Node', {
    enumerable: true,
    get: function () { return prosemirrorModel.Node; }
});
Object.defineProperty(exports, 'NodeRange', {
    enumerable: true,
    get: function () { return prosemirrorModel.NodeRange; }
});
Object.defineProperty(exports, 'NodeType', {
    enumerable: true,
    get: function () { return prosemirrorModel.NodeType; }
});
Object.defineProperty(exports, 'ReplaceError', {
    enumerable: true,
    get: function () { return prosemirrorModel.ReplaceError; }
});
Object.defineProperty(exports, 'ResolvedPos', {
    enumerable: true,
    get: function () { return prosemirrorModel.ResolvedPos; }
});
Object.defineProperty(exports, 'Schema', {
    enumerable: true,
    get: function () { return prosemirrorModel.Schema; }
});
Object.defineProperty(exports, 'Slice', {
    enumerable: true,
    get: function () { return prosemirrorModel.Slice; }
});
Object.defineProperty(exports, 'addListNodes', {
    enumerable: true,
    get: function () { return prosemirrorSchemaList.addListNodes; }
});
Object.defineProperty(exports, 'bulletList', {
    enumerable: true,
    get: function () { return prosemirrorSchemaList.bulletList; }
});
Object.defineProperty(exports, 'liftListItem', {
    enumerable: true,
    get: function () { return prosemirrorSchemaList.liftListItem; }
});
Object.defineProperty(exports, 'listItem', {
    enumerable: true,
    get: function () { return prosemirrorSchemaList.listItem; }
});
Object.defineProperty(exports, 'orderedList', {
    enumerable: true,
    get: function () { return prosemirrorSchemaList.orderedList; }
});
Object.defineProperty(exports, 'sinkListItem', {
    enumerable: true,
    get: function () { return prosemirrorSchemaList.sinkListItem; }
});
Object.defineProperty(exports, 'splitListItem', {
    enumerable: true,
    get: function () { return prosemirrorSchemaList.splitListItem; }
});
Object.defineProperty(exports, 'wrapInList', {
    enumerable: true,
    get: function () { return prosemirrorSchemaList.wrapInList; }
});
Object.defineProperty(exports, 'AllSelection', {
    enumerable: true,
    get: function () { return prosemirrorState.AllSelection; }
});
Object.defineProperty(exports, 'EditorState', {
    enumerable: true,
    get: function () { return prosemirrorState.EditorState; }
});
Object.defineProperty(exports, 'NodeSelection', {
    enumerable: true,
    get: function () { return prosemirrorState.NodeSelection; }
});
Object.defineProperty(exports, 'Plugin', {
    enumerable: true,
    get: function () { return prosemirrorState.Plugin; }
});
Object.defineProperty(exports, 'PluginKey', {
    enumerable: true,
    get: function () { return prosemirrorState.PluginKey; }
});
Object.defineProperty(exports, 'Selection', {
    enumerable: true,
    get: function () { return prosemirrorState.Selection; }
});
Object.defineProperty(exports, 'SelectionRange', {
    enumerable: true,
    get: function () { return prosemirrorState.SelectionRange; }
});
Object.defineProperty(exports, 'TextSelection', {
    enumerable: true,
    get: function () { return prosemirrorState.TextSelection; }
});
Object.defineProperty(exports, 'Transaction', {
    enumerable: true,
    get: function () { return prosemirrorState.Transaction; }
});
Object.defineProperty(exports, 'CellSelection', {
    enumerable: true,
    get: function () { return prosemirrorTables.CellSelection; }
});
Object.defineProperty(exports, 'TableMap', {
    enumerable: true,
    get: function () { return prosemirrorTables.TableMap; }
});
Object.defineProperty(exports, 'addColSpan', {
    enumerable: true,
    get: function () { return prosemirrorTables.addColSpan; }
});
Object.defineProperty(exports, 'addColumn', {
    enumerable: true,
    get: function () { return prosemirrorTables.addColumn; }
});
Object.defineProperty(exports, 'addColumnAfter', {
    enumerable: true,
    get: function () { return prosemirrorTables.addColumnAfter; }
});
Object.defineProperty(exports, 'addColumnBefore', {
    enumerable: true,
    get: function () { return prosemirrorTables.addColumnBefore; }
});
Object.defineProperty(exports, 'addRow', {
    enumerable: true,
    get: function () { return prosemirrorTables.addRow; }
});
Object.defineProperty(exports, 'addRowAfter', {
    enumerable: true,
    get: function () { return prosemirrorTables.addRowAfter; }
});
Object.defineProperty(exports, 'addRowBefore', {
    enumerable: true,
    get: function () { return prosemirrorTables.addRowBefore; }
});
Object.defineProperty(exports, 'cellAround', {
    enumerable: true,
    get: function () { return prosemirrorTables.cellAround; }
});
Object.defineProperty(exports, 'colCount', {
    enumerable: true,
    get: function () { return prosemirrorTables.colCount; }
});
Object.defineProperty(exports, 'columnIsHeader', {
    enumerable: true,
    get: function () { return prosemirrorTables.columnIsHeader; }
});
Object.defineProperty(exports, 'columnResizing', {
    enumerable: true,
    get: function () { return prosemirrorTables.columnResizing; }
});
Object.defineProperty(exports, 'deleteColumn', {
    enumerable: true,
    get: function () { return prosemirrorTables.deleteColumn; }
});
Object.defineProperty(exports, 'deleteRow', {
    enumerable: true,
    get: function () { return prosemirrorTables.deleteRow; }
});
Object.defineProperty(exports, 'deleteTable', {
    enumerable: true,
    get: function () { return prosemirrorTables.deleteTable; }
});
Object.defineProperty(exports, 'findCell', {
    enumerable: true,
    get: function () { return prosemirrorTables.findCell; }
});
Object.defineProperty(exports, 'fixTables', {
    enumerable: true,
    get: function () { return prosemirrorTables.fixTables; }
});
Object.defineProperty(exports, 'fixTablesKey', {
    enumerable: true,
    get: function () { return prosemirrorTables.fixTablesKey; }
});
Object.defineProperty(exports, 'goToNextCell', {
    enumerable: true,
    get: function () { return prosemirrorTables.goToNextCell; }
});
Object.defineProperty(exports, 'inSameTable', {
    enumerable: true,
    get: function () { return prosemirrorTables.inSameTable; }
});
Object.defineProperty(exports, 'isInTable', {
    enumerable: true,
    get: function () { return prosemirrorTables.isInTable; }
});
Object.defineProperty(exports, 'mergeCells', {
    enumerable: true,
    get: function () { return prosemirrorTables.mergeCells; }
});
Object.defineProperty(exports, 'moveCellForward', {
    enumerable: true,
    get: function () { return prosemirrorTables.moveCellForward; }
});
Object.defineProperty(exports, 'nextCell', {
    enumerable: true,
    get: function () { return prosemirrorTables.nextCell; }
});
Object.defineProperty(exports, 'removeColSpan', {
    enumerable: true,
    get: function () { return prosemirrorTables.removeColSpan; }
});
Object.defineProperty(exports, 'rowIsHeader', {
    enumerable: true,
    get: function () { return prosemirrorTables.rowIsHeader; }
});
Object.defineProperty(exports, 'selectedRect', {
    enumerable: true,
    get: function () { return prosemirrorTables.selectedRect; }
});
Object.defineProperty(exports, 'selectionCell', {
    enumerable: true,
    get: function () { return prosemirrorTables.selectionCell; }
});
Object.defineProperty(exports, 'setCellAttr', {
    enumerable: true,
    get: function () { return prosemirrorTables.setCellAttr; }
});
Object.defineProperty(exports, 'splitCell', {
    enumerable: true,
    get: function () { return prosemirrorTables.splitCell; }
});
Object.defineProperty(exports, 'splitCellWithType', {
    enumerable: true,
    get: function () { return prosemirrorTables.splitCellWithType; }
});
Object.defineProperty(exports, 'tableEditing', {
    enumerable: true,
    get: function () { return prosemirrorTables.tableEditing; }
});
Object.defineProperty(exports, 'tableEditingKey', {
    enumerable: true,
    get: function () { return prosemirrorTables.tableEditingKey; }
});
Object.defineProperty(exports, 'tableNodeTypes', {
    enumerable: true,
    get: function () { return prosemirrorTables.tableNodeTypes; }
});
Object.defineProperty(exports, 'tableNodes', {
    enumerable: true,
    get: function () { return prosemirrorTables.tableNodes; }
});
Object.defineProperty(exports, 'toggleHeader', {
    enumerable: true,
    get: function () { return prosemirrorTables.toggleHeader; }
});
Object.defineProperty(exports, 'toggleHeaderCell', {
    enumerable: true,
    get: function () { return prosemirrorTables.toggleHeaderCell; }
});
Object.defineProperty(exports, 'toggleHeaderColumn', {
    enumerable: true,
    get: function () { return prosemirrorTables.toggleHeaderColumn; }
});
Object.defineProperty(exports, 'toggleHeaderRow', {
    enumerable: true,
    get: function () { return prosemirrorTables.toggleHeaderRow; }
});
Object.defineProperty(exports, 'updateColumnsOnResize', {
    enumerable: true,
    get: function () { return prosemirrorTables.updateColumnsOnResize; }
});
Object.defineProperty(exports, 'AddMarkStep', {
    enumerable: true,
    get: function () { return prosemirrorTransform.AddMarkStep; }
});
Object.defineProperty(exports, 'MapResult', {
    enumerable: true,
    get: function () { return prosemirrorTransform.MapResult; }
});
Object.defineProperty(exports, 'Mapping', {
    enumerable: true,
    get: function () { return prosemirrorTransform.Mapping; }
});
Object.defineProperty(exports, 'RemoveMarkStep', {
    enumerable: true,
    get: function () { return prosemirrorTransform.RemoveMarkStep; }
});
Object.defineProperty(exports, 'ReplaceAroundStep', {
    enumerable: true,
    get: function () { return prosemirrorTransform.ReplaceAroundStep; }
});
Object.defineProperty(exports, 'ReplaceStep', {
    enumerable: true,
    get: function () { return prosemirrorTransform.ReplaceStep; }
});
Object.defineProperty(exports, 'Step', {
    enumerable: true,
    get: function () { return prosemirrorTransform.Step; }
});
Object.defineProperty(exports, 'StepMap', {
    enumerable: true,
    get: function () { return prosemirrorTransform.StepMap; }
});
Object.defineProperty(exports, 'StepResult', {
    enumerable: true,
    get: function () { return prosemirrorTransform.StepResult; }
});
Object.defineProperty(exports, 'Transform', {
    enumerable: true,
    get: function () { return prosemirrorTransform.Transform; }
});
Object.defineProperty(exports, 'canJoin', {
    enumerable: true,
    get: function () { return prosemirrorTransform.canJoin; }
});
Object.defineProperty(exports, 'canSplit', {
    enumerable: true,
    get: function () { return prosemirrorTransform.canSplit; }
});
Object.defineProperty(exports, 'dropPoint', {
    enumerable: true,
    get: function () { return prosemirrorTransform.dropPoint; }
});
Object.defineProperty(exports, 'findWrapping', {
    enumerable: true,
    get: function () { return prosemirrorTransform.findWrapping; }
});
Object.defineProperty(exports, 'insertPoint', {
    enumerable: true,
    get: function () { return prosemirrorTransform.insertPoint; }
});
Object.defineProperty(exports, 'joinPoint', {
    enumerable: true,
    get: function () { return prosemirrorTransform.joinPoint; }
});
Object.defineProperty(exports, 'liftTarget', {
    enumerable: true,
    get: function () { return prosemirrorTransform.liftTarget; }
});
Object.defineProperty(exports, 'replaceStep', {
    enumerable: true,
    get: function () { return prosemirrorTransform.replaceStep; }
});
Object.defineProperty(exports, 'Decoration', {
    enumerable: true,
    get: function () { return prosemirrorView.Decoration; }
});
Object.defineProperty(exports, 'DecorationSet', {
    enumerable: true,
    get: function () { return prosemirrorView.DecorationSet; }
});
Object.defineProperty(exports, 'EditorView', {
    enumerable: true,
    get: function () { return prosemirrorView.EditorView; }
});
exports.parseFromClipboard = parseFromClipboard;
exports.serializeForClipboard = serializeForClipboard;
