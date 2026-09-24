# Grafana compatibility

Build against the pinned 12.4 SDK; use the running Grafana's public APIs whenever available.
Stable APIs stay direct imports from `@grafana/*`. Only APIs missing from the minimum supported host
go through this directory. Host-specific appearance and behavior are intentional.

## Runtime adapters

`ui.ts` and `data.ts` import public package namespaces and choose each host export independently,
falling back only when that export is nullish. Selection happens once at module initialization.
React component references are preserved, including `memo` and `forwardRef` components.
Errors thrown by a host implementation are not caught or replaced with fallback behavior.

The optional contracts describe what Canvas needs; they do not declare newer APIs globally on
the 12.4 types. `contracts/grafana.ts` checks those contracts without casts against newer SDKs in CI
(13.1.0, 13.1.1, and latest stable, with each SDK's React major). Runtime and browser tests remain necessary:
types cannot prove that the host loader exposes a module or that its behavior is compatible.

| Public export                        | Verified availability                                     | Required contract                                |
| ------------------------------------ | --------------------------------------------------------- | ------------------------------------------------ |
| `@grafana/ui.CloseButton`            | Absent in 12.4.0 and 13.0.0; present in 13.1.0 and 13.1.1 | Click callback, accessible label, optional style |
| `@grafana/ui.VizTooltipContent`      | Same versions as CloseButton                              | Items, children, pinning, scroll limits          |
| `@grafana/ui.VizTooltipHeader`       | Same versions as CloseButton                              | Item and pinning                                 |
| `@grafana/ui.VizTooltipFooter`       | Same versions as CloseButton                              | Links, actions, filters, annotation callback     |
| `@grafana/data.generateUUID`         | Absent in 12.4.0 and 13.0.0; present in 13.1.0 and 13.1.1 | No arguments; UUID string result                 |
| `@grafana/data.isNestedPanelOptions` | Same versions as generateUUID                             | Unknown input; nested-builder type guard         |

Availability is checked at runtime, not inferred from version numbers. The release tags above are
verified checkpoints, not a claim about every prerelease or backport. If a known host changes an
API incompatibly, add a focused adapter and a regression test before using that implementation.

`fallbacks/` retains upstream implementations and their source-tag comments. Its action buttons,
modals, rows, and color indicators are implementation details, not additional supported host APIs.
`ActionButton` and `VariablesInputModal` are not public root exports in 13.1.1.

## Types and props

`types.ts`, `schema.ts`, and the tooltip types provide structural declarations unavailable in the
12.4 SDK. Type-only imports disappear at build time; runtime selection is unnecessary.

`props.ts` handles additions to existing components separately:

- Combobox `noOptionsMessage` is available in 13.0.0. When supplied, it is forwarded; 12.4 ignores it.
- Explicit Field `useFieldset` is available in 13.1.0, not 13.0.0. Pass only values read from a host
  editor item via `getUseFieldset`. Older builders omit this capability, preventing unknown DOM props.
- Combobox option icons are optional structural data; older components ignore them.

## Dependency policy

Keep the 12.4 package pins and existing scaffolded webpack externals. In this repository, the
external rules explicitly cover `@grafana/data`, `@grafana/runtime`, and `@grafana/ui`; the scope
prefix alone does not make every `@grafana/*` package external. In particular, do not assume that
`@grafana/schema` or `@grafana/i18n` is shared by this build.

`plugin.json` declares host support. npm `peerDependencies` cannot choose runtime exports and are
not needed for this application plugin. Do not alias entire SDK packages to shims, import private
`/internal` modules, or externalize additional packages without a supported host loader contract.

See Grafana's [dependency model](https://grafana.com/developers/plugin-tools/key-concepts/npm-dependencies)
and [runtime checks](https://grafana.com/developers/plugin-tools/how-to-guides/runtime-checks).

## Maintenance and verification

For each export, remove its adapter and fallback once the minimum host and build SDK both provide
the compatible public API. Keep private helpers until their final fallback consumer is removed.
Do not delete the entire directory based solely on a version threshold.

Run `npm run typecheck`, `npm run test:ci`, and `npm run build` against the locked baseline. In a
disposable install with the newer SDK packages, run `npx tsc --noEmit -p contracts/tsconfig.json`.
Inspect the production bundle to confirm host SDKs remain external. Exercise the same artifact
on 12.4.0, 13.0.1, 13.1.0, and latest stable Grafana; host-driven visual differences are expected.
The tooltip E2E test also verifies that the external plugin bundle was loaded. For local browser
runs, use `GRAFANA_URL=http://localhost:<port> npx playwright test
--tsconfig=node_modules/@grafana/tsconfig/tsconfig.json --reporter=line`; the explicit config avoids
Playwright's package-name `extends` resolution issue. The compose runner uses its own config environment.

Follow-up inventory outside this change: `src/core` contains copied options editors, suggestions,
layers, and hooks; `src/features` contains copied dimension helpers and Canvas internals. Audit
those individually for public exports before adding any further compatibility adapters.
