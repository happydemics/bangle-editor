'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@bangle.dev/utils');

class Disk {
}

/**
 * A simple storage utility function for saving data
 * into browsers storage.
 */
class DebouncedDisk {
    constructor(
    // return undefined if document is not found
    _getItem, _setItem, { debounceWait = 300, debounceMaxWait = 1000, onPendingWrites, }) {
        this._getItem = _getItem;
        this._setItem = _setItem;
        this.debounceFuncs = new Map();
        this.debounceWait = debounceWait;
        this.debounceMaxWait = debounceMaxWait;
        this.pendingWrites = new WatchSet(onPendingWrites);
    }
    async flush(docName, doc, version) {
        this.pendingWrites.add(docName);
        // clear the timeout so that we do not
        // overwrite the doc due to the timeout
        const existingFn = this.debounceFuncs.get(docName);
        if (existingFn) {
            existingFn.cancel();
            this.debounceFuncs.delete(docName);
        }
        this._doSave(docName, doc, version);
    }
    async flushAll() {
        Array.from(this.debounceFuncs.values()).map((r) => r());
    }
    async load(docName) {
        let item = await this._getItem(docName);
        return item;
    }
    async update(docName, getLatestDoc) {
        let existingFn = this.debounceFuncs.get(docName);
        this.pendingWrites.add(docName);
        if (!existingFn) {
            existingFn = utils.debounceFn(() => {
                this.debounceFuncs.delete(docName);
                const { doc, version } = getLatestDoc();
                this._doSave(docName, doc, version);
            }, { wait: this.debounceWait, maxWait: this.debounceMaxWait });
            this.debounceFuncs.set(docName, existingFn);
        }
        existingFn();
    }
    async _doSave(docName, doc, version) {
        await this._setItem(docName, doc, version);
        this.pendingWrites.delete(docName);
    }
}
class WatchSet extends Set {
    constructor(_onSizeChange = (size) => { }) {
        super();
        this._onSizeChange = _onSizeChange;
        this._onSizeChange(this.size);
    }
    add(entry) {
        const result = super.add(entry);
        this._onSizeChange(this.size);
        return result;
    }
    clear() {
        const result = super.clear();
        this._onSizeChange(this.size);
        return result;
    }
    delete(entry) {
        const result = super.delete(entry);
        this._onSizeChange(this.size);
        return result;
    }
}

exports.DebouncedDisk = DebouncedDisk;
exports.Disk = Disk;
