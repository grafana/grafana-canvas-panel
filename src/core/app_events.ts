// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/core/app_events.ts
// TODO: Delete this shim — callers replaced with getAppEvents() from @grafana/runtime in Step 5
import { type AppEvent, type LegacyEmitter } from '@grafana/data';
import { getAppEvents } from '@grafana/runtime';

export const appEvents = {
  emit<T>(event: AppEvent<T> | string, payload?: T): void {
    (getAppEvents() as unknown as LegacyEmitter).emit(event, payload);
  },
};
