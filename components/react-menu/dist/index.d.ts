import { EditorState, Plugin, InputRule, PluginKey, Command } from '@bangle.dev/pm';
import { selectionTooltip, SelectionTooltipProps } from '@bangle.dev/tooltip';
import PropTypes from 'prop-types';
import React from 'react';
import { BangleEditor } from '@bangle.dev/core';

declare const plugins: typeof floatingMenu;
declare const commands: {
    focusFloatingMenuInput: typeof focusFloatingMenuInput;
    toggleLinkSubMenu: typeof toggleLinkSubMenu;
    updateFloatingTooltipType: typeof selectionTooltip.updateSelectionTooltipType;
    hideFloatingMenu: typeof selectionTooltip.hideSelectionTooltip;
    queryIsMenuActive: typeof selectionTooltip.queryIsSelectionTooltipActive;
};
declare const defaultKeys: {
    hide: string;
    toggleLink: string;
};
declare const defaultCalculateType: (state: EditorState, _prevType: string | null) => "linkSubMenu" | "defaultMenu" | null;
interface FloatingMenuPluginArgs extends Partial<SelectionTooltipProps> {
    keybindings?: {
        [index: string]: string;
    };
}
declare function floatingMenu({ key, keybindings, tooltipRenderOpts, calculateType, }?: FloatingMenuPluginArgs): Array<undefined | Plugin | (() => Plugin) | InputRule>;
declare function toggleLinkSubMenu(key: PluginKey): Command;
declare function focusFloatingMenuInput(key: PluginKey): (state: EditorState) => boolean;

declare const floatingMenu_d_plugins: typeof plugins;
declare const floatingMenu_d_commands: typeof commands;
declare const floatingMenu_d_defaultKeys: typeof defaultKeys;
declare const floatingMenu_d_defaultCalculateType: typeof defaultCalculateType;
declare const floatingMenu_d_toggleLinkSubMenu: typeof toggleLinkSubMenu;
declare const floatingMenu_d_focusFloatingMenuInput: typeof focusFloatingMenuInput;
declare namespace floatingMenu_d {
  export {
    floatingMenu_d_plugins as plugins,
    floatingMenu_d_commands as commands,
    floatingMenu_d_defaultKeys as defaultKeys,
    floatingMenu_d_defaultCalculateType as defaultCalculateType,
    floatingMenu_d_toggleLinkSubMenu as toggleLinkSubMenu,
    floatingMenu_d_focusFloatingMenuInput as focusFloatingMenuInput,
  };
}

declare function FloatingMenu({ menuKey, renderMenuType, }: {
    menuKey: PluginKey;
    renderMenuType?: (opts: {
        menuKey: PluginKey;
        type: string;
        editorState: EditorState;
    }) => JSX.Element | null;
}): React.ReactPortal | null;
declare namespace FloatingMenu {
    var propTypes: {
        menuKey: PropTypes.Validator<PluginKey<any>>;
        renderMenuType: PropTypes.Requireable<(...args: any[]) => any>;
    };
}

type HintPos = 'top' | 'bottom' | 'left' | 'right';

interface MenuButtonProps {
    className?: string;
    children: React.ReactNode;
    isActive?: boolean;
    isDisabled?: boolean;
    hint: string;
    hintPos?: HintPos;
    hintBreakWhiteSpace?: boolean;
    onMouseDown?: React.MouseEventHandler;
}
declare const MenuButton: {
    ({ className, children, isActive, isDisabled, hint, hintPos, hintBreakWhiteSpace, onMouseDown, }: MenuButtonProps): React.JSX.Element;
    propTypes: {
        onMouseDown: PropTypes.Requireable<(...args: any[]) => any>;
        children: PropTypes.Validator<NonNullable<NonNullable<string | PropTypes.ReactElementLike | (PropTypes.ReactElementLike | null | undefined)[] | null | undefined>>>;
    };
};

declare function BoldIcon(props: any): React.JSX.Element;
declare function CodeIcon(props: any): React.JSX.Element;
declare function BlockquoteIcon(props: any): React.JSX.Element;
declare function BulletListIcon(): React.JSX.Element;
declare function TodoListIcon(props: any): React.JSX.Element;
declare function ItalicIcon(props: any): React.JSX.Element;
declare function UndoIcon(props: any): React.JSX.Element;
declare function RedoIcon(props: any): React.JSX.Element;
declare function HeadingIcon({ level, ...props }: {
    level: number;
}): React.JSX.Element;
declare function ParagraphIcon(props: any): React.JSX.Element;
declare function OrderedListIcon(props: any): React.JSX.Element;
declare function LinkIcon(props: any): React.JSX.Element;
declare function DoneIcon(props: any): React.JSX.Element;
declare function ExternalIcon(props: any): React.JSX.Element;
declare function CloseIcon(props: any): React.JSX.Element;
declare function ChevronDown(props: any): React.JSX.Element;
declare function ChevronUp(props: any): React.JSX.Element;

declare function LinkSubMenu({ getIsTop }: {
    getIsTop?: (() => boolean) | undefined;
}): React.JSX.Element;

declare function Menu({ className, children, ...props }: {
    className?: string;
    children: React.ReactNode;
}): React.JSX.Element;

interface ButtonProps {
    hint?: string;
    hintPos?: HintPos;
    children?: React.ReactNode;
}
declare function BoldButton({ hint, hintPos, children, ...props }: ButtonProps): React.JSX.Element;
declare function BlockquoteButton({ hint, hintPos, children, ...props }: ButtonProps): React.JSX.Element;
declare function ItalicButton({ hint, hintPos, children, ...props }: ButtonProps): React.JSX.Element;
declare function UndoButton({ hint, hintPos, children, ...props }: ButtonProps): React.JSX.Element;
declare function RedoButton({ hint, hintPos, children, ...props }: ButtonProps): React.JSX.Element;
declare function CodeButton({ hint, hintPos, children, ...props }: ButtonProps): React.JSX.Element;
declare function BulletListButton({ hint, hintPos, children, ...props }: ButtonProps): React.JSX.Element;
declare function OrderedListButton({ hint, hintPos, children, ...props }: ButtonProps): React.JSX.Element;
declare function TodoListButton({ hint, hintPos, children, ...props }: ButtonProps): React.JSX.Element;
declare function HeadingButton({ level, hint, hintPos, children, ...props }: ButtonProps & {
    level: number;
}): React.JSX.Element;
declare namespace HeadingButton {
    var propTypes: {
        level: PropTypes.Validator<number>;
    };
}
declare function ParagraphButton({ hint, hintPos, children, ...props }: ButtonProps): React.JSX.Element;
declare function FloatingLinkButton({ hint, hintPos, children, menuKey, }: ButtonProps & {
    menuKey: PluginKey;
}): React.JSX.Element;
declare namespace FloatingLinkButton {
    var propTypes: {
        menuKey: PropTypes.Validator<PluginKey<any>>;
    };
}

declare function MenuDropdown({ className, parent, children, }: {
    className?: string;
    children: React.ReactNode;
    parent: (arg: {
        isDropdownVisible: boolean;
        updateDropdown: (isDropdownVisible: boolean) => void;
    }) => React.ReactNode;
}): React.JSX.Element;

declare function MenuGroup({ className, children, }: {
    className?: string;
    children: React.ReactNode;
}): React.JSX.Element;

interface StaticMenuProps {
    renderMenu(): JSX.Element;
    editor?: BangleEditor;
}
declare function StaticMenu({ editor, renderMenu }: StaticMenuProps): React.JSX.Element | null;
declare namespace StaticMenu {
    var propTypes: {
        renderMenu: PropTypes.Validator<(...args: any[]) => any>;
        editor: PropTypes.Requireable<BangleEditor<any>>;
    };
}

export { BlockquoteButton, BlockquoteIcon, BoldButton, BoldIcon, BulletListButton, BulletListIcon, ChevronDown, ChevronUp, CloseIcon, CodeButton, CodeIcon, DoneIcon, ExternalIcon, FloatingLinkButton, FloatingMenu, HeadingButton, HeadingIcon, ItalicButton, ItalicIcon, LinkIcon, LinkSubMenu, Menu, MenuButton, MenuButtonProps, MenuDropdown, MenuGroup, OrderedListButton, OrderedListIcon, ParagraphButton, ParagraphIcon, RedoButton, RedoIcon, StaticMenu, TodoListButton, TodoListIcon, UndoButton, UndoIcon, floatingMenu_d as floatingMenu };
