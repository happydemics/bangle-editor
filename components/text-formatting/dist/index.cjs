'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pm = require('@bangle.dev/pm');
var utils = require('@bangle.dev/utils');

const spec$1 = specFactory$1;
const plugins$1 = pluginsFactory$1;
const commands$1 = {
    toggleSubscript,
    queryIsSubscriptActive,
};
const defaultKeys$1 = {
    toggleSubscript: '',
};
const name$1 = 'subscript';
function specFactory$1(opts = {}) {
    return {
        type: 'mark',
        name: name$1,
        schema: {
            excludes: 'superscript',
            parseDOM: [{ tag: 'sub' }, { style: 'vertical-align=sub' }],
            toDOM: () => ['sub', 0],
        },
    };
}
function pluginsFactory$1({ keybindings = defaultKeys$1 } = {}) {
    return ({ schema }) => {
        return [
            keybindings &&
                pm.keymap(utils.createObject([[keybindings.toggleSubscript, toggleSubscript()]])),
        ];
    };
}
function toggleSubscript() {
    return (state, dispatch, view) => {
        const markType = state.schema.marks[name$1];
        utils.assertNotUndefined(markType, `markType ${name$1} not found`);
        return pm.toggleMark(markType)(state, dispatch);
    };
}
function queryIsSubscriptActive() {
    return (state) => {
        const markType = state.schema.marks[name$1];
        utils.assertNotUndefined(markType, `markType ${name$1} not found`);
        return utils.isMarkActiveInSelection(markType)(state);
    };
}

var subscript = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec$1,
    plugins: plugins$1,
    commands: commands$1,
    defaultKeys: defaultKeys$1,
    toggleSubscript: toggleSubscript,
    queryIsSubscriptActive: queryIsSubscriptActive
});

const spec = specFactory;
const plugins = pluginsFactory;
const commands = {
    toggleSuperscript,
    queryIsSuperscriptActive,
};
const defaultKeys = {
    toggleSuperscript: '',
};
const name = 'superscript';
function specFactory(opts = {}) {
    return {
        type: 'mark',
        name,
        schema: {
            excludes: 'subscript',
            parseDOM: [{ tag: 'sup' }, { style: 'vertical-align=super' }],
            toDOM: () => ['sup', 0],
        },
    };
}
function pluginsFactory({ keybindings = defaultKeys } = {}) {
    return ({ schema }) => {
        return [
            keybindings &&
                pm.keymap(utils.createObject([[keybindings.toggleSuperscript, toggleSuperscript()]])),
        ];
    };
}
function toggleSuperscript() {
    return (state, dispatch, view) => {
        const type = state.schema.marks[name];
        utils.assertNotUndefined(type, `Mark ${name} not found in schema`);
        return pm.toggleMark(type)(state, dispatch);
    };
}
function queryIsSuperscriptActive() {
    return (state) => {
        const type = state.schema.marks[name];
        utils.assertNotUndefined(type, `Mark ${name} not found in schema`);
        return utils.isMarkActiveInSelection(type)(state);
    };
}

var superscript = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec,
    plugins: plugins,
    commands: commands,
    defaultKeys: defaultKeys,
    toggleSuperscript: toggleSuperscript,
    queryIsSuperscriptActive: queryIsSuperscriptActive
});

exports.subscript = subscript;
exports.superscript = superscript;
