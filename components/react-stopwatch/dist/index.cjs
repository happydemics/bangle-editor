'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var core = require('@bangle.dev/core');
var pm = require('@bangle.dev/pm');
var utils = require('@bangle.dev/utils');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const name = 'stopwatch';
const spec = specFactory;
const plugins = pluginsFactory;
const commands = {};
function specFactory() {
    const spec = {
        name,
        type: 'node',
        schema: {
            attrs: {
                startTime: {
                    default: 0,
                },
                stopTime: {
                    default: 0,
                },
            },
            inline: true,
            group: 'inline',
            draggable: true,
            atom: true,
        },
        markdown: {
            toMarkdown: (state, node) => {
                const string = serializeAtomNodeToMdLink2(name, node.attrs);
                state.write(string);
            },
        },
    };
    spec.schema = {
        ...spec.schema,
        ...core.domSerializationHelpers(name, { tag: 'span' }),
    };
    return spec;
}
function pluginsFactory(opts = {}) {
    return [
        pm.keymap({
            'Shift-Ctrl-s': insertStopwatch(),
        }),
        core.NodeView.createPlugin({ name, containerDOM: ['span'] }),
    ];
}
class Stopwatch extends React__default["default"].Component {
    constructor() {
        super(...arguments);
        this.interval = null;
        this.state = {
            counter: 0,
        };
        this.isPaused = () => {
            const { stopTime } = this.getAttrs();
            return stopTime === 0 || stopTime > 0;
        };
        this.incrementCounter = () => {
            this.setState({
                counter: this.state.counter + 1,
            });
        };
    }
    componentDidMount() {
        this.interval = setInterval(() => {
            if (!this.isPaused()) {
                requestAnimationFrame(() => this.incrementCounter());
            }
        }, 1000);
    }
    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    getAttrs() {
        const { stopTime, startTime } = this.props.node.attrs;
        return {
            stopTime,
            startTime,
        };
    }
    render() {
        const { selected } = this.props;
        const { stopTime, startTime } = this.getAttrs();
        const now = Date.now();
        let endTime = stopTime ? stopTime : now;
        // the initial values
        if (stopTime === 0 && startTime === 0) {
            endTime = 0;
        }
        const isPaused = this.isPaused();
        return (React__default["default"].createElement("span", { className: "stopwatch", contentEditable: false, style: {
                backgroundColor: isPaused ? 'pink' : '#00CED1',
                outline: selected ? '2px solid blue' : undefined,
                borderRadius: 10,
                padding: '1px 2px 1px 2px',
                margin: '1px 2px',
                fontWeight: 500,
                fontFamily: 'monospace',
            }, onClick: () => {
                if (!isPaused) {
                    this.updateAttrs({ stopTime: now, startTime });
                    return;
                }
                // resume a stopped stopwatch
                this.updateAttrs({
                    startTime: startTime + (now - stopTime),
                    stopTime: null,
                });
            } },
            "\u23F2",
            formatTime(((endTime - startTime) / 1000).toFixed(0))));
    }
    updateAttrs({ stopTime, startTime, }) {
        this.props.updateAttrs({
            stopTime,
            startTime,
        });
    }
}
function formatTime(secs) {
    var sec_num = parseInt(secs, 10);
    var hours = Math.floor(sec_num / 3600) % 24;
    var minutes = Math.floor(sec_num / 60) % 60;
    var days = Math.floor(sec_num / (24 * 3600));
    var seconds = sec_num % 60;
    const result = [hours, minutes, seconds]
        .map((v) => (v < 10 ? '0' + v : v))
        .join(':');
    return days > 0 ? days + 'd ' + result : result;
}
function insertStopwatch() {
    return function (state, dispatch) {
        let stopwatchType = utils.getNodeType(state, name);
        let { $from } = state.selection, index = $from.index();
        if (!$from.parent.canReplaceWith(index, index, stopwatchType)) {
            return false;
        }
        if (dispatch) {
            dispatch(state.tr.replaceSelectionWith(stopwatchType.create()));
        }
        return true;
    };
}
function serializeAtomNodeToMdLink2(name, attrs) {
    return `[$${name}](bangle://v1?data=${encodeURIComponent(JSON.stringify(attrs))}`;
}

var stopwatch = /*#__PURE__*/Object.freeze({
    __proto__: null,
    spec: spec,
    plugins: plugins,
    commands: commands,
    Stopwatch: Stopwatch,
    insertStopwatch: insertStopwatch
});

exports.stopwatch = stopwatch;
