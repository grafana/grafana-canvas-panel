// Compatibility layer so the plugin runs on Grafana >=12.4.0 (see grafanaDependency in plugin.json).
//
// The plugin builds against the @grafana/* 12.4.0 packages, and at runtime uses whatever copy the running
// Grafana provides (they are webpack externals). Anything the Canvas code needs that 12.4 does not export
// publicly lives here instead, copied from the Grafana tag named in each file's SOURCE comment.
//
// Rules:
// - Import these from '../compat' (or a relative path to it), never from @grafana/*/internal.
// - Copy upstream code as-is apart from import paths, so it stays easy to diff against the SOURCE tag.
// - When grafanaDependency moves past the version that made a symbol public, delete it here and import it
//   from @grafana/* again.
export {
  type NestedPanelOptions,
  type NestedPanelOptionsBuilder,
  type NestedValueAccess,
  type PanelOptionsSupplier,
  generateUUID,
  isNestedPanelOptions,
} from './data';
export { type MatcherScope } from './schema';
export { CloseButton } from './CloseButton';
export { VizTooltipContent } from './VizTooltip/VizTooltipContent';
export { VizTooltipFooter } from './VizTooltip/VizTooltipFooter';
export { VizTooltipHeader } from './VizTooltip/VizTooltipHeader';
export { type VizTooltipItem } from './VizTooltip/types';
export { type ComboboxOptionIcon, fieldsetProps, getUseFieldset, noOptionsMessageProps } from './props';
