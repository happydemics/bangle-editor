import { keymap, toggleMark } from '@bangle.dev/pm';
import { createObject, assertNotUndefined, isMarkActiveInSelection } from '@bangle.dev/utils';

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
                keymap(createObject([[keybindings.toggleSubscript, toggleSubscript()]])),
        ];
    };
}
function toggleSubscript() {
    return (state, dispatch, view) => {
        const markType = state.schema.marks[name$1];
        assertNotUndefined(markType, `markType ${name$1} not found`);
        return toggleMark(markType)(state, dispatch);
    };
}
function queryIsSubscriptActive() {
    return (state) => {
        const markType = state.schema.marks[name$1];
        assertNotUndefined(markType, `markType ${name$1} not found`);
        return isMarkActiveInSelection(markType)(state);
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
                keymap(createObject([[keybindings.toggleSuperscript, toggleSuperscript()]])),
        ];
    };
}
function toggleSuperscript() {
    return (state, dispatch, view) => {
        const type = state.schema.marks[name];
        assertNotUndefined(type, `Mark ${name} not found in schema`);
        return toggleMark(type)(state, dispatch);
    };
}
function queryIsSuperscriptActive() {
    return (state) => {
        const type = state.schema.marks[name];
        assertNotUndefined(type, `Mark ${name} not found in schema`);
        return isMarkActiveInSelection(type)(state);
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

export { subscript, superscript };
