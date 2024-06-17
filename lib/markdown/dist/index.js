import markdownIt from 'markdown-it';
import { MarkdownParser, MarkdownSerializer } from 'prosemirror-markdown';
import { SpecRegistry } from '@bangle.dev/core';
import Token from 'markdown-it/lib/token';
import { assertNotUndefined } from '@bangle.dev/utils';

/**
 * A generic markdown parser for inline nodes which can be
 * programmed to read syntax that can be parsed by a regex.
 * A good use case is something like tags ( `#xyz` ) or wiki-links ( `[xyz]` )
 *
 */
function inlineNodeParser(md, { tokenName, regex, getTokenDetails = (match) => {
    return { payload: match.slice(1, -1), markup: '' };
}, }) {
    const arrayReplaceAt = md.utils.arrayReplaceAt;
    md.core.ruler.push(tokenName, (state) => {
        var i, j, l, tokens, token, blockTokens = state.tokens, autolinkLevel = 0;
        for (j = 0, l = blockTokens.length; j < l; j++) {
            let blockToken = blockTokens[j];
            if (!blockToken || blockToken.type !== 'inline') {
                continue;
            }
            tokens = blockToken.children;
            for (i = tokens.length - 1; i >= 0; i--) {
                token = tokens[i];
                if (!token) {
                    continue;
                }
                // if (token.type === 'link_open' || token.type === 'link_close') {
                //   if (token.info === 'auto') {
                //     autolinkLevel -= token.nesting;
                //   }
                // }
                if (token.type === 'text' &&
                    autolinkLevel === 0 &&
                    regex.test(token.content)) {
                    // replace current node
                    blockToken.children = tokens = arrayReplaceAt(tokens, i, splitTextToken(regex, getTokenDetails, tokenName)(token.content, token.level, state.Token));
                }
            }
        }
    });
}
// inspired from markdown-it-emoji
function splitTextToken(regex, getTokenDetails, tokenName) {
    return (text, level, Token) => {
        var token, last_pos = 0, nodes = [];
        text.replace(regex, (match, ...args) => {
            // so the callback is called with variable arguments
            // : (match, p1, p2, ...,pN, offset, string);
            // where p1 p2 .. pN, represent the matches due to capturing groups
            // since we donot care about them we extract the second last arg.
            const offset = args[args.length - 2];
            let { payload, markup, whiteSpaceAfter, whiteSpaceBefore } = getTokenDetails(match, offset, text);
            // Add new tokens to pending list
            if (offset > last_pos) {
                token = new Token('text', '', 0);
                token.content = text.slice(last_pos, offset);
                nodes.push(token);
            }
            if (whiteSpaceBefore) {
                let wToken = new Token('text', '', 0);
                wToken.content = ' ';
                nodes.push(wToken);
            }
            token = new Token(tokenName, '', 0);
            token.markup = markup;
            token.payload = payload;
            nodes.push(token);
            if (whiteSpaceAfter) {
                let wToken = new Token('text', '', 0);
                wToken.content = ' ';
                nodes.push(wToken);
            }
            last_pos = offset + match.length;
            // return empty string to keep type happy
            return '';
        });
        if (last_pos < text.length) {
            token = new Token('text', '', 0);
            token.content = text.slice(last_pos);
            nodes.push(token);
        }
        return nodes;
    };
}

function markdownLoader(specRegistry = new SpecRegistry()) {
    var _a, _b;
    const tokens = Object.fromEntries(specRegistry.spec
        .filter((e) => e.markdown && e.markdown.parseMarkdown)
        .flatMap((e) => {
        var _a;
        return Object.entries(((_a = e.markdown) === null || _a === void 0 ? void 0 : _a.parseMarkdown) || {});
    }));
    let nodeSerializer = {};
    for (const spec of specRegistry.spec) {
        if (spec.type === 'node' && ((_a = spec.markdown) === null || _a === void 0 ? void 0 : _a.toMarkdown)) {
            nodeSerializer[spec.name] = spec.markdown.toMarkdown;
        }
    }
    let markSerializer = {};
    for (const spec of specRegistry.spec) {
        if (spec.type === 'mark' && ((_b = spec.markdown) === null || _b === void 0 ? void 0 : _b.toMarkdown)) {
            markSerializer[spec.name] = spec.markdown.toMarkdown;
        }
    }
    return {
        tokens,
        serializer: {
            node: nodeSerializer,
            mark: markSerializer,
        },
    };
}

function tableMarkdownItPlugin(md, options = {}) {
    md.core.ruler.after('inline', 'tables', function (state) {
        state.tokens = removeWrapping(state.tokens, 'tbody');
        state.tokens = removeWrapping(state.tokens, 'thead');
        state.tokens = insertParagraph(state.tokens);
        return false;
    });
}
function removeWrapping(tokens, type) {
    const openType = type + '_open';
    const closeType = type + '_close';
    let subtractBy = 0;
    return tokens.filter((token) => {
        token.level = token.level - subtractBy;
        if (openType === token.type) {
            subtractBy++;
        }
        if (closeType === token.type) {
            subtractBy--;
        }
        return ![openType, closeType].includes(token.type);
    });
}
function insertParagraph(tokens) {
    return tokens.flatMap((token) => {
        if (['th_open', 'td_open'].includes(token.type)) {
            if (token.attrs) {
                const [, style] = token.attrs[0] || [];
                if (style) {
                    token.align = style.split(':')[1];
                }
            }
            return [token, new Token('paragraph_open', 'p', 1)];
        }
        if (['th_close', 'td_close'].includes(token.type)) {
            return [token, new Token('paragraph_close', 'p', -1)];
        }
        return token;
    });
}

function todoListMarkdownItPlugin(md, options = {}) {
    const { todoListOpenType = 'bullet_list_open', todoListCloseType = 'bullet_list_close', todoItemCloseType = 'list_item_close', todoItemOpenName = 'list_item_open', isDoneAttrName = 'isDone', } = options;
    md.core.ruler.after('inline', 'gfm-todo-list', function (state) {
        var tokens = state.tokens;
        for (var i = 0; i < tokens.length; i++) {
            processToken(tokens, i);
        }
    });
    function processToken(tokens, index) {
        var _a;
        if (((_a = tokens[index]) === null || _a === void 0 ? void 0 : _a.type) !== 'bullet_list_open') {
            return;
        }
        const children = getChildren(tokens, index);
        if (children
            .filter(([child]) => child.type === 'list_item_open')
            .every(([child, childIndex]) => !isListItemTodoItem(tokens, childIndex))) {
            return;
        }
        // this means some or all children are todoItems
        if (children.some(([child]) => !child.type.startsWith('list_item_'))) {
            throw new Error('Expected all children to be of type list_item_*');
        }
        const closingToken = findMatchingCloseToken(tokens, index);
        if (closingToken === -1) {
            throw new Error('Must have a closing token');
        }
        tokens[index].type = todoListOpenType;
        tokens[closingToken].type = todoListCloseType;
        children.forEach(([todoItem]) => {
            if (todoItem.type === 'list_item_close') {
                todoItem.type = todoItemCloseType;
            }
            if (todoItem.type === 'list_item_open') {
                todoItem.type = todoItemOpenName;
            }
        });
        children
            .filter(([todoItem]) => todoItem.type === todoItemOpenName)
            .forEach(([todoItem, todoItemIndex]) => {
            // we add a +2 since the check works on the inline para node
            const inlineToken = tokens[todoItemIndex + 2];
            assertNotUndefined(inlineToken, 'inlineToken cannot be undefined');
            if (inlineToken.children == null) {
                inlineToken.children = [new Token('text', '', 0)];
            }
            const inlineTokenChild = inlineToken.children[0];
            assertNotUndefined(inlineTokenChild, 'inlineTokenChild cannot be undefined');
            let isDone = null;
            if (startsWithTodoMarkdown(inlineTokenChild)) {
                const charAt1 = typeof inlineTokenChild.content === 'string'
                    ? inlineTokenChild.content.charAt(1)
                    : null;
                if (charAt1 && ['x', 'X'].includes(charAt1)) {
                    isDone = 'yes';
                }
                else {
                    isDone = 'no';
                }
            }
            const existingAttrs = todoItem.attrs;
            if (isDone) {
                if (existingAttrs) {
                    todoItem.attrs = [[isDoneAttrName, isDone], ...existingAttrs];
                }
                else {
                    todoItem.attrs = [[isDoneAttrName, isDone]];
                }
            }
            inlineTokenChild.content = trimTodoSquare(inlineTokenChild.content);
            inlineToken.content = trimTodoSquare(inlineToken.content);
        });
    }
    function findMatchingCloseToken(tokens, position) {
        var _a, _b;
        const type = ((_a = tokens[position]) === null || _a === void 0 ? void 0 : _a.type) || '';
        if (!type.endsWith('_open')) {
            throw new Error('expect type to be _open');
        }
        const endType = type.split('_open').join('') + '_close';
        var targetLevel = (_b = tokens[position]) === null || _b === void 0 ? void 0 : _b.level;
        for (var i = position + 1; i < tokens.length; i++) {
            if (tokens[i].level === targetLevel && tokens[i].type === endType) {
                return i;
            }
        }
        return -1;
    }
    // returns children of same level
    function getChildren(tokens, position) {
        const parentOpen = tokens[position];
        assertNotUndefined(parentOpen, 'parentOpen cannot be undefined');
        if (!parentOpen.type.endsWith('_open')) {
            throw new Error('Can only work with _open types');
        }
        const endType = parentOpen.type.split('_open').join('') + '_close';
        const result = [];
        for (let i = position + 1; i < tokens.length; i++) {
            const current = tokens[i];
            if (current.level < parentOpen.level) {
                break;
            }
            if (current.level === parentOpen.level && current.type === endType) {
                break;
            }
            if (current.level === parentOpen.level + 1) {
                result.push([current, i]);
            }
        }
        return result;
    }
    function trimTodoSquare(str) {
        return strStartsWithTodoMarkdown(str) ? str.slice(4) : str;
    }
    function strStartsWithTodoMarkdown(str) {
        return str
            ? str.startsWith('[ ] ') ||
                str.startsWith('[x] ') ||
                str.startsWith('[X] ')
            : false;
    }
    function startsWithTodoMarkdown(token) {
        // leading whitespace in a list item is already trimmed off by markdown-it
        return strStartsWithTodoMarkdown(token === null || token === void 0 ? void 0 : token.content);
    }
    function isListItemTodoItem(tokens, index) {
        function isInline(token) {
            return (token === null || token === void 0 ? void 0 : token.type) === 'inline';
        }
        function isParagraph(token) {
            return (token === null || token === void 0 ? void 0 : token.type) === 'paragraph_open';
        }
        function isListItem(token) {
            return (token === null || token === void 0 ? void 0 : token.type) === 'list_item_open';
        }
        return (isInline(tokens[index + 2]) &&
            isParagraph(tokens[index + 1]) &&
            isListItem(tokens[index]) &&
            startsWithTodoMarkdown(tokens[index + 2]));
    }
}

const getDefaultMarkdownItTokenizer = () => markdownIt().use(todoListMarkdownItPlugin).use(tableMarkdownItPlugin);
function markdownParser(specRegistry = new SpecRegistry(), markdownItTokenizer = getDefaultMarkdownItTokenizer()) {
    const { tokens } = markdownLoader(specRegistry);
    return new MarkdownParser(specRegistry.schema, markdownItTokenizer, tokens);
}

// A markdown serializer which uses a node/mark schema's
// toMarkdown property to generate a markdown string
const markdownSerializer = (specRegistry) => {
    const { serializer } = markdownLoader(specRegistry);
    return new MarkdownSerializer(serializer.node, serializer.mark);
};

export { getDefaultMarkdownItTokenizer, inlineNodeParser, markdownParser, markdownSerializer, todoListMarkdownItPlugin };
