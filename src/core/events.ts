// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/types/events.ts
// TODO: Publish PanelEditEnteredEvent, PanelEditExitedEvent from @grafana/data and delete this duplicate file
import { BusEventWithPayload } from '@grafana/data';

export class PanelEditEnteredEvent extends BusEventWithPayload<number> {
  static type = 'panel-edit-started';
}

export class PanelEditExitedEvent extends BusEventWithPayload<number> {
  static type = 'panel-edit-finished';
}
