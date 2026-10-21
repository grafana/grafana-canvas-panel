import { MultiProvider, OpenFeature } from '@openfeature/web-sdk';

import { createOpenFeatureLocalStorageProvider, createOpenFeatureOFREPWebProvider } from '@grafana/runtime';

import pluginJson from './plugin.json';

// OpenFeature is a window-global singleton, so evaluations go through a
// plugin-scoped domain to stay isolated from Grafana core and other plugins.
export const OPEN_FEATURE_DOMAIN = pluginJson.id;

// Registered in pkg/services/featuremgmt/registry.go in grafana/grafana.
export const PAN_ZOOM_FLAG = 'canvasPanelPanZoom';
export const NESTING_FLAG = 'canvasPanelNesting';
export const ACTIONS_AUTH_FLAG = 'vizActionsAuth';

/**
 * Registers read-only proxies of Grafana's own providers under the plugin's
 * domain. Grafana initializes the underlying providers before plugins load, so
 * the proxies resolve synchronously with no extra flag fetch. Call once at
 * plugin module load.
 */
export function initFeatureFlags(): void {
  // Register only when the domain has no provider yet,
  // so module re-evaluation does not reset OpenFeature state.
  if (OpenFeature.getProvider(OPEN_FEATURE_DOMAIN) === OpenFeature.getProvider()) {
    OpenFeature.setProvider(
      OPEN_FEATURE_DOMAIN,
      new MultiProvider([
        { provider: createOpenFeatureLocalStorageProvider() },
        { provider: createOpenFeatureOFREPWebProvider() },
      ])
    );
  }
}

// Synchronous reads. Call them at the point of use; do not cache the result.
const getBooleanFlag = (flag: string, defaultValue: boolean): boolean =>
  OpenFeature.getClient(OPEN_FEATURE_DOMAIN).getBooleanValue(flag, defaultValue);

/** Pan and zoom in the canvas panel. */
export const isPanZoomEnabled = (): boolean => getBooleanFlag(PAN_ZOOM_FLAG, false);

/** Nesting canvas elements into frames. */
export const isNestingEnabled = (): boolean => getBooleanFlag(NESTING_FLAG, false);

/** Authenticated actions through Infinity datasources. */
export const isActionsAuthEnabled = (): boolean => getBooleanFlag(ACTIONS_AUTH_FLAG, false);
