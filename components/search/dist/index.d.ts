import { RawPlugins } from '@bangle.dev/core';
import { PluginKey, DecorationSet, Command } from '@bangle.dev/pm';

declare const plugins: typeof pluginsFactory;
declare function pluginsFactory({ key, query: initialQuery, className, maxHighlights, }: {
    key: PluginKey<{
        query: string;
        decos: DecorationSet;
    }>;
    query?: RegExp | string;
    className?: string;
    maxHighlights?: number;
}): RawPlugins;
declare function updateSearchQuery(key: PluginKey, query?: RegExp | string): Command;

declare const search_d_plugins: typeof plugins;
declare const search_d_updateSearchQuery: typeof updateSearchQuery;
declare namespace search_d {
  export {
    search_d_plugins as plugins,
    search_d_updateSearchQuery as updateSearchQuery,
  };
}

export { search_d as search };
