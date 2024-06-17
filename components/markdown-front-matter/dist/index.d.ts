import { BaseRawNodeSpec } from '@bangle.dev/core';

declare const spec: typeof specFactory;
declare function specFactory(): BaseRawNodeSpec;

declare const markdownFrontMatter_d_spec: typeof spec;
declare namespace markdownFrontMatter_d {
  export {
    markdownFrontMatter_d_spec as spec,
  };
}

declare function frontMatterPlugin(md: any, cb?: (arg: any) => void): void;

export { frontMatterPlugin as frontMatterMarkdownItPlugin, markdownFrontMatter_d as markdownFrontMatter };
