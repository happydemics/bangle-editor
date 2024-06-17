'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pm = require('@bangle.dev/pm');
var utils = require('@bangle.dev/utils');

const name = 'search';
const plugins = pluginsFactory;
function pluginsFactory({ key = new pm.PluginKey(name), query: initialQuery, className = 'bangle-search-match', maxHighlights = 1500, }) {
    function buildDeco(state, query) {
        if (!query) {
            return pm.DecorationSet.empty;
        }
        const matches = findMatches(state.doc, query, maxHighlights);
        const decorations = matches.map((match) => {
            // TODO we should improve the performance
            // by only creating decos which need an update
            // see https://discuss.prosemirror.net/t/how-to-update-multiple-inline-decorations-on-node-change/1493
            return pm.Decoration.inline(match.pos + match.match.start, match.pos + match.match.end, {
                class: className,
            });
        });
        return pm.DecorationSet.create(state.doc, decorations);
    }
    return () => new pm.Plugin({
        key: key,
        state: {
            init(_, state) {
                return {
                    query: initialQuery,
                    decos: buildDeco(state, initialQuery),
                };
            },
            apply(tr, old, oldState, newState) {
                const meta = tr.getMeta(key);
                if (meta) {
                    const newQuery = meta.query;
                    return {
                        query: newQuery,
                        decos: buildDeco(newState, newQuery),
                    };
                }
                return tr.docChanged
                    ? {
                        query: old.query,
                        decos: buildDeco(newState, old.query),
                    }
                    : old;
            },
        },
        props: {
            decorations(state) {
                var _a;
                return ((_a = key.getState(state)) === null || _a === void 0 ? void 0 : _a.decos) || null;
            },
        },
    });
}
function findMatches(doc, regex, maxHighlights) {
    let results = [];
    let count = 0;
    let gRegex;
    if (regex instanceof RegExp) {
        let flags = 'g';
        if (regex.ignoreCase) {
            flags += 'i';
        }
        if (regex.multiline) {
            flags += 'm';
        }
        gRegex = RegExp(regex.source, flags);
    }
    else {
        gRegex = RegExp(regex, 'g');
    }
    doc.descendants((node, pos) => {
        if (maxHighlights <= count) {
            return false;
        }
        if (node.isText) {
            const source = node.textContent;
            const matchedResult = utils.matchAllPlus(gRegex, source);
            for (const match of matchedResult) {
                if (!match.match) {
                    continue;
                }
                if (maxHighlights <= count++) {
                    break;
                }
                results.push({
                    pos,
                    match,
                });
            }
        }
        return;
    });
    return results;
}
function updateSearchQuery(key, query) {
    return (state, dispatch, _view) => {
        if (dispatch) {
            dispatch(state.tr.setMeta(key, { query }).setMeta('addToHistory', false));
        }
        return true;
    };
}

var search = /*#__PURE__*/Object.freeze({
    __proto__: null,
    plugins: plugins,
    updateSearchQuery: updateSearchQuery
});

exports.search = search;
