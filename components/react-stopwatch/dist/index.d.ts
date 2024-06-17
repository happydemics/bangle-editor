import React from 'react';
import { BaseRawNodeSpec, RawPlugins, NodeViewProps } from '@bangle.dev/core';
import { Command } from '@bangle.dev/pm';

declare const spec: typeof specFactory;
declare const plugins: typeof pluginsFactory;
declare const commands: {};
declare function specFactory(): BaseRawNodeSpec;
declare function pluginsFactory(opts?: {}): RawPlugins;
declare class Stopwatch extends React.Component<NodeViewProps> {
    interval: ReturnType<typeof setInterval> | null;
    state: {
        counter: number;
    };
    isPaused: () => boolean;
    incrementCounter: () => void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    getAttrs(): {
        stopTime: any;
        startTime: any;
    };
    render(): React.JSX.Element;
    updateAttrs({ stopTime, startTime, }: {
        stopTime: number | null;
        startTime: number | null;
    }): void;
}
declare function insertStopwatch(): Command;

declare const stopwatch_d_spec: typeof spec;
declare const stopwatch_d_plugins: typeof plugins;
declare const stopwatch_d_commands: typeof commands;
type stopwatch_d_Stopwatch = Stopwatch;
declare const stopwatch_d_Stopwatch: typeof Stopwatch;
declare const stopwatch_d_insertStopwatch: typeof insertStopwatch;
declare namespace stopwatch_d {
  export {
    stopwatch_d_spec as spec,
    stopwatch_d_plugins as plugins,
    stopwatch_d_commands as commands,
    stopwatch_d_Stopwatch as Stopwatch,
    stopwatch_d_insertStopwatch as insertStopwatch,
  };
}

export { stopwatch_d as stopwatch };
