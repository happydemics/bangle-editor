import { link, blockquote, orderedList, italic, history, bold, code, paragraph, heading, bulletList, editorStateCounter } from '@bangle.dev/base-components';
import { NodeSelection, keymap, PluginKey } from '@bangle.dev/pm';
import { selectionTooltip } from '@bangle.dev/tooltip';
import { createObject, filter, rafCommandExec } from '@bangle.dev/utils';
import PropTypes from 'prop-types';
import React, { useState, useRef, useCallback } from 'react';
import reactDOM from 'react-dom';
import { useEditorViewContext, usePluginState, EditorViewContext } from '@bangle.dev/react';
import { BangleEditor } from '@bangle.dev/core';

function hasComponentInSchema(state, name) {
    return Boolean(state.schema.nodes[name]) || Boolean(state.schema.marks[name]);
}

const { queryIsSelectionTooltipActive, querySelectionTooltipType, hideSelectionTooltip, updateSelectionTooltipType, } = selectionTooltip;
const plugins = floatingMenu;
const commands = {
    focusFloatingMenuInput,
    toggleLinkSubMenu,
    updateFloatingTooltipType: updateSelectionTooltipType,
    hideFloatingMenu: hideSelectionTooltip,
    queryIsMenuActive: queryIsSelectionTooltipActive,
};
const defaultKeys = {
    hide: 'Escape',
    toggleLink: 'Meta-k',
};
const defaultCalculateType = (state, _prevType) => {
    if (hasComponentInSchema(state, 'link')) {
        if (link.queryIsSelectionAroundLink()(state) ||
            link.queryIsLinkActive()(state)) {
            return 'linkSubMenu';
        }
    }
    if (state.selection.empty) {
        return null;
    }
    if (state.selection instanceof NodeSelection) {
        return 'defaultMenu';
    }
    const { from, to } = state.selection;
    if (!hasTextBetween(state.doc, from, to)) {
        return null;
    }
    return 'defaultMenu';
};
function floatingMenu({ key = new PluginKey('floatingMenuPlugin'), keybindings = defaultKeys, tooltipRenderOpts = {}, calculateType = defaultCalculateType, } = {}) {
    return [
        // @ts-ignore
        selectionTooltip.plugins({
            key,
            calculateType,
            tooltipRenderOpts,
        }),
        keybindings
            ? keymap(createObject([
                [
                    keybindings['hide'],
                    filter(queryIsSelectionTooltipActive(key), hideSelectionTooltip(key)),
                ],
                [keybindings['toggleLink'], toggleLinkSubMenu(key)],
            ]))
            : undefined,
    ];
}
function toggleLinkSubMenu(key) {
    return (state, _dispatch, view) => {
        const type = querySelectionTooltipType(key)(state);
        if (!hasComponentInSchema(state, 'link')) {
            return false;
        }
        if (state.selection.empty) {
            // Focus on link tooltip by keyboard shortcut
            if (type === 'linkSubMenu') {
                rafCommandExec(view, focusFloatingMenuInput(key));
            }
            return false;
        }
        if (type === 'linkSubMenu') {
            return hideSelectionTooltip(key)(view.state, view.dispatch, view);
        }
        rafCommandExec(view, focusFloatingMenuInput(key));
        return updateSelectionTooltipType(key, 'linkSubMenu')(view.state, view.dispatch, view);
    };
}
function focusFloatingMenuInput(key) {
    return (state) => {
        const pluginState = key.getState(state);
        const input = pluginState.tooltipContentDOM.querySelector('input');
        if (!input) {
            return false;
        }
        input.focus();
        return true;
    };
}
function hasTextBetween(doc, from, to) {
    let found = false;
    doc.nodesBetween(from, to, (node, pos) => {
        if (found) {
            return false;
        }
        if (node.isText) {
            const textStart = pos;
            const textEnd = pos + node.text.length;
            const noOverlap = from >= textEnd || to <= textStart;
            if (!noOverlap) {
                found = true;
                return false;
            }
        }
        return;
    });
    return found;
}

var floatingMenu$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    plugins: plugins,
    commands: commands,
    defaultKeys: defaultKeys,
    defaultCalculateType: defaultCalculateType,
    toggleLinkSubMenu: toggleLinkSubMenu,
    focusFloatingMenuInput: focusFloatingMenuInput
});

const MenuButton = ({ className = '', children, isActive, isDisabled, hint, hintPos = 'top', hintBreakWhiteSpace = true, onMouseDown, }) => {
    return (React.createElement("button", { type: "button", "data-bangle-balloon-break": hintBreakWhiteSpace, "aria-label": hint, "data-bangle-balloon-pos": hintPos, disabled: isDisabled, onMouseDown: onMouseDown, className: `bangle-menu-button ${isActive ? 'active' : ''} ${className}` }, children));
};
MenuButton.propTypes = {
    onMouseDown: PropTypes.func,
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
        PropTypes.arrayOf(PropTypes.element),
    ]).isRequired,
};

// Source css.gg
function BoldIcon(props) {
    return (React.createElement("svg", { viewBox: '-6 -5 24 24', xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M5.997 14H1.72c-.618 0-1.058-.138-1.323-.415C.132 13.308 0 12.867 0 12.262V1.738C0 1.121.135.676.406.406.676.136 1.114 0 1.719 0h4.536c.669 0 1.248.041 1.738.124.49.083.93.242 1.318.478a3.458 3.458 0 0 1 1.461 1.752c.134.366.2.753.2 1.16 0 1.401-.7 2.426-2.1 3.075 1.84.586 2.76 1.726 2.76 3.42 0 .782-.2 1.487-.602 2.114a3.61 3.61 0 0 1-1.623 1.39 5.772 5.772 0 0 1-1.471.377c-.554.073-1.2.11-1.939.11zm-.21-6.217h-2.95v4.087h3.046c1.916 0 2.874-.69 2.874-2.072 0-.707-.248-1.22-.745-1.537-.496-.319-1.238-.478-2.225-.478zM2.837 2.13v3.619h2.597c.707 0 1.252-.067 1.638-.2.385-.134.68-.389.883-.765.16-.267.239-.566.239-.897 0-.707-.252-1.176-.755-1.409-.503-.232-1.27-.348-2.301-.348H2.836z" })));
}
function CodeIcon(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M9.95263 16.9123L8.59323 18.3608L2.03082 12.2016L8.18994 5.63922L9.64826 7.00791L4.85783 12.112L9.95212 16.8932L9.95263 16.9123Z" }),
        React.createElement("path", { d: "M14.0474 16.9123L15.4068 18.3608L21.9692 12.2016L15.8101 5.63922L14.3517 7.00791L19.1422 12.112L14.0479 16.8932L14.0474 16.9123Z" })));
}
function BlockquoteIcon(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M9.13456 9H12.1346L10 14.6075H7L9.13456 9Z" }),
        React.createElement("path", { d: "M14.1346 9H17.1346L15 14.6075H12L14.1346 9Z" })));
}
function BulletListIcon() {
    return (React.createElement("svg", { style: { transform: 'scale(1.4, 1.4)' }, viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg" },
        React.createElement("path", { d: "M9 7H7V9H9V7Z" }),
        React.createElement("path", { d: "M7 13V11H9V13H7Z" }),
        React.createElement("path", { d: "M7 15V17H9V15H7Z" }),
        React.createElement("path", { d: "M11 15V17H17V15H11Z" }),
        React.createElement("path", { d: "M17 13V11H11V13H17Z" }),
        React.createElement("path", { d: "M17 7V9H11V7H17Z" })));
}
function TodoListIcon(props) {
    return (React.createElement("svg", { style: { transform: 'scale(0.8, 0.8)' }, viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M10.2426 16.3137L6 12.071L7.41421 10.6568L10.2426 13.4853L15.8995 7.8284L17.3137 9.24262L10.2426 16.3137Z" }),
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M1 5C1 2.79086 2.79086 1 5 1H19C21.2091 1 23 2.79086 23 5V19C23 21.2091 21.2091 23 19 23H5C2.79086 23 1 21.2091 1 19V5ZM5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" })));
}
function ItalicIcon(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M11.4903 5.45801H17.4903L16.7788 7.32716H14.7788L11.2212 16.6729H13.2212L12.5097 18.5421H6.5097L7.22122 16.6729H9.22122L12.7788 7.32716H10.7788L11.4903 5.45801Z" })));
}
function UndoIcon(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M5.33929 4.46777H7.33929V7.02487C8.52931 6.08978 10.0299 5.53207 11.6607 5.53207C15.5267 5.53207 18.6607 8.66608 18.6607 12.5321C18.6607 16.3981 15.5267 19.5321 11.6607 19.5321C9.51025 19.5321 7.58625 18.5623 6.30219 17.0363L7.92151 15.8515C8.83741 16.8825 10.1732 17.5321 11.6607 17.5321C14.4222 17.5321 16.6607 15.2935 16.6607 12.5321C16.6607 9.77065 14.4222 7.53207 11.6607 7.53207C10.5739 7.53207 9.56805 7.87884 8.74779 8.46777L11.3393 8.46777V10.4678H5.33929V4.46777Z", fill: "currentColor" })));
}
function RedoIcon(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M13.1459 11.0499L12.9716 9.05752L15.3462 8.84977C14.4471 7.98322 13.2242 7.4503 11.8769 7.4503C9.11547 7.4503 6.87689 9.68888 6.87689 12.4503C6.87689 15.2117 9.11547 17.4503 11.8769 17.4503C13.6977 17.4503 15.2911 16.4771 16.1654 15.0224L18.1682 15.5231C17.0301 17.8487 14.6405 19.4503 11.8769 19.4503C8.0109 19.4503 4.87689 16.3163 4.87689 12.4503C4.87689 8.58431 8.0109 5.4503 11.8769 5.4503C13.8233 5.4503 15.5842 6.24474 16.853 7.52706L16.6078 4.72412L18.6002 4.5498L19.1231 10.527L13.1459 11.0499Z", fill: "currentColor" })));
}
function HeadingIcon({ level, ...props }) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("text", { x: "12", y: "12", stroke: "currentColor", textAnchor: "middle", alignmentBaseline: "central", dominantBaseline: "middle" },
            "H",
            level)));
}
function ParagraphIcon(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("text", { x: "12", y: "12", stroke: "currentColor", textAnchor: "middle", alignmentBaseline: "central", dominantBaseline: "middle" }, "P")));
}
function OrderedListIcon(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("text", { x: "12", y: "12", stroke: "currentColor", textAnchor: "middle", alignmentBaseline: "central", dominantBaseline: "middle" }, "1.")));
}
function LinkIcon(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M14.8284 12L16.2426 13.4142L19.071 10.5858C20.6331 9.02365 20.6331 6.49099 19.071 4.9289C17.509 3.3668 14.9763 3.3668 13.4142 4.9289L10.5858 7.75732L12 9.17154L14.8284 6.34311C15.6095 5.56206 16.8758 5.56206 17.6568 6.34311C18.4379 7.12416 18.4379 8.39049 17.6568 9.17154L14.8284 12Z" }),
        React.createElement("path", { d: "M12 14.8285L13.4142 16.2427L10.5858 19.0711C9.02372 20.6332 6.49106 20.6332 4.92896 19.0711C3.36686 17.509 3.36686 14.9764 4.92896 13.4143L7.75739 10.5858L9.1716 12L6.34317 14.8285C5.56212 15.6095 5.56212 16.8758 6.34317 17.6569C7.12422 18.4379 8.39055 18.4379 9.1716 17.6569L12 14.8285Z" }),
        React.createElement("path", { d: "M14.8285 10.5857C15.219 10.1952 15.219 9.56199 14.8285 9.17147C14.4379 8.78094 13.8048 8.78094 13.4142 9.17147L9.1716 13.4141C8.78107 13.8046 8.78107 14.4378 9.1716 14.8283C9.56212 15.2188 10.1953 15.2188 10.5858 14.8283L14.8285 10.5857Z" })));
}
function DoneIcon(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M10.2426 16.3137L6 12.071L7.41421 10.6568L10.2426 13.4853L15.8995 7.8284L17.3137 9.24262L10.2426 16.3137Z" }),
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" })));
}
function ExternalIcon(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", style: { transform: 'scale(1.1, 1.1)' }, ...props },
        React.createElement("path", { d: "M15.6396 7.02527H12.0181V5.02527H19.0181V12.0253H17.0181V8.47528L12.1042 13.3892L10.6899 11.975L15.6396 7.02527Z" }),
        React.createElement("path", { d: "M10.9819 6.97473H4.98193V18.9747H16.9819V12.9747H14.9819V16.9747H6.98193V8.97473H10.9819V6.97473Z" })));
}
function CloseIcon(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M16.34 9.32a1 1 0 10-1.36-1.46l-2.93 2.73-2.73-2.93a1 1 0 00-1.46 1.36l2.73 2.93-2.93 2.73a1 1 0 101.36 1.46l2.93-2.73 2.73 2.93a1 1 0 101.46-1.36l-2.73-2.93 2.93-2.73z" }),
        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M1 12a11 11 0 1122 0 11 11 0 01-22 0zm11 9a9 9 0 110-18 9 9 0 010 18z" })));
}
function ChevronDown(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", style: { transform: 'scale(0.8, 0.8)' }, fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M6.34317 7.75732L4.92896 9.17154L12 16.2426L19.0711 9.17157L17.6569 7.75735L12 13.4142L6.34317 7.75732Z" })));
}
function ChevronUp(props) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", style: { transform: 'scale(0.8, 0.8)' }, fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props },
        React.createElement("path", { d: "M17.6569 16.2427L19.0711 14.8285L12.0001 7.75739L4.92896 14.8285L6.34317 16.2427L12.0001 10.5858L17.6569 16.2427Z" })));
}

function MenuGroup({ className = '', children, }) {
    return React.createElement("div", { className: `bangle-menu-group  ${className}` }, children);
}

function LinkSubMenu({ getIsTop = () => true }) {
    const view = useEditorViewContext();
    const result = link.queryLinkAttrs()(view.state);
    const originalHref = (result && result.href) || '';
    return (React.createElement(LinkMenu
    // (hackish) Using the key to unmount then mount
    // the linkmenu so that it discards any preexisting state
    // in its `href` and starts fresh
    , { 
        // (hackish) Using the key to unmount then mount
        // the linkmenu so that it discards any preexisting state
        // in its `href` and starts fresh
        key: originalHref, originalHref: originalHref, view: view, getIsTop: getIsTop }));
}
function LinkMenu({ getIsTop, view, originalHref = '', }) {
    const [href, setHref] = useState(originalHref);
    const inputRef = useRef(null);
    const handleSubmit = () => {
        link.updateLink(href)(view.state, view.dispatch);
        view.focus();
    };
    return (React.createElement("span", { className: "bangle-link-menu" },
        React.createElement("input", { value: href, ref: inputRef, onKeyDown: (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                    view.focus();
                    return;
                }
                const isTop = getIsTop();
                if (isTop && e.key === 'ArrowDown') {
                    e.preventDefault();
                    view.focus();
                    return;
                }
                if (!isTop && e.key === 'ArrowUp') {
                    e.preventDefault();
                    view.focus();
                    return;
                }
                if (e.key === 'Escape') {
                    e.preventDefault();
                    view.focus();
                    return;
                }
            }, onChange: (e) => {
                setHref(e.target.value);
                e.preventDefault();
            } }),
        React.createElement(MenuGroup, null,
            React.createElement(MenuButton, { hint: "Visit", onMouseDown: (e) => {
                    e.preventDefault();
                    window.open(href, '_blank');
                } },
                React.createElement(ExternalIcon, null))),
        href === originalHref ? (React.createElement(MenuButton, { hint: "Clear", onMouseDown: (e) => {
                e.preventDefault();
                link.updateLink()(view.state, view.dispatch);
                view.focus();
            } },
            React.createElement(CloseIcon, null))) : (React.createElement(MenuButton, { hint: "Save", onMouseDown: (e) => {
                e.preventDefault();
                handleSubmit();
                view.focus();
            } },
            React.createElement(DoneIcon, null)))));
}

function Menu({ className = '', children, ...props }) {
    return (React.createElement("div", { className: `bangle-menu ${className}`, ...props }, children));
}

const { defaultKeys: orderedListKeys, queryIsOrderedListActive, toggleOrderedList, } = orderedList;
const { defaultKeys: italicKeys, queryIsItalicActive, toggleItalic } = italic;
const { defaultKeys: historyKeys, undo, redo } = history;
const { defaultKeys: boldKeys, queryIsBoldActive, toggleBold } = bold;
const { defaultKeys: codeKeys, queryIsCodeActive, toggleCode } = code;
const { defaultKeys: paragraphKeys, queryIsTopLevelParagraph, convertToParagraph, } = paragraph;
const { defaultKeys: headingKeys, queryIsHeadingActive, toggleHeading, } = heading;
const { createLink, queryIsLinkActive } = link;
const { defaultKeys: bulletListKeys, queryIsBulletListActive, queryIsTodoListActive, toggleBulletList, toggleTodoList, } = bulletList;
function BoldButton({ hint = 'Bold\n' + boldKeys.toggleBold, hintPos = 'top', children = React.createElement(BoldIcon, null), ...props }) {
    const view = useEditorViewContext();
    const onSelect = useCallback((e) => {
        e.preventDefault();
        if (toggleBold()(view.state, view.dispatch, view)) {
            if (view.dispatch) {
                view.focus();
            }
        }
    }, [view]);
    return (React.createElement(MenuButton, { ...props, hintPos: hintPos, onMouseDown: onSelect, hint: hint, isActive: queryIsBoldActive()(view.state), isDisabled: !view.editable || !toggleBold()(view.state) }, children));
}
function BlockquoteButton({ hint = 'Wrap in Blockquote\n' + blockquote.defaultKeys.wrapIn, hintPos = 'top', children = React.createElement(BlockquoteIcon, null), ...props }) {
    const view = useEditorViewContext();
    const onSelect = useCallback((e) => {
        e.preventDefault();
        if (blockquote.commands.wrapInBlockquote()(view.state, view.dispatch, view)) {
            if (view.dispatch) {
                view.focus();
            }
        }
    }, [view]);
    return (React.createElement(MenuButton, { ...props, hintPos: hintPos, onMouseDown: onSelect, hint: hint, isActive: blockquote.commands.queryIsBlockquoteActive()(view.state), isDisabled: !view.editable || !blockquote.commands.wrapInBlockquote()(view.state) }, children));
}
function ItalicButton({ hint = 'Italic\n' + italicKeys.toggleItalic, hintPos = 'top', children = React.createElement(ItalicIcon, null), ...props }) {
    const view = useEditorViewContext();
    const onSelect = useCallback((e) => {
        e.preventDefault();
        if (toggleItalic()(view.state, view.dispatch, view)) {
            if (view.dispatch) {
                view.focus();
            }
        }
    }, [view]);
    return (React.createElement(MenuButton, { ...props, hintPos: hintPos, onMouseDown: onSelect, hint: hint, isActive: queryIsItalicActive()(view.state), isDisabled: !view.editable || !toggleItalic()(view.state) }, children));
}
function UndoButton({ hint = 'Undo\n' + historyKeys.undo, hintPos = 'top', children = React.createElement(UndoIcon, null), ...props }) {
    const view = useEditorViewContext();
    const onSelect = useCallback((e) => {
        e.preventDefault();
        if (undo()(view.state, view.dispatch)) {
            if (view.dispatch) {
                view.focus();
            }
        }
    }, [view]);
    return (React.createElement(MenuButton, { ...props, hintPos: hintPos, onMouseDown: onSelect, hint: hint, isDisabled: !view.editable || !undo()(view.state) }, children));
}
function RedoButton({ hint = 'Redo\n' + historyKeys.redo, hintPos = 'top', children = React.createElement(RedoIcon, null), ...props }) {
    const view = useEditorViewContext();
    const onSelect = useCallback((e) => {
        e.preventDefault();
        if (redo()(view.state, view.dispatch)) {
            if (view.dispatch) {
                view.focus();
            }
        }
    }, [view]);
    return (React.createElement(MenuButton, { ...props, hintPos: hintPos, onMouseDown: onSelect, hint: hint, isDisabled: !view.editable || !redo()(view.state) }, children));
}
function CodeButton({ hint = 'Code\n' + codeKeys.toggleCode, hintPos = 'top', children = React.createElement(CodeIcon, null), ...props }) {
    const view = useEditorViewContext();
    const onSelect = useCallback((e) => {
        e.preventDefault();
        if (toggleCode()(view.state, view.dispatch, view)) {
            if (view.dispatch) {
                view.focus();
            }
        }
    }, [view]);
    return (React.createElement(MenuButton, { ...props, hintPos: hintPos, onMouseDown: onSelect, hint: hint, isActive: queryIsCodeActive()(view.state), isDisabled: !view.editable || !toggleCode()(view.state) }, children));
}
function BulletListButton({ hint = 'BulletList\n' + bulletListKeys.toggle, hintPos = 'top', children = React.createElement(BulletListIcon, null), ...props }) {
    const view = useEditorViewContext();
    const onSelect = useCallback((e) => {
        e.preventDefault();
        if (toggleBulletList()(view.state, view.dispatch, view)) {
            if (view.dispatch) {
                view.focus();
            }
        }
    }, [view]);
    return (React.createElement(MenuButton, { ...props, hintPos: hintPos, onMouseDown: onSelect, hint: hint, isDisabled: !view.editable, isActive: queryIsBulletListActive()(view.state) &&
            !queryIsTodoListActive()(view.state) }, children));
}
function OrderedListButton({ hint = 'OrderedList\n' + orderedListKeys.toggle, hintPos = 'top', children = React.createElement(OrderedListIcon, null), ...props }) {
    const view = useEditorViewContext();
    const onSelect = useCallback((e) => {
        e.preventDefault();
        if (toggleOrderedList()(view.state, view.dispatch, view)) {
            if (view.dispatch) {
                view.focus();
            }
        }
    }, [view]);
    return (React.createElement(MenuButton, { ...props, hintPos: hintPos, onMouseDown: onSelect, hint: hint, isDisabled: !view.editable, isActive: queryIsOrderedListActive()(view.state) }, children));
}
function TodoListButton({ hint = 'TodoList\n' + bulletListKeys.toggleTodo, hintPos = 'top', children = React.createElement(TodoListIcon, null), ...props }) {
    const view = useEditorViewContext();
    const onSelect = useCallback((e) => {
        e.preventDefault();
        if (toggleTodoList()(view.state, view.dispatch, view)) {
            if (view.dispatch) {
                view.focus();
            }
        }
    }, [view]);
    return (React.createElement(MenuButton, { ...props, hintPos: hintPos, onMouseDown: onSelect, hint: hint, isDisabled: !view.editable, isActive: queryIsTodoListActive()(view.state) }, children));
}
function HeadingButton({ level, hint = `Heading${level}\n` + headingKeys['toH' + level], hintPos = 'top', children = React.createElement(HeadingIcon, { level: level }), ...props }) {
    const view = useEditorViewContext();
    const onSelect = useCallback((e) => {
        e.preventDefault();
        if (toggleHeading(level)(view.state, view.dispatch, view)) {
            if (view.dispatch) {
                view.focus();
            }
        }
    }, [view, level]);
    return (React.createElement(MenuButton, { ...props, hintPos: hintPos, onMouseDown: onSelect, hint: hint, isActive: queryIsHeadingActive(level)(view.state), isDisabled: !view.editable || !toggleHeading(level)(view.state) }, children));
}
HeadingButton.propTypes = {
    level: PropTypes.number.isRequired,
};
function ParagraphButton({ hint = `Paragraph\n` + paragraphKeys.convertToParagraph, hintPos = 'top', children = React.createElement(ParagraphIcon, null), ...props }) {
    const view = useEditorViewContext();
    const onSelect = useCallback((e) => {
        e.preventDefault();
        if (convertToParagraph()(view.state, view.dispatch, view)) {
            if (view.dispatch) {
                view.focus();
            }
        }
    }, [view]);
    return (React.createElement(MenuButton, { ...props, hintPos: hintPos, onMouseDown: onSelect, hint: hint, isActive: queryIsTopLevelParagraph()(view.state), isDisabled: !view.editable || !convertToParagraph()(view.state) }, children));
}
function FloatingLinkButton({ hint = 'Link\n' + defaultKeys.toggleLink, hintPos = 'top', children = React.createElement(LinkIcon, null), menuKey, }) {
    const view = useEditorViewContext();
    const onMouseDown = useCallback((e) => {
        e.preventDefault();
        const command = filter((state) => createLink('')(state), (_state, dispatch, view) => {
            if (dispatch) {
                toggleLinkSubMenu(menuKey)(view.state, view.dispatch, view);
                rafCommandExec(view, focusFloatingMenuInput(menuKey));
            }
            return true;
        });
        if (command(view.state, view.dispatch, view)) {
            if (view.dispatch) {
                view.focus();
            }
        }
    }, [view, menuKey]);
    return (React.createElement(MenuButton, { onMouseDown: onMouseDown, hint: hint, hintPos: hintPos, isActive: queryIsLinkActive()(view.state), isDisabled: !view.editable || !createLink('')(view.state) }, children));
}
FloatingLinkButton.propTypes = {
    menuKey: PropTypes.instanceOf(PluginKey).isRequired,
};

function FloatingMenu({ menuKey, renderMenuType = ({ type, menuKey, editorState }) => {
    if (type === 'defaultMenu') {
        //  NOTE these hasComponentInSchema checks exist because this is a default callback value
        // and it cannot make any assumptions on the schema.
        // The API is designed so that the user overrides this with their own callback and since they
        // would know the schema, they wouldnt need such checks.
        return (React.createElement(Menu, null,
            React.createElement(MenuGroup, null,
                hasComponentInSchema(editorState, 'bold') && React.createElement(BoldButton, null),
                hasComponentInSchema(editorState, 'italic') && React.createElement(ItalicButton, null),
                hasComponentInSchema(editorState, 'code') && React.createElement(CodeButton, null),
                hasComponentInSchema(editorState, 'link') && (React.createElement(FloatingLinkButton, { menuKey: menuKey }))),
            React.createElement(MenuGroup, null,
                hasComponentInSchema(editorState, 'heading') && (React.createElement(HeadingButton, { level: 2 })),
                hasComponentInSchema(editorState, 'heading') && (React.createElement(HeadingButton, { level: 3 })),
                hasComponentInSchema(editorState, 'bulletList') && (React.createElement(BulletListButton, null)),
                hasComponentInSchema(editorState, 'bulletList') && (React.createElement(TodoListButton, null)))));
    }
    if (type === 'linkSubMenu') {
        return (React.createElement(Menu, null,
            React.createElement(LinkSubMenu, null)));
    }
    return null;
}, }) {
    const menuState = usePluginState(menuKey);
    const view = useEditorViewContext();
    const renderElement = renderMenuType({
        type: menuState.type,
        menuKey,
        editorState: view.state,
    });
    return renderElement
        ? reactDOM.createPortal(renderElement, menuState.tooltipContentDOM)
        : null;
}
FloatingMenu.propTypes = {
    menuKey: PropTypes.instanceOf(PluginKey).isRequired,
    renderMenuType: PropTypes.func,
};

function MenuDropdown({ className = '', parent, children, }) {
    const [isDropdownVisible, updateDropdown] = useState(false);
    return (React.createElement("div", { className: `bangle-menu-dropdown ${className}` },
        parent({
            isDropdownVisible,
            updateDropdown,
        }),
        isDropdownVisible ? (React.createElement("div", { className: "bangle-menu-vertical-group" }, children)) : null));
}

function StaticMenu({ editor, renderMenu }) {
    return editor ? (React.createElement(EditorViewContext.Provider, { value: editor.view },
        React.createElement(StaticMenuContainer, { renderMenu: renderMenu }))) : null;
}
StaticMenu.propTypes = {
    renderMenu: PropTypes.func.isRequired,
    editor: PropTypes.instanceOf(BangleEditor),
};
function StaticMenuContainer({ renderMenu, }) {
    usePluginState(editorStateCounter.docChangedKey, true);
    usePluginState(editorStateCounter.selectionChangedKey, true);
    return renderMenu();
}

export { BlockquoteButton, BlockquoteIcon, BoldButton, BoldIcon, BulletListButton, BulletListIcon, ChevronDown, ChevronUp, CloseIcon, CodeButton, CodeIcon, DoneIcon, ExternalIcon, FloatingLinkButton, FloatingMenu, HeadingButton, HeadingIcon, ItalicButton, ItalicIcon, LinkIcon, LinkSubMenu, Menu, MenuButton, MenuDropdown, MenuGroup, OrderedListButton, OrderedListIcon, ParagraphButton, ParagraphIcon, RedoButton, RedoIcon, StaticMenu, TodoListButton, TodoListIcon, UndoButton, UndoIcon, floatingMenu$1 as floatingMenu };
