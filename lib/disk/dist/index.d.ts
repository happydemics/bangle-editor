import { Node } from '@bangle.dev/pm';
import { DebouncedFunction } from '@bangle.dev/utils';

declare abstract class Disk {
    abstract flush(_key: string, _doc: Node, version: number): Promise<void>;
    abstract load(_key: string): Promise<Node | undefined>;
    abstract update(_key: string, _getLatestDoc: () => {
        doc: Node;
        version: number;
    }): Promise<void>;
}

/**
 * A simple storage utility function for saving data
 * into browsers storage.
 */
declare class DebouncedDisk implements Disk {
    private _getItem;
    private _setItem;
    debounceWait: number;
    debounceMaxWait: number;
    debounceFuncs: Map<string, DebouncedFunction<any, any>>;
    pendingWrites: WatchSet<string>;
    constructor(_getItem: (key: string) => Promise<Node | undefined>, _setItem: (key: string, doc: Node, version: number) => Promise<void>, { debounceWait, debounceMaxWait, onPendingWrites, }: {
        debounceWait: number;
        debounceMaxWait: number;
        onPendingWrites?: (size: number) => void;
    });
    flush(docName: string, doc: Node, version: number): Promise<void>;
    flushAll(): Promise<void>;
    load(docName: string): Promise<Node | undefined>;
    update(docName: string, getLatestDoc: () => {
        doc: Node;
        version: number;
    }): Promise<void>;
    _doSave(docName: string, doc: Node, version: number): Promise<void>;
}
declare class WatchSet<T> extends Set<T> {
    private _onSizeChange;
    constructor(_onSizeChange?: (size: number) => void);
    add(entry: T): this;
    clear(): void;
    delete(entry: T): boolean;
}

export { DebouncedDisk, Disk };
