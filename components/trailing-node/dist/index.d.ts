import { RawPlugins } from '@bangle.dev/core';

declare const plugins: typeof pluginsFactory;
declare function pluginsFactory({ node, notAfter, }?: {
    node?: string | undefined;
    notAfter?: string[] | undefined;
}): RawPlugins;

declare const trailingNode_d_plugins: typeof plugins;
declare namespace trailingNode_d {
  export {
    trailingNode_d_plugins as plugins,
  };
}

export { trailingNode_d as trailingNode };
