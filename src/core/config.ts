// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/core/config.ts
// TODO: Delete this shim — callers should import config and PluginState from @grafana/runtime/@grafana/data directly (Step 5)
export { config } from '@grafana/runtime';
export { PluginState } from '@grafana/data';
export const hasAlphaPanels = false;
