import { isObject } from 'lodash';

import { type NestedPanelOptionsBuilder } from '../types';

// SOURCE: https://github.com/grafana/grafana/blob/v13.1.1/packages/grafana-data/src/utils/OptionsUIBuilders.ts
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
