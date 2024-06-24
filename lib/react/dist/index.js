import React, { useState, useEffect, useRef, useImperativeHandle, useContext } from 'react';
import { saveRenderHandlers, BangleEditor as BangleEditor$1, BangleEditorState } from '@bangle.dev/core';
import { Node, EditorView, Plugin, PluginKey } from '@bangle.dev/pm';
import { objectUid, bangleWarn, rafSchedule } from '@bangle.dev/utils';
import PropTypes from 'prop-types';
import reactDOM from 'react-dom';

let log$1 = () => { };
const nodeViewUpdateStore = new WeakMap();
const nodeViewRenderHandlers = (updateNodeViews) => ({
    create: (nodeView, _nodeViewProps) => {
        log$1('create', objectUid.get(nodeView));
        updateNodeViews((nodeViews) => [...nodeViews, nodeView]);
    },
    update: (nodeView, _nodeViewProps) => {
        log$1('update', objectUid.get(nodeView));
        const updateCallback = nodeViewUpdateStore.get(nodeView);
        // If updateCallback is undefined (which can happen if react took long to mount),
        // we are still okay, as the latest nodeViewProps will be accessed whenever it mounts.
        if (updateCallback) {
            updateCallback();
        }
    },
    destroy: (nodeView) => {
        log$1('destroy', objectUid.get(nodeView));
        updateNodeViews((nodeViews) => nodeViews.filter((n) => n !== nodeView));
    },
});
function useNodeViews(ref) {
    const [nodeViews, setNodeViews] = useState([]);
    useEffect(() => {
        // save the renderHandlers in the dom to decouple nodeView instantiating code
        // from the editor. Since PM passing view when nodeView is created, the author
        // of the component can get the handler reference from `getRenderHandlers(view)`.
        // Note: this assumes that the pm's dom is the direct child of `editorRenderTarget`.
        let destroyed = false;
        saveRenderHandlers(ref.current, nodeViewRenderHandlers((cb) => {
            if (!destroyed) {
                // use callback variant of setState to
                // always get freshest nodeViews.
                setNodeViews((nodeViews) => cb(nodeViews));
            }
        }));
        return () => {
            destroyed = true;
        };
    }, [ref]);
    return nodeViews;
}

let log = () => { };
class NodeViewWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.update = () => {
            this.setState((_state, props) => ({
                nodeViewProps: props.nodeView.getNodeViewProps(),
            }));
        };
        this.attachToContentDOM = (reactElement) => {
            if (!reactElement) {
                return;
            }
            const contentDOM = this.props.nodeView.contentDOM;
            // Since we do not control how many times this callback is called
            // make sure it is not already mounted.
            if (!reactElement.contains(contentDOM)) {
                // If contentDOM happens to be mounted to someone else
                // remove it from there.
                if (contentDOM.parentNode) {
                    contentDOM.parentNode.removeChild(contentDOM);
                }
                reactElement.appendChild(contentDOM);
            }
        };
        // So that we can directly update the nodeView without the mess
        // of prop forwarding.
        // What about updating the wrong nodeView ?
        // It is okay because a nodeView and this ReactComponent will always
        // have a 1:1 mapping. This is guaranteed because you use `nodeView` instance
        // to generate a react key. See the usage of this component in ./ReactEditor.js
        props.nodeViewUpdateStore.set(props.nodeView, this.update);
        this.state = { nodeViewProps: this.props.nodeView.getNodeViewProps() };
    }
    getChildren() {
        if (!this.props.nodeView.contentDOM) {
            return null;
        }
        if (this.state.nodeViewProps.node.isInline) {
            return (
            // The bangle-nv-content is needed to keep the content take space
            // or else browsers will collapse it, making it hard to type
            React.createElement("span", { className: "bangle-nv-child-container", ref: this.attachToContentDOM }));
        }
        return (React.createElement("div", { className: "bangle-nv-child-container", ref: this.attachToContentDOM }));
    }
    render() {
        log('react rendering', objectUid.get(this.props.nodeView));
        const element = this.props.renderNodeViews({
            ...this.state.nodeViewProps,
            children: this.getChildren(),
        });
        if (!element) {
            bangleWarn('renderNodeView prop must return a react element for the node', this.state.nodeViewProps.node);
            throw new Error(`renderNodeView must handle rendering for node of type "${this.state.nodeViewProps.node.type.name}"`);
        }
        return element;
    }
}
NodeViewWrapper.propTypes = {
    nodeView: PropTypes.object.isRequired,
    renderNodeViews: PropTypes.func.isRequired,
    nodeViewUpdateStore: PropTypes.instanceOf(WeakMap).isRequired,
};
const atomNodeViewPropTypes = {
    selected: PropTypes.bool.isRequired,
    node: PropTypes.instanceOf(Node).isRequired,
    view: PropTypes.instanceOf(EditorView).isRequired,
    getPos: PropTypes.func.isRequired,
    decorations: PropTypes.object.isRequired,
    attrs: PropTypes.object.isRequired,
    updateAttrs: PropTypes.func.isRequired,
};
({
    ...atomNodeViewPropTypes,
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.arrayOf(PropTypes.element),
    ]).isRequired,
});

const EditorViewContext = React.createContext(
/* we have to provide a default value to createContext */
null);
const BangleEditor = React.forwardRef(({ id, state, children, focusOnInit = true, pmViewOpts, renderNodeViews, className, style, onReady = () => { }, }, ref) => {
    const renderRef = useRef(null);
    const onReadyRef = useRef(onReady);
    const editorViewPayloadRef = useRef({
        state,
        focusOnInit,
        pmViewOpts,
    });
    const [editor, setEditor] = useState();
    const nodeViews = useNodeViews(renderRef);
    useImperativeHandle(ref, () => {
        return editor;
    }, [editor]);
    useEffect(() => {
        const editor = new BangleEditor$1(renderRef.current, editorViewPayloadRef.current);
        editor.view._updatePluginWatcher = updatePluginWatcher(editor);
        onReadyRef.current(editor);
        setEditor(editor);
        return () => {
            editor.destroy();
        };
    }, [ref]);
    if (nodeViews.length > 0 && renderNodeViews == null) {
        throw new Error('When using nodeViews, you must provide renderNodeViews callback');
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { ref: renderRef, id: id, className: className, style: style }),
        nodeViews.map((nodeView) => {
            return reactDOM.createPortal(
            // @ts-ignore
            React.createElement(NodeViewWrapper, { debugKey: objectUid.get(nodeView), nodeViewUpdateStore: nodeViewUpdateStore, nodeView: nodeView, renderNodeViews: renderNodeViews }), nodeView.containerDOM, objectUid.get(nodeView));
        }),
        editor ? (React.createElement(EditorViewContext.Provider, { value: editor.view }, children)) : null));
});
const updatePluginWatcher = (editor) => {
    return (watcher, remove = false) => {
        if (editor.destroyed) {
            return;
        }
        let state = editor.view.state;
        const newPlugins = remove
            ? state.plugins.filter((p) => p !== watcher)
            : [...state.plugins, watcher];
        state = state.reconfigure({
            plugins: newPlugins,
        });
        editor.view.updateState(state);
    };
};
BangleEditor.propTypes = {
    id: PropTypes.string,
    renderNodeViews: PropTypes.func,
    onReady: PropTypes.func,
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.arrayOf(PropTypes.element),
    ]),
    state: PropTypes.instanceOf(BangleEditorState).isRequired,
    pmViewOpts: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.object,
};

function useEditorState(props) {
    if (props.plugins && typeof props.plugins !== 'function') {
        throw new Error('plugins error: plugins must be a function');
    }
    const [state] = useState(() => 
    // Instantiate the editorState once and keep using that instance
    // on subsequent renders.
    // Passing a callback in useState lazy calls the
    // functions on the first render and never again.
    new BangleEditorState(props));
    return state;
}
function usePluginState(pluginKey, throttle = false) {
    const view = useEditorViewContext();
    const [state, setState] = useState(pluginKey.getState(view.state));
    useEffect(() => {
        let _setState = setState;
        if (throttle) {
            _setState = rafSchedule(setState);
        }
        const plugin = watcherPlugin(pluginKey, _setState);
        view._updatePluginWatcher(plugin);
        return () => {
            if (throttle) {
                _setState.cancel();
            }
            view._updatePluginWatcher(plugin, true);
        };
    }, [view, pluginKey, throttle]);
    return state;
}
function useEditorViewContext() {
    return useContext(EditorViewContext);
}
function watcherPlugin(pluginKey, setState) {
    return new Plugin({
        key: new PluginKey(`withPluginState_${pluginKey.key}`),
        view() {
            return {
                update(view, prevState) {
                    const { state } = view;
                    if (prevState === state) {
                        return;
                    }
                    const newPluginState = pluginKey.getState(state);
                    if (newPluginState !== pluginKey.getState(prevState)) {
                        setState(newPluginState);
                    }
                },
            };
        },
    });
}

export { BangleEditor, EditorViewContext, useEditorState, useEditorViewContext, usePluginState };
