export { default as StateCore } from 'markdown-it/lib/rules_core/state_core';
export { default as Token } from 'markdown-it/lib/token';
import markdownIt from 'markdown-it';
import { MarkdownParser, MarkdownSerializer } from 'prosemirror-markdown';
export { MarkdownSerializerState } from 'prosemirror-markdown';
import { SpecRegistry } from '@bangle.dev/core';

type GetTokenDetails = (match: string, offset: number, srcText: string) => {
    payload: string;
    markup: string;
    whiteSpaceBefore?: boolean;
    whiteSpaceAfter?: boolean;
};
/**
 * A generic markdown parser for inline nodes which can be
 * programmed to read syntax that can be parsed by a regex.
 * A good use case is something like tags ( `#xyz` ) or wiki-links ( `[xyz]` )
 *
 */
declare function inlineNodeParser(md: any, { tokenName, regex, getTokenDetails, }: {
    tokenName: string;
    regex: RegExp;
    getTokenDetails: GetTokenDetails;
}): void;

declare const getDefaultMarkdownItTokenizer: () => markdownIt;
declare function markdownParser(specRegistry?: SpecRegistry<any, any>, markdownItTokenizer?: markdownIt): MarkdownParser;

declare const markdownSerializer: (specRegistry: SpecRegistry) => MarkdownSerializer;

declare function todoListMarkdownItPlugin(md: any, options?: {
    todoListOpenType?: string;
    todoListCloseType?: string;
    todoItemCloseType?: string;
    todoItemOpenName?: string;
    isDoneAttrName?: string;
}): void;

export { GetTokenDetails, getDefaultMarkdownItTokenizer, inlineNodeParser, markdownParser, markdownSerializer, todoListMarkdownItPlugin };
