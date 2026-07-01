// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/features/dashboard/services/TimeSrv.ts
// TODO: Delete this shim — getTimeSrv replaced with timeRange from PanelProps in Step 5
import { type TimeRange, dateTime } from '@grafana/data';

export const getTimeSrv = () => ({
  timeRange: (): TimeRange => ({
    from: dateTime().subtract(6, 'hours'),
    to: dateTime(),
    raw: { from: 'now-6h', to: 'now' },
  }),
});
