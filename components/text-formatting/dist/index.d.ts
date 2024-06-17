import { BaseRawMarkSpec, RawPlugins } from '@bangle.dev/core';
import { Command } from '@bangle.dev/pm';

declare const spec$1: typeof specFactory$1;
declare const plugins$1: typeof pluginsFactory$1;
declare const commands$1: {
    toggleSubscript: typeof toggleSubscript;
    queryIsSubscriptActive: typeof queryIsSubscriptActive;
};
declare const defaultKeys$1: {
    toggleSubscript: string;
};
declare function specFactory$1(opts?: {}): BaseRawMarkSpec;
declare function pluginsFactory$1({ keybindings }?: {
    keybindings?: {
        toggleSubscript: string;
    } | undefined;
}): RawPlugins;
declare function toggleSubscript(): Command;
declare function queryIsSubscriptActive(): Command;

declare const subscript_d_toggleSubscript: typeof toggleSubscript;
declare const subscript_d_queryIsSubscriptActive: typeof queryIsSubscriptActive;
declare namespace subscript_d {
  export {
    spec$1 as spec,
    plugins$1 as plugins,
    commands$1 as commands,
    defaultKeys$1 as defaultKeys,
    subscript_d_toggleSubscript as toggleSubscript,
    subscript_d_queryIsSubscriptActive as queryIsSubscriptActive,
  };
}

declare const spec: typeof specFactory;
declare const plugins: typeof pluginsFactory;
declare const commands: {
    toggleSuperscript: typeof toggleSuperscript;
    queryIsSuperscriptActive: typeof queryIsSuperscriptActive;
};
declare const defaultKeys: {
    toggleSuperscript: string;
};
declare function specFactory(opts?: {}): BaseRawMarkSpec;
declare function pluginsFactory({ keybindings }?: {
    keybindings?: {
        toggleSuperscript: string;
    } | undefined;
}): RawPlugins;
declare function toggleSuperscript(): Command;
declare function queryIsSuperscriptActive(): Command;

declare const superscript_d_spec: typeof spec;
declare const superscript_d_plugins: typeof plugins;
declare const superscript_d_commands: typeof commands;
declare const superscript_d_defaultKeys: typeof defaultKeys;
declare const superscript_d_toggleSuperscript: typeof toggleSuperscript;
declare const superscript_d_queryIsSuperscriptActive: typeof queryIsSuperscriptActive;
declare namespace superscript_d {
  export {
    superscript_d_spec as spec,
    superscript_d_plugins as plugins,
    superscript_d_commands as commands,
    superscript_d_defaultKeys as defaultKeys,
    superscript_d_toggleSuperscript as toggleSuperscript,
    superscript_d_queryIsSuperscriptActive as queryIsSuperscriptActive,
  };
}

export { subscript_d as subscript, superscript_d as superscript };
