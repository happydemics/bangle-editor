import { PluginKey } from '@bangle.dev/pm';
import { suggestTooltip, createTooltipDOM } from '@bangle.dev/tooltip';
import { bangleWarn, uuid, valuePlugin, rafCommandExec, getNodeType } from '@bangle.dev/utils';
import React, { useMemo, useCallback } from 'react';
import reactDOM from 'react-dom';
import { useEditorViewContext, usePluginState } from '@bangle.dev/react';

const emptyValue = { item: undefined, coords: undefined };
/**
 * Converted 2d coordinates in a flat 1d integer referred everywhere as counter.
 */
function coordsToCounter(coords, namedGroups) {
    const groups = flattenEmojiGroups(namedGroups);
    let counter = 0;
    for (let i = 0; i < coords[0]; i++) {
        counter += groups[i].length;
    }
    counter += coords[1];
    return counter;
}
function counterToCoords(counter, namedGroups) {
    const groups = flattenEmojiGroups(namedGroups);
    let normalizedCounter = normalizeCounter(counter, groups);
    if (normalizedCounter == null) {
        return;
    }
    for (let i = 0; i < groups.length; i++) {
        const size = groups[i].length;
        if (normalizedCounter < size) {
            return [i, normalizedCounter];
        }
        normalizedCounter = normalizedCounter - size;
    }
    return;
}
function resolveCounter(counter, namedGroups) {
    const coords = counterToCoords(counter, namedGroups);
    if (!coords) {
        return emptyValue;
    }
    const groups = flattenEmojiGroups(namedGroups);
    return { item: groups[coords[0]][coords[1]], coords: coords };
}
/**
 * Helps calculate the position resulting from a jump between rows
 * @returns a new counter
 */
function resolveRowJump(counter, direction = 1, jump, namedGroups) {
    const { coords } = jumpRow(counter, direction, jump, namedGroups);
    if (coords == null) {
        return null;
    }
    return coordsToCounter(coords, namedGroups);
}
function getNextGroup(groupIndex, groups, direction = 1) {
    let newIndex = groupIndex + direction;
    if (groups.length === 0) {
        return;
    }
    while (newIndex < 0) {
        newIndex += groups.length;
    }
    newIndex = newIndex % groups.length;
    return newIndex;
}
function getSquareDimensions({ rowWidth, squareMargin, squareSide, }) {
    const squareFullWidth = squareSide + 2 * squareMargin;
    // -2 to account for borders and safety
    const rowCount = Math.floor((rowWidth - 2) / squareFullWidth);
    const containerWidth = rowCount * squareFullWidth;
    return {
        containerWidth,
        rowCount,
    };
}
function jumpRow(counter, direction = 1, jump, namedGroups) {
    const coords = counterToCoords(counter, namedGroups);
    if (!coords) {
        return emptyValue;
    }
    const groups = flattenEmojiGroups(namedGroups);
    const groupIndex = coords[0];
    const itemIndex = coords[1];
    const groupSize = groups[groupIndex].length;
    const newIndex = direction === 1 ? itemIndex + jump : itemIndex - jump;
    if (newIndex < groupSize && newIndex >= 0) {
        return {
            item: groups[groupIndex][newIndex],
            coords: [groupIndex, newIndex],
        };
    }
    const nextGroupIndex = getNextGroup(groupIndex, groups, newIndex >= groupSize ? 1 : -1);
    if (nextGroupIndex == null) {
        return emptyValue;
    }
    const nextGroup = groups[nextGroupIndex];
    const nextItemIndex = direction === 1 ? 0 : nextGroup.length - 1;
    const item = nextGroup[nextItemIndex];
    if (item == null) {
        return emptyValue;
    }
    return {
        item,
        coords: [nextGroupIndex, nextItemIndex],
    };
}
function flattenEmojiGroups(namedGroups) {
    return namedGroups.map((r) => r.emojis);
}
function normalizeCounter(counter, groups) {
    const totalSize = groups.reduce((prev, cur) => prev + cur.length, 0);
    if (totalSize === 0) {
        return;
    }
    while (counter < 0) {
        counter += totalSize;
    }
    counter = counter % totalSize;
    return counter;
}

const { decrementSuggestTooltipCounter, incrementSuggestTooltipCounter, updateSuggestTooltipCounter, removeSuggestMark, resetSuggestTooltipCounter, defaultKeys, } = suggestTooltip;
const spec = specFactory;
const plugins = pluginsFactory;
const commands = {
    queryTriggerText,
    selectEmoji,
};
const defaultTrigger = ':';
const defaultMaxItems = 2000;
function specFactory({ markName, trigger = defaultTrigger, }) {
    const spec = suggestTooltip.spec({ markName, trigger });
    return {
        ...spec,
        options: {
            trigger,
        },
    };
}
function pluginsFactory({ key = new PluginKey('emojiSuggestMenu'), markName, tooltipRenderOpts = {}, getEmojiGroups, maxItems = defaultMaxItems, squareSide = 32, squareMargin = 2, rowWidth = 400, }) {
    return ({ schema, specRegistry, }) => {
        const { trigger } = specRegistry.options[markName];
        const suggestTooltipKey = new PluginKey('suggestTooltipKey');
        // We are converting to DOM elements so that their instances
        // can be shared across plugins.
        const tooltipDOMSpec = createTooltipDOM(tooltipRenderOpts.tooltipDOMSpec);
        const getIsTop = () => tooltipDOMSpec.dom.getAttribute('data-popper-placement') === 'top-start';
        if (!schema.marks[markName]) {
            bangleWarn(`Couldn't find the markName:${markName}, please make sure you have initialized to use the same markName you initialized the spec with`);
            throw new Error(`markName ${markName} not found`);
        }
        const selectedEmojiSquareId = uuid(6);
        const updateCounter = (keyType) => {
            return (state, dispatch, view) => {
                requestAnimationFrame(() => {
                    const selectedEmoji = document.getElementById(selectedEmojiSquareId);
                    if (selectedEmoji) {
                        if ('scrollIntoViewIfNeeded' in document.body) {
                            selectedEmoji.scrollIntoViewIfNeeded(false);
                        }
                        else if (selectedEmoji.scrollIntoView) {
                            selectedEmoji.scrollIntoView(false);
                        }
                    }
                    view === null || view === void 0 ? void 0 : view.focus();
                });
                if (keyType === 'LEFT') {
                    return decrementSuggestTooltipCounter(suggestTooltipKey)(state, dispatch, view);
                }
                if (keyType === 'RIGHT') {
                    return incrementSuggestTooltipCounter(suggestTooltipKey)(state, dispatch, view);
                }
                const goUp = keyType === 'UP' ? !getIsTop() : getIsTop();
                const namedEmojiGroups = getEmojiGroups(queryTriggerText(key)(state));
                const { counter } = suggestTooltipKey.getState(state);
                const { rowCount } = getSquareDimensions({
                    rowWidth,
                    squareMargin,
                    squareSide,
                });
                const newCounter = resolveRowJump(counter, goUp ? -1 : 1, rowCount, namedEmojiGroups);
                if (newCounter == null) {
                    return false;
                }
                return updateSuggestTooltipCounter(suggestTooltipKey, newCounter)(state, dispatch, view);
            };
        };
        return [
            valuePlugin(key, {
                getEmojiGroups,
                maxItems,
                tooltipContentDOM: tooltipDOMSpec.contentDOM,
                markName,
                squareSide,
                squareMargin,
                selectedEmojiSquareId,
                rowWidth,
                suggestTooltipKey,
            }),
            // @ts-ignore
            suggestTooltip.plugins({
                key: suggestTooltipKey,
                markName,
                trigger,
                tooltipRenderOpts: {
                    ...tooltipRenderOpts,
                    tooltipDOMSpec,
                },
                keybindings: {
                    ...defaultKeys,
                    left: 'ArrowLeft',
                    right: 'ArrowRight',
                },
                onEnter: (state, dispatch, view) => {
                    const emojiGroups = getEmojiGroups(queryTriggerText(key)(state));
                    const matchedEmojis = emojiGroups.flatMap((r) => r.emojis);
                    if (matchedEmojis.length === 0) {
                        return removeSuggestMark(key)(state, dispatch, view);
                    }
                    const { counter } = suggestTooltipKey.getState(state);
                    const { item: activeItem } = resolveCounter(counter, emojiGroups);
                    if (!activeItem) {
                        return removeSuggestMark(key)(state, dispatch, view);
                    }
                    const emojiAlias = activeItem[0];
                    view &&
                        rafCommandExec(view, resetSuggestTooltipCounter(suggestTooltipKey));
                    return selectEmoji(key, emojiAlias)(state, dispatch, view);
                },
                onArrowDown: updateCounter('DOWN'),
                onArrowUp: updateCounter('UP'),
                onArrowLeft: updateCounter('LEFT'),
                onArrowRight: updateCounter('RIGHT'),
            }),
        ];
    };
}
function getSuggestTooltipKey(key) {
    return (state) => {
        return key.getState(state).suggestTooltipKey;
    };
}
/** Commands */
function queryTriggerText(key) {
    return (state) => {
        const suggestKey = getSuggestTooltipKey(key)(state);
        return suggestTooltip.queryTriggerText(suggestKey)(state);
    };
}
function selectEmoji(key, emojiAlias) {
    return (state, dispatch, view) => {
        const emojiNode = getNodeType(state, 'emoji').create({
            emojiAlias: emojiAlias,
        });
        const suggestKey = getSuggestTooltipKey(key)(state);
        return suggestTooltip.replaceSuggestMarkWith(suggestKey, emojiNode)(state, dispatch, view);
    };
}

var emojiSuggest = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec,
    plugins: plugins,
    commands: commands,
    getSuggestTooltipKey: getSuggestTooltipKey,
    queryTriggerText: queryTriggerText,
    selectEmoji: selectEmoji
});

function EmojiSuggest({ emojiSuggestKey, }) {
    const view = useEditorViewContext();
    const { tooltipContentDOM, getEmojiGroups, maxItems, squareSide, squareMargin, rowWidth, selectedEmojiSquareId, suggestTooltipKey, } = usePluginState(emojiSuggestKey);
    const { counter, triggerText, show: isVisible, } = usePluginState(suggestTooltipKey);
    return reactDOM.createPortal(React.createElement("div", { className: "bangle-emoji-suggest" },
        React.createElement("div", { style: {
                width: rowWidth,
                display: 'flex',
                justifyContent: 'center',
            } }, isVisible && (React.createElement(EmojiSuggestContainer, { view: view, rowWidth: rowWidth, squareMargin: squareMargin, squareSide: squareSide, maxItems: maxItems, emojiSuggestKey: emojiSuggestKey, getEmojiGroups: getEmojiGroups, triggerText: triggerText, counter: counter, selectedEmojiSquareId: selectedEmojiSquareId })))), tooltipContentDOM);
}
function EmojiSuggestContainer({ view, rowWidth, squareMargin, squareSide, emojiSuggestKey, getEmojiGroups, triggerText, counter, selectedEmojiSquareId, maxItems, }) {
    const emojiGroups = useMemo(() => getEmojiGroups(triggerText), [getEmojiGroups, triggerText]);
    const { containerWidth } = getSquareDimensions({
        rowWidth,
        squareMargin,
        squareSide,
    });
    const { item: activeItem } = resolveCounter(counter, emojiGroups);
    const onSelectEmoji = useCallback((emojiAlias) => {
        selectEmoji(emojiSuggestKey, emojiAlias)(view.state, view.dispatch, view);
    }, [view, emojiSuggestKey]);
    return (React.createElement("div", { className: "bangle-emoji-suggest-container", style: {
            width: containerWidth,
        } }, emojiGroups.map(({ name: groupName, emojis }, i) => {
        return (React.createElement("div", { className: "bangle-emoji-suggest-group", key: groupName || i },
            groupName && React.createElement("span", null, groupName),
            React.createElement("div", null, emojis.slice(0, maxItems).map(([emojiAlias, emoji]) => (React.createElement(EmojiSquare, { key: emojiAlias, isSelected: (activeItem === null || activeItem === void 0 ? void 0 : activeItem[0]) === emojiAlias, emoji: emoji, emojiAlias: emojiAlias, onSelectEmoji: onSelectEmoji, selectedEmojiSquareId: selectedEmojiSquareId, style: {
                    margin: squareMargin,
                    width: squareSide,
                    height: squareSide,
                    lineHeight: squareSide + 'px',
                    fontSize: Math.max(squareSide - 7, 4),
                } }))))));
    })));
}
function EmojiSquare({ isSelected, emoji, emojiAlias, onSelectEmoji, style, selectedEmojiSquareId, }) {
    return (React.createElement("button", { className: `bangle-emoji-square ${isSelected ? 'bangle-is-selected' : ''}`, id: isSelected ? selectedEmojiSquareId : undefined, onClick: (e) => {
            e.preventDefault();
            onSelectEmoji(emojiAlias);
        }, style: style }, emoji));
}

export { EmojiSuggest, EmojiSuggestContainer, emojiSuggest, getSquareDimensions, resolveCounter, resolveRowJump, selectEmoji };
