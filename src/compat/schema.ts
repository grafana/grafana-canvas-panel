// SOURCE: https://github.com/grafana/grafana/blob/v13.1.1/packages/grafana-schema/src/raw/dashboard/x/types.gen.ts
// Added to @grafana/schema in 13.0.0. Grafana versions before 13.0 ignore the `scope` field on matchers.
// See src/compat/index.ts before changing.
export type MatcherScope = 'series' | 'nested' | 'annotation' | 'exemplar';
