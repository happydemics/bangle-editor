import PropTypes from 'prop-types';
import React from 'react';
import { NodeViewProps } from '@bangle.dev/core';
import { Schema, InputRule, Plugin, Command, Node } from '@bangle.dev/pm';

/**
<reference path="./missing-types.d.ts" />
*/

declare const spec: typeof specFactory;
declare const plugins: typeof pluginsFactory;
declare const commands: {
    randomSticker: typeof randomSticker;
    insertSticker: typeof insertSticker;
};
declare function specFactory(): {
    type: string;
    name: string;
    schema: {
        attrs: {
            'data-stickerkind': {
                default: string;
            };
            'data-bangle-name': {
                default: string;
            };
        };
        inline: boolean;
        group: string;
        draggable: boolean;
    };
    markdown: {
        toMarkdown: (state: any, node: any) => void;
    };
};
declare function pluginsFactory(): ({ schema }: {
    schema: Schema;
}) => Array<InputRule | Plugin>;
declare const stickerNames: string[];
declare function randomSticker(): Command;
declare function insertSticker(stickerName: string): Command;
declare function Sticker({ selected, node }: NodeViewProps): React.JSX.Element;
declare namespace Sticker {
    var propTypes: {
        selected: PropTypes.Validator<boolean>;
        node: PropTypes.Validator<Node>;
    };
}

declare const sticker_d_spec: typeof spec;
declare const sticker_d_plugins: typeof plugins;
declare const sticker_d_commands: typeof commands;
declare const sticker_d_stickerNames: typeof stickerNames;
declare const sticker_d_randomSticker: typeof randomSticker;
declare const sticker_d_insertSticker: typeof insertSticker;
declare const sticker_d_Sticker: typeof Sticker;
declare namespace sticker_d {
  export {
    sticker_d_spec as spec,
    sticker_d_plugins as plugins,
    sticker_d_commands as commands,
    sticker_d_stickerNames as stickerNames,
    sticker_d_randomSticker as randomSticker,
    sticker_d_insertSticker as insertSticker,
    sticker_d_Sticker as Sticker,
  };
}

export { sticker_d as sticker };
