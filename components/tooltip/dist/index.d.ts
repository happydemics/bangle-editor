import { EditorView, DOMOutputSpec, EditorState, PluginKey, Plugin as Plugin$1, Command, Schema, Node, Fragment } from '@bangle.dev/pm';
import { VirtualElement, Placement, State, Modifier } from '@popperjs/core';
import { Plugin, BaseRawMarkSpec } from '@bangle.dev/core';

declare const plugins$2: typeof tooltipPlacement;
type TooltipCallbackFunction = (state: EditorState, dispatch: any, view: EditorView) => any;
type ModifierList = Modifier<any, any>[];
type GetReferenceElementFunction = (view: EditorView, tooltipDOM: HTMLElement, scrollContainerDOM: HTMLElement) => VirtualElement;
interface TooltipRenderOpts {
    tooltipDOMSpec?: DOMOutputSpec;
    placement?: Placement;
    getReferenceElement: GetReferenceElementFunction;
    getScrollContainer?: (view: EditorView) => HTMLElement;
    onUpdateTooltip?: TooltipCallbackFunction;
    onHideTooltip?: TooltipCallbackFunction;
    tooltipOffset?: (state: State) => [number, number];
    fallbackPlacements?: [Placement, Placement];
    customPopperModifiers?: (view: EditorView, tooltipDOM: HTMLElement, scrollContainerDOM: HTMLElement, defaultModifiers: ModifierList) => ModifierList;
}
interface TooltipPlacementOptions {
    stateKey: PluginKey;
    renderOpts: TooltipRenderOpts;
}
declare function tooltipPlacement({ stateKey, renderOpts: { tooltipDOMSpec, placement, getReferenceElement, getScrollContainer, onUpdateTooltip, onHideTooltip, tooltipOffset, fallbackPlacements, customPopperModifiers, }, }: TooltipPlacementOptions): Plugin<any>;

type tooltipPlacement_d_GetReferenceElementFunction = GetReferenceElementFunction;
type tooltipPlacement_d_TooltipRenderOpts = TooltipRenderOpts;
declare namespace tooltipPlacement_d {
  export {
    plugins$2 as plugins,
    tooltipPlacement_d_GetReferenceElementFunction as GetReferenceElementFunction,
    tooltipPlacement_d_TooltipRenderOpts as TooltipRenderOpts,
  };
}

declare const plugins$1: typeof selectionTooltip;
declare const commands$1: {
    updateSelectionTooltipType: typeof updateSelectionTooltipType;
    hideSelectionTooltip: typeof hideSelectionTooltip;
    queryIsSelectionTooltipActive: typeof queryIsSelectionTooltipActive;
    querySelectionTooltipType: typeof querySelectionTooltipType;
};
type SelectionType = string | null;
type CalculateTypeFunction = (state: EditorState, prevType: SelectionType) => SelectionType;
interface SelectionTooltipProps {
    key?: PluginKey;
    calculateType?: CalculateTypeFunction;
    tooltipRenderOpts?: Omit<TooltipRenderOpts, 'getReferenceElement'>;
}
declare function selectionTooltip({ key, calculateType, tooltipRenderOpts, }: SelectionTooltipProps): () => Plugin$1<any>[];
interface SelectionTooltipStateType {
    type: string | null;
    tooltipContentDOM: HTMLElement;
    show: boolean;
    calculateType: CalculateTypeFunction;
}
declare function _syncTooltipOnUpdate(key: PluginKey<SelectionTooltipStateType>): Command;
/** Commands  */
declare function updateSelectionTooltipType(key: PluginKey, type: SelectionType): Command;
declare function hideSelectionTooltip(key: PluginKey): Command;
declare function queryIsSelectionTooltipActive(key: PluginKey): (state: EditorState) => boolean;
declare function querySelectionTooltipType(key: PluginKey): (state: EditorState) => any;

type selectionTooltip_d_SelectionTooltipProps = SelectionTooltipProps;
declare const selectionTooltip_d__syncTooltipOnUpdate: typeof _syncTooltipOnUpdate;
declare const selectionTooltip_d_updateSelectionTooltipType: typeof updateSelectionTooltipType;
declare const selectionTooltip_d_hideSelectionTooltip: typeof hideSelectionTooltip;
declare const selectionTooltip_d_queryIsSelectionTooltipActive: typeof queryIsSelectionTooltipActive;
declare const selectionTooltip_d_querySelectionTooltipType: typeof querySelectionTooltipType;
declare namespace selectionTooltip_d {
  export {
    plugins$1 as plugins,
    commands$1 as commands,
    selectionTooltip_d_SelectionTooltipProps as SelectionTooltipProps,
    selectionTooltip_d__syncTooltipOnUpdate as _syncTooltipOnUpdate,
    selectionTooltip_d_updateSelectionTooltipType as updateSelectionTooltipType,
    selectionTooltip_d_hideSelectionTooltip as hideSelectionTooltip,
    selectionTooltip_d_queryIsSelectionTooltipActive as queryIsSelectionTooltipActive,
    selectionTooltip_d_querySelectionTooltipType as querySelectionTooltipType,
  };
}

declare const spec: typeof specFactory;
declare const plugins: typeof pluginsFactory;
declare const commands: {
    queryTriggerText: typeof queryTriggerText;
    queryIsSuggestTooltipActive: typeof queryIsSuggestTooltipActive;
    replaceSuggestMarkWith: typeof replaceSuggestMarkWith;
    incrementSuggestTooltipCounter: typeof incrementSuggestTooltipCounter;
    decrementSuggestTooltipCounter: typeof decrementSuggestTooltipCounter;
    resetSuggestTooltipCounter: typeof resetSuggestTooltipCounter;
};
declare const defaultKeys: {
    select: string;
    up: string;
    down: string;
    hide: string;
    right: undefined;
    left: undefined;
};
declare function specFactory({ markName, trigger, markColor, }: {
    markName: string;
    trigger: string;
    markColor?: string;
}): BaseRawMarkSpec;
type SuggestTooltipRenderOpts = Omit<TooltipRenderOpts, 'getReferenceElement'>;
interface PluginsOptions {
    key?: PluginKey;
    markName: string;
    trigger: string;
    tooltipRenderOpts: SuggestTooltipRenderOpts;
    keybindings?: any;
    onEnter?: Command;
    onArrowDown?: Command;
    onArrowUp?: Command;
    onEscape?: Command;
    onArrowLeft?: Command;
    onArrowRight?: Command;
}
declare function pluginsFactory({ key, markName, trigger, tooltipRenderOpts, keybindings, onEnter, onArrowDown, onArrowUp, onEscape, onArrowLeft, onArrowRight, }: PluginsOptions): ({ schema }: {
    schema: Schema;
}) => any[];
/** Commands */
declare function queryTriggerText(key: PluginKey): (state: EditorState) => string;
declare function queryIsSuggestTooltipActive(key: PluginKey): (state: EditorState) => any;
declare function replaceSuggestMarkWith(key: PluginKey, maybeNode?: string | Node | Fragment): Command;
declare function removeSuggestMark(key: PluginKey): Command;
declare function incrementSuggestTooltipCounter(key: PluginKey): Command;
declare function decrementSuggestTooltipCounter(key: PluginKey): Command;
declare function resetSuggestTooltipCounter(key: PluginKey): Command;
declare function updateSuggestTooltipCounter(key: PluginKey, counter: number): Command;

declare const suggestTooltip_d_spec: typeof spec;
declare const suggestTooltip_d_plugins: typeof plugins;
declare const suggestTooltip_d_commands: typeof commands;
declare const suggestTooltip_d_defaultKeys: typeof defaultKeys;
type suggestTooltip_d_SuggestTooltipRenderOpts = SuggestTooltipRenderOpts;
declare const suggestTooltip_d_queryTriggerText: typeof queryTriggerText;
declare const suggestTooltip_d_queryIsSuggestTooltipActive: typeof queryIsSuggestTooltipActive;
declare const suggestTooltip_d_replaceSuggestMarkWith: typeof replaceSuggestMarkWith;
declare const suggestTooltip_d_removeSuggestMark: typeof removeSuggestMark;
declare const suggestTooltip_d_incrementSuggestTooltipCounter: typeof incrementSuggestTooltipCounter;
declare const suggestTooltip_d_decrementSuggestTooltipCounter: typeof decrementSuggestTooltipCounter;
declare const suggestTooltip_d_resetSuggestTooltipCounter: typeof resetSuggestTooltipCounter;
declare const suggestTooltip_d_updateSuggestTooltipCounter: typeof updateSuggestTooltipCounter;
declare namespace suggestTooltip_d {
  export {
    suggestTooltip_d_spec as spec,
    suggestTooltip_d_plugins as plugins,
    suggestTooltip_d_commands as commands,
    suggestTooltip_d_defaultKeys as defaultKeys,
    suggestTooltip_d_SuggestTooltipRenderOpts as SuggestTooltipRenderOpts,
    suggestTooltip_d_queryTriggerText as queryTriggerText,
    suggestTooltip_d_queryIsSuggestTooltipActive as queryIsSuggestTooltipActive,
    suggestTooltip_d_replaceSuggestMarkWith as replaceSuggestMarkWith,
    suggestTooltip_d_removeSuggestMark as removeSuggestMark,
    suggestTooltip_d_incrementSuggestTooltipCounter as incrementSuggestTooltipCounter,
    suggestTooltip_d_decrementSuggestTooltipCounter as decrementSuggestTooltipCounter,
    suggestTooltip_d_resetSuggestTooltipCounter as resetSuggestTooltipCounter,
    suggestTooltip_d_updateSuggestTooltipCounter as updateSuggestTooltipCounter,
  };
}

interface TooltipDOM {
    dom: HTMLElement;
    contentDOM: HTMLElement;
}
declare function createTooltipDOM(tooltipDOMSpec?: DOMOutputSpec, arrow?: boolean): TooltipDOM;

export { SelectionTooltipProps, SuggestTooltipRenderOpts, TooltipDOM, TooltipRenderOpts, createTooltipDOM, selectionTooltip_d as selectionTooltip, suggestTooltip_d as suggestTooltip, tooltipPlacement_d as tooltipPlacement };
