import { RawSpecs } from '@bangle.dev/core';
import { Node, Command } from '@bangle.dev/pm';

declare const spec: typeof specFactory;
declare const plugins: typeof pluginsFactory;
declare const commands: {
    insertEmoji: typeof insertEmoji;
};
declare function specFactory({ getEmoji, defaultEmojiAlias, }: {
    getEmoji: (alias: string, node: Node) => string;
    defaultEmojiAlias?: string;
}): RawSpecs;
declare function pluginsFactory({ keybindings }?: {
    keybindings?: {} | undefined;
}): () => never[];
declare function insertEmoji(emojiAlias: string): Command;

declare const emoji_d_spec: typeof spec;
declare const emoji_d_plugins: typeof plugins;
declare const emoji_d_commands: typeof commands;
declare const emoji_d_insertEmoji: typeof insertEmoji;
declare namespace emoji_d {
  export {
    emoji_d_spec as spec,
    emoji_d_plugins as plugins,
    emoji_d_commands as commands,
    emoji_d_insertEmoji as insertEmoji,
  };
}

export { emoji_d as emoji };
