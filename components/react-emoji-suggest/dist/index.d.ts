import { BaseRawMarkSpec, SpecRegistry } from '@bangle.dev/core';
import { PluginKey, Schema, InputRule, Plugin, EditorState, Command, EditorView } from '@bangle.dev/pm';
import { SuggestTooltipRenderOpts } from '@bangle.dev/tooltip';
import React from 'react';

type EmojiType = [string, string];
type EmojisArray = EmojiType[];
type EmojiGroupType = {
    name: string;
    emojis: EmojisArray;
}[];

declare const spec: typeof specFactory;
declare const plugins: typeof pluginsFactory;
declare const commands: {
    queryTriggerText: typeof queryTriggerText;
    selectEmoji: typeof selectEmoji;
};
declare function specFactory({ markName, trigger, }: {
    markName: string;
    trigger?: string;
}): BaseRawMarkSpec;
type GetEmojiGroupsType = (queryText: string) => EmojiGroupType;
declare function pluginsFactory({ key, markName, tooltipRenderOpts, getEmojiGroups, maxItems, squareSide, squareMargin, rowWidth, }: {
    markName: string;
    key?: PluginKey;
    tooltipRenderOpts?: SuggestTooltipRenderOpts;
    getEmojiGroups: GetEmojiGroupsType;
    maxItems?: number;
    squareSide?: number;
    squareMargin?: number;
    rowWidth?: number;
}): ({ schema, specRegistry, }: {
    schema: Schema;
    specRegistry: SpecRegistry;
}) => Array<InputRule | Plugin>;
declare function getSuggestTooltipKey(key: PluginKey): (state: EditorState) => PluginKey<any>;
/** Commands */
declare function queryTriggerText(key: PluginKey): (state: EditorState) => string;
declare function selectEmoji(key: PluginKey, emojiAlias: string): Command;

declare const emojiSuggest_d_spec: typeof spec;
declare const emojiSuggest_d_plugins: typeof plugins;
declare const emojiSuggest_d_commands: typeof commands;
type emojiSuggest_d_GetEmojiGroupsType = GetEmojiGroupsType;
declare const emojiSuggest_d_getSuggestTooltipKey: typeof getSuggestTooltipKey;
declare const emojiSuggest_d_queryTriggerText: typeof queryTriggerText;
declare const emojiSuggest_d_selectEmoji: typeof selectEmoji;
declare namespace emojiSuggest_d {
  export {
    emojiSuggest_d_spec as spec,
    emojiSuggest_d_plugins as plugins,
    emojiSuggest_d_commands as commands,
    emojiSuggest_d_GetEmojiGroupsType as GetEmojiGroupsType,
    emojiSuggest_d_getSuggestTooltipKey as getSuggestTooltipKey,
    emojiSuggest_d_queryTriggerText as queryTriggerText,
    emojiSuggest_d_selectEmoji as selectEmoji,
  };
}

declare function EmojiSuggest({ emojiSuggestKey, }: {
    emojiSuggestKey: PluginKey;
}): React.ReactPortal;
declare function EmojiSuggestContainer({ view, rowWidth, squareMargin, squareSide, emojiSuggestKey, getEmojiGroups, triggerText, counter, selectedEmojiSquareId, maxItems, }: {
    view: EditorView;
    rowWidth: number;
    squareMargin: number;
    squareSide: number;
    emojiSuggestKey: PluginKey;
    getEmojiGroups: GetEmojiGroupsType;
    triggerText: string;
    counter: number;
    selectedEmojiSquareId: string;
    maxItems: number;
}): React.JSX.Element;

declare function resolveCounter(counter: number, namedGroups: EmojiGroupType): {
    item: undefined;
    coords: undefined;
} | {
    item: EmojiType;
    coords: number[];
};
/**
 * Helps calculate the position resulting from a jump between rows
 * @returns a new counter
 */
declare function resolveRowJump(counter: number, direction: number | undefined, jump: number, namedGroups: EmojiGroupType): number | null;
declare function getSquareDimensions({ rowWidth, squareMargin, squareSide, }: {
    rowWidth: number;
    squareMargin: number;
    squareSide: number;
}): {
    containerWidth: number;
    rowCount: number;
};

export { EmojiSuggest, EmojiSuggestContainer, GetEmojiGroupsType, emojiSuggest_d as emojiSuggest, getSquareDimensions, resolveCounter, resolveRowJump, selectEmoji };
