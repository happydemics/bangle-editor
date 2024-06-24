import { domSerializationHelpers } from '@bangle.dev/core';
import { inlineNodeParser } from '@bangle.dev/markdown';

const name = 'wikiLink';
const spec = specFactory;
function specFactory() {
    const { toDOM, parseDOM } = domSerializationHelpers(name, {
        tag: 'span',
        parsingPriority: 52,
    });
    return {
        type: 'node',
        name: name,
        schema: {
            attrs: {
                path: {
                    default: null,
                },
                title: {
                    default: null,
                },
            },
            inline: true,
            group: 'inline',
            selectable: false,
            draggable: true,
            toDOM,
            parseDOM,
        },
        markdown: {
            toMarkdown: (state, node) => {
                state.text('[[', false);
                const { path, title } = node.attrs;
                let content = path;
                if (title && title !== path) {
                    content += '|' + title;
                }
                state.text(content, false);
                state.text(']]', false);
            },
            parseMarkdown: {
                wiki_link: {
                    block: name,
                    getAttrs: (tok) => {
                        // @ts-ignore
                        if (typeof tok.payload === 'string') {
                            // @ts-ignore
                            let [path, title] = tok.payload.split('|');
                            return { path, title };
                        }
                        return null;
                    },
                    noCloseToken: true,
                },
            },
        },
    };
}

var wikiLink = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec
});

function wikiLinkMarkdownItPlugin(md) {
    inlineNodeParser(md, {
        tokenName: 'wiki_link',
        regex: /\[\[([^\]\[]+)\]\]/g,
        getTokenDetails: (match) => {
            // 2 since [[ has length 2
            return { payload: match.slice(2, -2), markup: match.slice(2, -2) };
        },
    });
}

export { wikiLink, wikiLinkMarkdownItPlugin };
