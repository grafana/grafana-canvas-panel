// SOURCE: https://github.com/grafana/grafana/blob/v13.1.1/packages/grafana-data/src/utils/OptionsUIBuilders.ts
// Grafana 12.4 already has these at runtime (PanelOptionsEditorBuilder.addNestedOptions creates the
// builder), but only exports them from @grafana/data/internal, which plugins cannot import.
// See src/compat/index.ts before changing.
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
