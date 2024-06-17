'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var baseComponents = require('@bangle.dev/base-components');

function defaultSpecs(opts = {}) {
    return [...coreMarkSpec(opts), ...coreNodeSpec(opts)];
}
function defaultPlugins(opts = {}) {
    return [
        ...coreMarkPlugins(opts),
        ...coreNodePlugins(opts),
        baseComponents.history.plugins(opts.history),
    ];
}
function options(options = {}) {
    return [
        ...coreMarkPlugins(options),
        ...coreNodePlugins(options),
        baseComponents.history.plugins(options.history),
    ];
}
function coreMarkSpec(options = {}) {
    return [
        options.bold !== false && baseComponents.bold.spec(options.bold),
        options.code !== false && baseComponents.code.spec(options.code),
        options.italic !== false && baseComponents.italic.spec(options.italic),
        options.strike !== false && baseComponents.strike.spec(options.strike),
        options.link !== false && baseComponents.link.spec(options.link),
        options.underline !== false && baseComponents.underline.spec(options.underline),
    ];
}
function coreMarkPlugins(options = {}) {
    return [
        options.bold !== false && baseComponents.bold.plugins(options.bold),
        options.code !== false && baseComponents.code.plugins(options.code),
        options.italic !== false && baseComponents.italic.plugins(options.italic),
        options.strike !== false && baseComponents.strike.plugins(options.strike),
        options.link !== false && baseComponents.link.plugins(options.link),
        options.underline !== false &&
            baseComponents.underline.plugins(options.underline),
    ];
}
function coreNodeSpec(options = {}) {
    return [
        options.doc !== false && baseComponents.doc.spec(options.doc),
        options.text !== false && baseComponents.text.spec(options.text),
        options.paragraph !== false && baseComponents.paragraph.spec(options.paragraph),
        options.blockquote !== false &&
            baseComponents.blockquote.spec(options.blockquote),
        options.bulletList !== false &&
            baseComponents.bulletList.spec(options.bulletList),
        options.codeBlock !== false && baseComponents.codeBlock.spec(options.codeBlock),
        options.hardBreak !== false && baseComponents.hardBreak.spec(options.hardBreak),
        options.heading !== false && baseComponents.heading.spec(options.heading),
        options.horizontalRule !== false &&
            baseComponents.horizontalRule.spec(options.horizontalRule),
        options.listItem !== false && baseComponents.listItem.spec(options.listItem),
        options.orderedList !== false &&
            baseComponents.orderedList.spec(options.orderedList),
        options.image !== false && baseComponents.image.spec(options.image),
    ];
}
function coreNodePlugins(options = {}) {
    return [
        options.paragraph !== false && baseComponents.paragraph.plugins(options.paragraph),
        options.blockquote !== false && baseComponents.blockquote.plugins(options.blockquote),
        options.bulletList !== false && baseComponents.bulletList.plugins(options.bulletList),
        options.codeBlock !== false && baseComponents.codeBlock.plugins(options.codeBlock),
        options.hardBreak !== false && baseComponents.hardBreak.plugins(options.hardBreak),
        options.heading !== false && baseComponents.heading.plugins(options.heading),
        options.horizontalRule !== false &&
            baseComponents.horizontalRule.plugins(options.horizontalRule),
        options.listItem !== false && baseComponents.listItem.plugins(options.listItem),
        options.orderedList !== false && baseComponents.orderedList.plugins(options.orderedList),
        options.image !== false && baseComponents.image.plugins(options.image),
    ];
}

exports.defaultPlugins = defaultPlugins;
exports.defaultSpecs = defaultSpecs;
exports.options = options;
