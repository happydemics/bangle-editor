import { BaseRawNodeSpec, RawPlugins } from '@bangle.dev/core';

declare const table: BaseRawNodeSpec;
declare const tableCell: BaseRawNodeSpec;
declare const tableHeader: BaseRawNodeSpec;
declare const tableRow: BaseRawNodeSpec;
declare const tablePlugins: () => RawPlugins;

export { table, tableCell, tableHeader, tablePlugins, tableRow };
