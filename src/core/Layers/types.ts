// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/core/components/Layers/types.ts
// TODO: Publish LayerElement from @grafana/ui and delete this duplicate file
/** An interface that has a getName method */
export interface LayerElement {
  getName: () => string;
}
