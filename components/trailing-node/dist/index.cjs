'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pm = require('@bangle.dev/pm');
var utils = require('@bangle.dev/utils');

const plugins = pluginsFactory;
const name = 'trailing_node_addon';
// TODO can we move this to appendTransaction ?
function pluginsFactory({ node = 'paragraph', notAfter = ['paragraph'], } = {}) {
    const plugin = new pm.PluginKey(name);
    return ({ schema }) => {
        const disabledNodes = Object.entries(schema.nodes)
            .map(([, value]) => value)
            .filter((node) => notAfter.includes(node.name));
        const map = new WeakMap();
        return [
            new pm.Plugin({
                key: plugin,
                view: () => ({
                    update: (view) => {
                        const { state } = view;
                        const { incorrectNodeAtEnd } = plugin.getState(state);
                        if (!incorrectNodeAtEnd) {
                            return;
                        }
                        // TODO For some reason (unknown bug) this keeps getting called
                        // with the same state, to prevent that, I have added this quick hack
                        // And I have only seen it happen when loading md files
                        if (map.has(view.state)) {
                            return;
                        }
                        const { doc, schema, tr } = view.state;
                        const type = schema.nodes[node];
                        utils.assertNotUndefined(type, `Node ${node} not found in schema`);
                        const transaction = tr.insert(doc.content.size, type.create());
                        map.set(view.state, true);
                        view.dispatch(transaction);
                    },
                }),
                state: {
                    init: (_, state) => {
                        const lastChild = state.tr.doc.lastChild;
                        return {
                            incorrectNodeAtEnd: lastChild
                                ? !disabledNodes.includes(lastChild.type)
                                : false,
                        };
                    },
                    apply: (tr, value) => {
                        if (!tr.docChanged) {
                            return value;
                        }
                        const lastChild = tr.doc.lastChild;
                        return {
                            incorrectNodeAtEnd: lastChild
                                ? !disabledNodes.includes(lastChild.type)
                                : false,
                        };
                    },
                },
            }),
        ];
    };
}

var trailingNode = /*#__PURE__*/Object.freeze({
    __proto__: null,
    plugins: plugins
});

exports.trailingNode = trailingNode;
