'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var PropTypes = require('prop-types');
var React = require('react');
var core = require('@bangle.dev/core');
var pm = require('@bangle.dev/pm');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var PropTypes__default = /*#__PURE__*/_interopDefaultLegacy(PropTypes);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

/**
<reference path="./missing-types.d.ts" />
*/
const spec = specFactory;
const plugins = pluginsFactory;
const commands = {
    randomSticker,
    insertSticker,
};
const name = 'sticker';
const getTypeFromSchema = (schema) => schema.nodes[name];
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
            toMarkdown: (state, node) => {
                state.write('sticker');
            },
        },
    };
    spec.schema = {
        ...spec.schema,
        ...core.domSerializationHelpers(name, { tag: 'span' }),
    };
    return spec;
}
function pluginsFactory() {
    return ({ schema }) => [
        pm.keymap({
            'Ctrl-B': randomSticker(),
        }),
        core.NodeView.createPlugin({
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
const stickerNames = [
    'brontosaurus',
    'stegosaurus',
    'triceratops',
    'tyrannosaurus',
    'pterodactyl',
];
function randomSticker() {
    return (state, dispatch) => insertSticker(stickerNames[Math.floor(Math.random() * stickerNames.length)])(state, dispatch);
}
function insertSticker(stickerName) {
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
function Sticker({ selected, node }) {
    const nodeAttrs = node.attrs;
    const selectedStyle = selected ? { border: '4px solid pink' } : {};
    const val = nodeAttrs['data-stickerkind'];
    return (React__default["default"].createElement("img", { className: `${selected ? 'bangle-selected' : ''}`, style: {
            display: 'inline',
            height: 64,
            verticalAlign: 'bottom',
            border: '1px solid #0ae',
            borderRadius: 4,
            background: '#ddf6ff',
            ...selectedStyle,
        }, src: DINO_IMAGES[val], alt: val }));
}
Sticker.propTypes = {
    selected: PropTypes__default["default"].bool.isRequired,
    node: PropTypes__default["default"].instanceOf(pm.Node).isRequired,
};

var sticker = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec,
    plugins: plugins,
    commands: commands,
    stickerNames: stickerNames,
    randomSticker: randomSticker,
    insertSticker: insertSticker,
    Sticker: Sticker
});

exports.sticker = sticker;
