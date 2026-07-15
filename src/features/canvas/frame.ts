// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/features/canvas/frame.ts
import { type CanvasElementOptions } from './element';

export interface CanvasFrameOptions extends CanvasElementOptions {
  type: 'frame';
  elements: CanvasElementOptions[];
}
