// SOURCE: https://github.com/grafana/grafana/blob/v13.1.1/packages/grafana-data/src/utils/OptionsUIBuilders.ts
// Grafana 12.4 already has these at runtime (PanelOptionsEditorBuilder.addNestedOptions creates the
// builder), but only exports them from @grafana/data/internal, which plugins cannot import.
// See src/compat/index.ts before changing.
import { isObject } from 'lodash';

import { type PanelOptionsEditorBuilder, type PanelOptionsEditorItem, type StandardEditorContext } from '@grafana/data';

export type PanelOptionsSupplier<TOptions> = (
  builder: PanelOptionsEditorBuilder<TOptions>,
  context: StandardEditorContext<TOptions>
) => void;

export interface NestedValueAccess {
  getValue: (path: string) => any;
  onChange: (path: string, value: any) => void;
  getContext?: (parent: StandardEditorContext<any>) => StandardEditorContext<any>;
}

export interface NestedPanelOptions<TSub = any> {
  path: string;
  category?: string[];
  defaultValue?: TSub;
  build: PanelOptionsSupplier<TSub>;
  values?: (parent: NestedValueAccess) => NestedValueAccess;
}

/** Shape of the item that Grafana's addNestedOptions() adds to the builder. */
export interface NestedPanelOptionsBuilder<TSub = any> extends PanelOptionsEditorItem<TSub> {
  cfg: NestedPanelOptions<TSub>;
  getBuilder: () => PanelOptionsSupplier<TSub>;
  getNestedValueAccess: (parent: NestedValueAccess) => NestedValueAccess;
}

export function isNestedPanelOptions(item: unknown): item is NestedPanelOptionsBuilder {
  return isObject(item) && 'id' in item && item.id === 'nested-panel-options';
}

// SOURCE: https://github.com/grafana/grafana/blob/v13.1.1/packages/grafana-data/src/utils/uuid.ts
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
