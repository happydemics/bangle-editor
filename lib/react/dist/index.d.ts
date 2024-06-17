import { BangleEditorStateProps, BangleEditorState, NodeViewProps, BangleEditor as BangleEditor$1, BangleEditorProps as BangleEditorProps$1 } from '@bangle.dev/core';
import { PluginKey, EditorView } from '@bangle.dev/pm';
import React, { useRef } from 'react';

declare function useEditorState(props: BangleEditorStateProps): BangleEditorState<any>;
declare function usePluginState(pluginKey: PluginKey, throttle?: boolean): any;
declare function useEditorViewContext(): EditorView;

type RenderNodeViewsFunction = (props: NodeViewProps & {
    children: React.ReactNode;
}) => React.ReactNode;

declare const EditorViewContext: React.Context<EditorView>;
interface BangleEditorProps<PluginMetadata = any> extends BangleEditorProps$1<PluginMetadata> {
    id?: string;
    children?: React.ReactNode;
    renderNodeViews?: RenderNodeViewsFunction;
    className?: string;
    style?: React.CSSProperties;
    onReady?: (editor: BangleEditor$1<PluginMetadata>) => void;
    editorViewRef?: typeof useRef;
}
declare const BangleEditor: React.ForwardRefExoticComponent<BangleEditorProps<any> & React.RefAttributes<BangleEditor$1<any> | undefined>>;

export { BangleEditor, EditorViewContext, RenderNodeViewsFunction, useEditorState, useEditorViewContext, usePluginState };
