import { BaseRawNodeSpec } from '@bangle.dev/core';

declare const spec: typeof specFactory;
declare function specFactory(): BaseRawNodeSpec;

declare const wikiLink_d_spec: typeof spec;
declare namespace wikiLink_d {
  export {
    wikiLink_d_spec as spec,
  };
}

declare function wikiLinkMarkdownItPlugin(md: any): void;

export { wikiLink_d as wikiLink, wikiLinkMarkdownItPlugin };
