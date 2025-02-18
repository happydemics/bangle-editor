/// <reference path="./missing-types.d.ts" />

import PropTypes from 'prop-types';
import React from 'react';

import {
  domSerializationHelpers,
  NodeView,
  NodeViewProps,
} from '@bangle.dev/core';
import type { Command, InputRule, Plugin, Schema } from '@bangle.dev/pm';
import { keymap, Node } from '@bangle.dev/pm';
import { getNodeType } from '@bangle.dev/utils';

export const spec = specFactory;
export const plugins = pluginsFactory;
export const commands = {
  randomSticker,
  insertSticker,
};

const name = 'sticker';
const getTypeFromSchema = (schema: any) => schema.nodes[name];

function specFactory() {
  let spec = {
    type: 'node',
    name,
    schema: {
      attrs: {
        'data-stickerkind': {
          default: 'brontosaurus',
        },
        'data-bangle-name': {
          default: name,
        },
      },
      inline: true,
      group: 'inline',
      draggable: true,
    },
    markdown: {
      toMarkdown: (state: any, node: any) => {
        state.write('sticker');
      },
    },
  };

  spec.schema = {
    ...spec.schema,
    ...domSerializationHelpers(name, { tag: 'span' }),
  };

  return spec;
}

function pluginsFactory() {
  return ({ schema }: { schema: Schema }): Array<InputRule | Plugin> => [
    keymap({
      'Ctrl-B': randomSticker(),
    }),
    NodeView.createPlugin({
      name: 'sticker',
      // inline-block allows the span to get full height of image
      // or else folks depending on the boundingBox get incorrect
      // dimensions.
      containerDOM: [
        'span',
        { style: 'display: inline-block;', class: 'bangle-sticker' },
      ],
    }),
  ];
}

export const stickerNames = [
  'brontosaurus',
  'stegosaurus',
  'triceratops',
  'tyrannosaurus',
  'pterodactyl',
];

export function randomSticker(): Command {
  return (state, dispatch) =>
    insertSticker(
      stickerNames[Math.floor(Math.random() * stickerNames.length)]!,
    )(state, dispatch);
}

export function insertSticker(stickerName: string): Command {
  return (state, dispatch) => {
    const stickerType = getTypeFromSchema(state.schema);
    let { $from } = state.selection;
    let index = $from.index();

    if (!$from.parent.canReplaceWith(index, index, stickerType)) {
      return false;
    }

    if (dispatch) {
      const attr = {
        'data-stickerkind': stickerName,
      };

      dispatch(state.tr.replaceSelectionWith(stickerType.create(attr)));
    }
    return true;
  };
}

const DINO_IMAGES = {
  brontosaurus: 'https://prosemirror.net/img/dino/brontosaurus.png',
  stegosaurus: 'https://prosemirror.net/img/dino/stegosaurus.png',
  triceratops: 'https://prosemirror.net/img/dino/triceratops.png',
  tyrannosaurus: 'https://prosemirror.net/img/dino/tyrannosaurus.png',
  pterodactyl: 'https://prosemirror.net/img/dino/pterodactyl.png',
};

// no children for this type
export function Sticker({ selected, node }: NodeViewProps) {
  const nodeAttrs = node.attrs;
  const selectedStyle = selected ? { border: '4px solid pink' } : {};
  const val: keyof typeof DINO_IMAGES = nodeAttrs['data-stickerkind'];

  return (
    <img
      className={`${selected ? 'bangle-selected' : ''}`}
      style={{
        display: 'inline',
        height: 64,
        verticalAlign: 'bottom',
        border: '1px solid #0ae',
        borderRadius: 4,
        background: '#ddf6ff',
        ...selectedStyle,
      }}
      src={DINO_IMAGES[val]}
      alt={val}
    />
  );
}

Sticker.propTypes = {
  selected: PropTypes.bool.isRequired,
  node: PropTypes.instanceOf(Node).isRequired,
};
