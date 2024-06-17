import { RawSpecs, RawPlugins } from '@bangle.dev/core';
export { doc, editorStateCounter, history, paragraph, text } from '@bangle.dev/core';
import { EditorState, Command, NodeType, EditorView, Node, InputRule, Plugin } from '@bangle.dev/pm';
import { NodeWithPos } from '@bangle.dev/utils';

declare const spec$e: typeof specFactory$e;
declare const plugins$e: typeof pluginsFactory$e;
declare const commands$c: {
    queryIsBlockquoteActive: typeof queryIsBlockquoteActive;
    wrapInBlockquote: typeof wrapInBlockquote;
};
declare const defaultKeys$b: {
    wrapIn: string;
    moveDown: string;
    moveUp: string;
    emptyCopy: string;
    emptyCut: string;
    insertEmptyParaAbove: string;
    insertEmptyParaBelow: string;
};
declare function specFactory$e(): RawSpecs;
declare function pluginsFactory$e({ markdownShortcut, keybindings, }?: {
    markdownShortcut?: boolean | undefined;
    keybindings?: {
        wrapIn: string;
        moveDown: string;
        moveUp: string;
        emptyCopy: string;
        emptyCut: string;
        insertEmptyParaAbove: string;
        insertEmptyParaBelow: string;
    } | undefined;
}): RawPlugins;
declare function queryIsBlockquoteActive(): (state: EditorState) => boolean;
declare function wrapInBlockquote(): Command;
declare function insertEmptyParaAbove$1(): Command;
declare function insertEmptyParaBelow$1(): Command;

declare const blockquote_d_queryIsBlockquoteActive: typeof queryIsBlockquoteActive;
declare const blockquote_d_wrapInBlockquote: typeof wrapInBlockquote;
declare namespace blockquote_d {
  export {
    spec$e as spec,
    plugins$e as plugins,
    commands$c as commands,
    defaultKeys$b as defaultKeys,
    blockquote_d_queryIsBlockquoteActive as queryIsBlockquoteActive,
    blockquote_d_wrapInBlockquote as wrapInBlockquote,
    insertEmptyParaAbove$1 as insertEmptyParaAbove,
    insertEmptyParaBelow$1 as insertEmptyParaBelow,
  };
}

declare const spec$d: typeof specFactory$d;
declare const plugins$d: typeof pluginsFactory$d;
declare const commands$b: {
    toggleBold: typeof toggleBold;
    queryIsBoldActive: typeof queryIsBoldActive;
};
declare const defaultKeys$a: {
    toggleBold: string;
};
declare function specFactory$d(): RawSpecs;
declare function pluginsFactory$d({ markdownShortcut, keybindings, }?: {
    markdownShortcut?: boolean | undefined;
    keybindings?: {
        toggleBold: string;
    } | undefined;
}): RawPlugins;
declare function toggleBold(): Command;
declare function queryIsBoldActive(): (state: EditorState) => boolean;

declare const bold_d_toggleBold: typeof toggleBold;
declare const bold_d_queryIsBoldActive: typeof queryIsBoldActive;
declare namespace bold_d {
  export {
    spec$d as spec,
    plugins$d as plugins,
    commands$b as commands,
    defaultKeys$a as defaultKeys,
    bold_d_toggleBold as toggleBold,
    bold_d_queryIsBoldActive as queryIsBoldActive,
  };
}

declare const spec$c: typeof specFactory$c;
declare const plugins$c: typeof pluginsFactory$c;
declare const commands$a: {
    toggleBulletList: typeof toggleBulletList;
    queryIsBulletListActive: typeof queryIsBulletListActive;
};
declare const defaultKeys$9: {
    toggle: string;
    toggleTodo: string;
};
declare function specFactory$c(): RawSpecs;
declare function pluginsFactory$c({ markdownShortcut, todoMarkdownShortcut, keybindings, }?: {
    markdownShortcut?: boolean | undefined;
    todoMarkdownShortcut?: boolean | undefined;
    keybindings?: {
        toggle: string;
        toggleTodo: string;
    } | undefined;
}): RawPlugins;
declare function toggleBulletList(): Command;
declare function toggleTodoList(): Command;
declare function queryIsBulletListActive(): (state: EditorState) => boolean;
declare function queryIsTodoListActive(): (state: EditorState) => boolean;

declare const bulletList_d_toggleBulletList: typeof toggleBulletList;
declare const bulletList_d_toggleTodoList: typeof toggleTodoList;
declare const bulletList_d_queryIsBulletListActive: typeof queryIsBulletListActive;
declare const bulletList_d_queryIsTodoListActive: typeof queryIsTodoListActive;
declare namespace bulletList_d {
  export {
    spec$c as spec,
    plugins$c as plugins,
    commands$a as commands,
    defaultKeys$9 as defaultKeys,
    bulletList_d_toggleBulletList as toggleBulletList,
    bulletList_d_toggleTodoList as toggleTodoList,
    bulletList_d_queryIsBulletListActive as queryIsBulletListActive,
    bulletList_d_queryIsTodoListActive as queryIsTodoListActive,
  };
}

declare const spec$b: typeof specFactory$b;
declare const plugins$b: typeof pluginsFactory$b;
declare const commands$9: {
    toggleCode: typeof toggleCode;
    queryIsCodeActive: typeof queryIsCodeActive;
};
declare const defaultKeys$8: {
    toggleCode: string;
};
declare function specFactory$b(): RawSpecs;
declare function pluginsFactory$b({ markdownShortcut, escapeAtEdge, keybindings, }?: {
    markdownShortcut?: boolean | undefined;
    escapeAtEdge?: boolean | undefined;
    keybindings?: {
        toggleCode: string;
    } | undefined;
}): RawPlugins;
declare function toggleCode(): Command;
declare function queryIsCodeActive(): (state: EditorState) => boolean;

declare const code_d_toggleCode: typeof toggleCode;
declare const code_d_queryIsCodeActive: typeof queryIsCodeActive;
declare namespace code_d {
  export {
    spec$b as spec,
    plugins$b as plugins,
    commands$9 as commands,
    defaultKeys$8 as defaultKeys,
    code_d_toggleCode as toggleCode,
    code_d_queryIsCodeActive as queryIsCodeActive,
  };
}

declare const spec$a: typeof specFactory$a;
declare const plugins$a: typeof pluginsFactory$a;
declare const commands$8: {
    queryIsCodeActiveBlock: typeof queryIsCodeActiveBlock;
};
declare const defaultKeys$7: {
    toCodeBlock: string;
    moveDown: string;
    moveUp: string;
    insertEmptyParaAbove: string;
    insertEmptyParaBelow: string;
};
declare function specFactory$a(): RawSpecs;
declare function pluginsFactory$a({ markdownShortcut, keybindings, }?: {
    markdownShortcut?: boolean | undefined;
    keybindings?: {
        toCodeBlock: string;
        moveDown: string;
        moveUp: string;
        insertEmptyParaAbove: string;
        insertEmptyParaBelow: string;
    } | undefined;
}): RawPlugins;
declare function queryIsCodeActiveBlock(): (state: EditorState) => boolean;

declare const codeBlock_d_queryIsCodeActiveBlock: typeof queryIsCodeActiveBlock;
declare namespace codeBlock_d {
  export {
    spec$a as spec,
    plugins$a as plugins,
    commands$8 as commands,
    defaultKeys$7 as defaultKeys,
    codeBlock_d_queryIsCodeActiveBlock as queryIsCodeActiveBlock,
  };
}

declare const spec$9: typeof specFactory$9;
declare const plugins$9: typeof pluginsFactory$9;
declare const defaultKeys$6: {
    insert: string;
};
declare function specFactory$9(): RawSpecs;
declare function pluginsFactory$9({ keybindings }?: {
    keybindings?: {
        insert: string;
    } | undefined;
}): RawPlugins;

declare namespace hardBreak_d {
  export {
    spec$9 as spec,
    plugins$9 as plugins,
    defaultKeys$6 as defaultKeys,
  };
}

declare const spec$8: typeof specFactory$8;
declare const plugins$8: typeof pluginsFactory$8;
declare const commands$7: {
    toggleHeading: typeof toggleHeading;
    queryIsHeadingActive: typeof queryIsHeadingActive;
};
declare const defaultKeys$5: {
    [index: string]: string | undefined;
};
declare function specFactory$8({ levels }?: {
    levels?: number[] | undefined;
}): RawSpecs;
declare function pluginsFactory$8({ markdownShortcut, keybindings, }?: {
    markdownShortcut?: boolean;
    keybindings?: {
        [index: string]: string | undefined;
    };
}): RawPlugins;
declare function toggleHeading(level?: number): Command;
declare function queryIsHeadingActive(level: number): (state: EditorState) => boolean;
declare function queryIsCollapseActive(): (state: EditorState) => boolean;
declare function collapseHeading(): Command;
declare function uncollapseHeading(): Command;
declare function insertEmptyParaAbove(): Command;
declare function insertEmptyParaBelow(): Command;
declare function toggleHeadingCollapse(): Command;
declare function uncollapseAllHeadings(): Command;
declare function listCollapsedHeading(state: EditorState): NodeWithPos[];
declare function listCollapsibleHeading(state: EditorState): NodeWithPos[];
interface JSONObject {
    [key: string]: any;
}
declare const flattenFragmentJSON: (fragJSON: JSONObject[]) => JSONObject[];

declare const heading_d_toggleHeading: typeof toggleHeading;
declare const heading_d_queryIsHeadingActive: typeof queryIsHeadingActive;
declare const heading_d_queryIsCollapseActive: typeof queryIsCollapseActive;
declare const heading_d_collapseHeading: typeof collapseHeading;
declare const heading_d_uncollapseHeading: typeof uncollapseHeading;
declare const heading_d_insertEmptyParaAbove: typeof insertEmptyParaAbove;
declare const heading_d_insertEmptyParaBelow: typeof insertEmptyParaBelow;
declare const heading_d_toggleHeadingCollapse: typeof toggleHeadingCollapse;
declare const heading_d_uncollapseAllHeadings: typeof uncollapseAllHeadings;
declare const heading_d_listCollapsedHeading: typeof listCollapsedHeading;
declare const heading_d_listCollapsibleHeading: typeof listCollapsibleHeading;
declare const heading_d_flattenFragmentJSON: typeof flattenFragmentJSON;
declare namespace heading_d {
  export {
    spec$8 as spec,
    plugins$8 as plugins,
    commands$7 as commands,
    defaultKeys$5 as defaultKeys,
    heading_d_toggleHeading as toggleHeading,
    heading_d_queryIsHeadingActive as queryIsHeadingActive,
    heading_d_queryIsCollapseActive as queryIsCollapseActive,
    heading_d_collapseHeading as collapseHeading,
    heading_d_uncollapseHeading as uncollapseHeading,
    heading_d_insertEmptyParaAbove as insertEmptyParaAbove,
    heading_d_insertEmptyParaBelow as insertEmptyParaBelow,
    heading_d_toggleHeadingCollapse as toggleHeadingCollapse,
    heading_d_uncollapseAllHeadings as uncollapseAllHeadings,
    heading_d_listCollapsedHeading as listCollapsedHeading,
    heading_d_listCollapsibleHeading as listCollapsibleHeading,
    heading_d_flattenFragmentJSON as flattenFragmentJSON,
  };
}

declare const spec$7: typeof specFactory$7;
declare const plugins$7: typeof pluginsFactory$7;
declare function specFactory$7(): RawSpecs;
declare function pluginsFactory$7({ markdownShortcut }?: {
    markdownShortcut?: boolean | undefined;
}): RawPlugins;

declare namespace horizontalRule_d {
  export {
    spec$7 as spec,
    plugins$7 as plugins,
  };
}

declare const spec$6: typeof specFactory$6;
declare const plugins$6: typeof pluginsFactory$6;
declare const commands$6: {};
declare function specFactory$6(): RawSpecs;
declare function pluginsFactory$6({ handleDragAndDrop, acceptFileType, createImageNodes, }?: {
    handleDragAndDrop?: boolean;
    acceptFileType?: string;
    createImageNodes?: (files: File[], imageType: NodeType, view: EditorView) => Promise<Node[]>;
}): RawPlugins;
declare const updateImageNodeAttribute: (attr?: Node['attrs']) => Command;

declare const image_d_updateImageNodeAttribute: typeof updateImageNodeAttribute;
declare namespace image_d {
  export {
    spec$6 as spec,
    plugins$6 as plugins,
    commands$6 as commands,
    image_d_updateImageNodeAttribute as updateImageNodeAttribute,
  };
}

declare const spec$5: typeof specFactory$5;
declare const plugins$5: typeof pluginsFactory$5;
declare const commands$5: {
    toggleItalic: typeof toggleItalic;
    queryIsItalicActive: typeof queryIsItalicActive;
};
declare const defaultKeys$4: {
    toggleItalic: string;
};
declare function specFactory$5(): RawSpecs;
declare function pluginsFactory$5({ keybindings }?: {
    keybindings?: {
        toggleItalic: string;
    } | undefined;
}): RawPlugins;
declare function toggleItalic(): Command;
declare function queryIsItalicActive(): (state: EditorState) => boolean;

declare const italic_d_toggleItalic: typeof toggleItalic;
declare const italic_d_queryIsItalicActive: typeof queryIsItalicActive;
declare namespace italic_d {
  export {
    spec$5 as spec,
    plugins$5 as plugins,
    commands$5 as commands,
    defaultKeys$4 as defaultKeys,
    italic_d_toggleItalic as toggleItalic,
    italic_d_queryIsItalicActive as queryIsItalicActive,
  };
}

declare const spec$4: typeof specFactory$4;
declare const plugins$4: typeof pluginsFactory$4;
declare const commands$4: {
    createLink: typeof createLink;
    updateLink: typeof updateLink;
    queryLinkAttrs: typeof queryLinkAttrs;
    queryIsLinkAllowedInRange: typeof queryIsLinkAllowedInRange;
    queryIsLinkActive: typeof queryIsLinkActive;
    queryIsSelectionAroundLink: typeof queryIsSelectionAroundLink;
};
declare function specFactory$4({ openOnClick }?: {
    openOnClick?: boolean | undefined;
}): RawSpecs;
declare function pluginsFactory$4(): RawPlugins;
declare const URL_REGEX: RegExp;
/**
 *
 * Commands
 *
 */
/**
 * Sets the selection to href
 * @param {*} href
 */
declare function createLink(href: string): Command;
declare function updateLink(href?: string): Command;
declare function queryLinkAttrs(): (state: EditorState) => {
    href: any;
    text: string;
} | undefined;
declare function queryIsLinkAllowedInRange(from: number, to: number): (state: EditorState) => boolean | undefined;
declare function queryIsLinkActive(): (state: EditorState) => boolean;
declare function queryIsSelectionAroundLink(): (state: EditorState) => boolean;

declare const link_d_URL_REGEX: typeof URL_REGEX;
declare const link_d_createLink: typeof createLink;
declare const link_d_updateLink: typeof updateLink;
declare const link_d_queryLinkAttrs: typeof queryLinkAttrs;
declare const link_d_queryIsLinkAllowedInRange: typeof queryIsLinkAllowedInRange;
declare const link_d_queryIsLinkActive: typeof queryIsLinkActive;
declare const link_d_queryIsSelectionAroundLink: typeof queryIsSelectionAroundLink;
declare namespace link_d {
  export {
    spec$4 as spec,
    plugins$4 as plugins,
    commands$4 as commands,
    link_d_URL_REGEX as URL_REGEX,
    link_d_createLink as createLink,
    link_d_updateLink as updateLink,
    link_d_queryLinkAttrs as queryLinkAttrs,
    link_d_queryIsLinkAllowedInRange as queryIsLinkAllowedInRange,
    link_d_queryIsLinkActive as queryIsLinkActive,
    link_d_queryIsSelectionAroundLink as queryIsSelectionAroundLink,
  };
}

declare const spec$3: typeof specFactory$3;
declare const plugins$3: typeof pluginsFactory$3;
declare const commands$3: {
    indentListItem: typeof indentListItem;
    outdentListItem: typeof outdentListItem;
    moveListItemUp: typeof moveListItemUp;
    moveListItemDown: typeof moveListItemDown;
};
declare const defaultKeys$3: {
    toggleDone: string;
    indent: string;
    outdent: string;
    moveDown: string;
    moveUp: string;
    emptyCopy: string;
    emptyCut: string;
    insertEmptyListAbove: string;
    insertEmptyListBelow: string;
};
declare function specFactory$3(): RawSpecs;
declare function pluginsFactory$3({ keybindings, nodeView, }?: {
    keybindings?: {
        toggleDone: string;
        indent: string;
        outdent: string;
        moveDown: string;
        moveUp: string;
        emptyCopy: string;
        emptyCut: string;
        insertEmptyListAbove: string;
        insertEmptyListBelow: string;
    } | undefined;
    nodeView?: boolean | undefined;
}): RawPlugins;
declare function indentListItem(): Command;
declare function outdentListItem(): Command;
declare function moveListItemUp(): Command;
declare function moveListItemDown(): Command;
declare function insertEmptySiblingList(isAbove?: boolean): Command;
declare function insertEmptySiblingListAbove(): Command;
declare function insertEmptySiblingListBelow(): Command;

declare const listItemComponent_d_indentListItem: typeof indentListItem;
declare const listItemComponent_d_outdentListItem: typeof outdentListItem;
declare const listItemComponent_d_moveListItemUp: typeof moveListItemUp;
declare const listItemComponent_d_moveListItemDown: typeof moveListItemDown;
declare const listItemComponent_d_insertEmptySiblingList: typeof insertEmptySiblingList;
declare const listItemComponent_d_insertEmptySiblingListAbove: typeof insertEmptySiblingListAbove;
declare const listItemComponent_d_insertEmptySiblingListBelow: typeof insertEmptySiblingListBelow;
declare namespace listItemComponent_d {
  export {
    spec$3 as spec,
    plugins$3 as plugins,
    commands$3 as commands,
    defaultKeys$3 as defaultKeys,
    listItemComponent_d_indentListItem as indentListItem,
    listItemComponent_d_outdentListItem as outdentListItem,
    listItemComponent_d_moveListItemUp as moveListItemUp,
    listItemComponent_d_moveListItemDown as moveListItemDown,
    listItemComponent_d_insertEmptySiblingList as insertEmptySiblingList,
    listItemComponent_d_insertEmptySiblingListAbove as insertEmptySiblingListAbove,
    listItemComponent_d_insertEmptySiblingListBelow as insertEmptySiblingListBelow,
  };
}

declare const spec$2: typeof specFactory$2;
declare const plugins$2: typeof pluginsFactory$2;
declare const commands$2: {
    toggleOrderedList: typeof toggleOrderedList;
    queryIsOrderedListActive: typeof queryIsOrderedListActive;
};
declare const defaultKeys$2: {
    toggle: string;
};
declare function specFactory$2(): RawSpecs;
declare function pluginsFactory$2({ keybindings }?: {
    keybindings?: {
        toggle: string;
    } | undefined;
}): RawPlugins;
declare function toggleOrderedList(): Command;
declare function queryIsOrderedListActive(): (state: EditorState) => boolean;

declare const orderedList_d_toggleOrderedList: typeof toggleOrderedList;
declare const orderedList_d_queryIsOrderedListActive: typeof queryIsOrderedListActive;
declare namespace orderedList_d {
  export {
    spec$2 as spec,
    plugins$2 as plugins,
    commands$2 as commands,
    defaultKeys$2 as defaultKeys,
    orderedList_d_toggleOrderedList as toggleOrderedList,
    orderedList_d_queryIsOrderedListActive as queryIsOrderedListActive,
  };
}

declare const spec$1: typeof specFactory$1;
declare const plugins$1: typeof pluginsFactory$1;
declare const commands$1: {
    toggleStrike: typeof toggleStrike;
    queryIsStrikeActive: typeof queryIsStrikeActive;
};
declare const defaultKeys$1: {
    toggleStrike: string;
};
declare function specFactory$1(): RawSpecs;
declare function pluginsFactory$1({ keybindings }?: {
    keybindings?: {
        toggleStrike: string;
    } | undefined;
}): RawPlugins;
declare function toggleStrike(): Command;
declare function queryIsStrikeActive(): (state: EditorState) => boolean;

declare const strike_d_toggleStrike: typeof toggleStrike;
declare const strike_d_queryIsStrikeActive: typeof queryIsStrikeActive;
declare namespace strike_d {
  export {
    spec$1 as spec,
    plugins$1 as plugins,
    commands$1 as commands,
    defaultKeys$1 as defaultKeys,
    strike_d_toggleStrike as toggleStrike,
    strike_d_queryIsStrikeActive as queryIsStrikeActive,
  };
}

declare const spec: typeof specFactory;
declare const plugins: typeof pluginsFactory;
declare const commands: {
    toggleUnderline: typeof toggleUnderline;
    queryIsUnderlineActive: typeof queryIsUnderlineActive;
};
declare const defaultKeys: {
    toggleUnderline: string;
};
declare function specFactory(): RawSpecs;
declare function pluginsFactory({ keybindings }?: {
    keybindings?: {
        toggleUnderline: string;
    } | undefined;
}): InputRule | Plugin | undefined;
declare function toggleUnderline(): Command;
declare function queryIsUnderlineActive(): (state: EditorState) => boolean;

declare const underline_d_spec: typeof spec;
declare const underline_d_plugins: typeof plugins;
declare const underline_d_commands: typeof commands;
declare const underline_d_defaultKeys: typeof defaultKeys;
declare const underline_d_toggleUnderline: typeof toggleUnderline;
declare const underline_d_queryIsUnderlineActive: typeof queryIsUnderlineActive;
declare namespace underline_d {
  export {
    underline_d_spec as spec,
    underline_d_plugins as plugins,
    underline_d_commands as commands,
    underline_d_defaultKeys as defaultKeys,
    underline_d_toggleUnderline as toggleUnderline,
    underline_d_queryIsUnderlineActive as queryIsUnderlineActive,
  };
}

export { blockquote_d as blockquote, bold_d as bold, bulletList_d as bulletList, code_d as code, codeBlock_d as codeBlock, hardBreak_d as hardBreak, heading_d as heading, horizontalRule_d as horizontalRule, image_d as image, italic_d as italic, link_d as link, listItemComponent_d as listItem, orderedList_d as orderedList, strike_d as strike, underline_d as underline };
