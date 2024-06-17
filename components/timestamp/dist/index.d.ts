import { RawPlugins } from '@bangle.dev/core';

declare const plugins: typeof pluginsFactory;
declare function pluginsFactory(): RawPlugins;

declare const timestamp_d_plugins: typeof plugins;
declare namespace timestamp_d {
  export {
    timestamp_d_plugins as plugins,
  };
}

export { timestamp_d as timestamp };
