import * as grafanaData from '@grafana/data';

import * as fallback from './fallbacks/data';

// Public exports absent from the 12.4 development types. Keep the optional
// contract local rather than claiming that every host provides these APIs.
export interface OptionalDataExports {
  generateUUID?: typeof fallback.generateUUID;
  isNestedPanelOptions?: typeof fallback.isNestedPanelOptions;
}

const host = grafanaData as typeof grafanaData & OptionalDataExports;

export const generateUUID = host.generateUUID ?? fallback.generateUUID;
export const isNestedPanelOptions = host.isNestedPanelOptions ?? fallback.isNestedPanelOptions;
