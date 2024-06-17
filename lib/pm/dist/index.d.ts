export { autoJoin, baseKeymap, chainCommands, createParagraphNear, deleteSelection, exitCode, joinBackward, joinDown, joinForward, joinUp, lift, liftEmptyBlock, macBaseKeymap, newlineInCode, pcBaseKeymap, selectAll, selectNodeBackward, selectNodeForward, selectParentNode, setBlockType, splitBlock, splitBlockKeepMarks, toggleMark, wrapIn } from 'prosemirror-commands';
export { AllSelection, Command, EditorState, NodeSelection, Plugin, PluginKey, PluginSpec, Selection, SelectionBookmark, SelectionRange, StateField, TextSelection, Transaction } from 'prosemirror-state';
export { dropCursor } from 'prosemirror-dropcursor';
export { GapCursor, gapCursor } from 'prosemirror-gapcursor';
export { closeHistory, history, redo, redoDepth, undo, undoDepth } from 'prosemirror-history';
export { InputRule, closeDoubleQuote, closeSingleQuote, ellipsis, emDash, inputRules, openDoubleQuote, openSingleQuote, smartQuotes, textblockTypeInputRule, undoInputRule, wrappingInputRule } from 'prosemirror-inputrules';
export { keydownHandler, keymap } from 'prosemirror-keymap';
import { ResolvedPos, Slice } from 'prosemirror-model';
export { AttributeSpec, ContentMatch, DOMOutputSpec, DOMParser, DOMSerializer, Fragment, Mark, MarkSpec, MarkType, Node, NodeRange, NodeSpec, NodeType, ParseOptions, ParseRule, ReplaceError, ResolvedPos, Schema, SchemaSpec, Slice } from 'prosemirror-model';
export { addListNodes, bulletList, liftListItem, listItem, orderedList, sinkListItem, splitListItem, wrapInList } from 'prosemirror-schema-list';
export { CellSelection, TableMap, addColSpan, addColumn, addColumnAfter, addColumnBefore, addRow, addRowAfter, addRowBefore, cellAround, colCount, columnIsHeader, columnResizing, deleteColumn, deleteRow, deleteTable, findCell, fixTables, fixTablesKey, goToNextCell, inSameTable, isInTable, mergeCells, moveCellForward, nextCell, removeColSpan, rowIsHeader, selectedRect, selectionCell, setCellAttr, splitCell, splitCellWithType, tableEditing, tableEditingKey, tableNodeTypes, tableNodes, toggleHeader, toggleHeaderCell, toggleHeaderColumn, toggleHeaderRow, updateColumnsOnResize } from 'prosemirror-tables';
export { AddMarkStep, MapResult, Mappable, Mapping, RemoveMarkStep, ReplaceAroundStep, ReplaceStep, Step, StepMap, StepResult, Transform, canJoin, canSplit, dropPoint, findWrapping, insertPoint, joinPoint, liftTarget, replaceStep } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
export { Decoration, DecorationAttrs, DecorationSet, DirectEditorProps, EditorProps, EditorView, NodeView } from 'prosemirror-view';

declare function parseFromClipboard(view: EditorView, text: string, html: string | null, plainText: boolean, $context: ResolvedPos): Slice;
declare function serializeForClipboard(view: EditorView, slice: Slice): {
    dom: HTMLDivElement;
    text: string;
};

export { parseFromClipboard, serializeForClipboard };
