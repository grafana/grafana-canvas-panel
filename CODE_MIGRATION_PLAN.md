# Canvas Externalization — Code Migration Plan

> **Status:** In progress
> **Authors:** Jesse Peterson, Brian Gann
> **Background:** See design doc — _Externalizing Canvas from Grafana core_

The goal is to copy the Canvas panel visualization code from the Grafana monorepo
(`grafana/grafana`) into this externalized plugin repository (`grafana/grafana-canvas-panel`),
resolving all Grafana-core-internal dependencies along the way, so that the externalized plugin
produces **exactly the same behaviour** as the built-in Canvas panel.

---

## Step 0 — Update `package.json` dependencies

### Bump Grafana packages to 13.1.0

- `@grafana/runtime`: `12.4.2` → `13.1.0`
- `@grafana/data` and `@grafana/ui` are already at `^13.1.0`

### Add third-party runtime dependencies

Use the **exact versions** pinned in `grafana/grafana/package.json` — no `^`, no `~`.

| Package                | Version   |
| ---------------------- | --------- |
| `moveable`             | `0.53.0`  |
| `react-moveable`       | `0.56.0`  |
| `selecto`              | `1.26.3`  |
| `infinite-viewer`      | `^0.29.1` |
| `react-inlinesvg`      | `4.3.0`   |
| `react-draggable`      | `4.5.0`   |
| `react-resizable`      | `3.0.5`   |
| `@react-aria/dialog`   | `3.5.31`  |
| `@react-aria/overlays` | `3.30.0`  |
| `@react-aria/focus`    | `3.21.2`  |
| `@rc-component/tree`   | `1.1.0`   |

### Add dev dependencies

| Package                  | Version |
| ------------------------ | ------- |
| `@types/react-resizable` | `3.0.8` |

> **Note:** `react-use`, `lodash`, `rxjs`, `@emotion/css`, `@emotion/react` are already
> externalized by the bundler — no changes needed.

---

## Step 1 — Copy source tree

Every file copied from the Grafana monorepo must have these two comments on the very first lines:

```ts
// SOURCE: https://github.com/grafana/grafana/blob/main/<original-path>
// TODO: Publish <X> from <@grafana/pkg> and delete this duplicate file  ← only for duplicated core files (Step 4)
```

The `// TODO:` line is only added for files in Step 4 (duplicated core internals).
Files copied in Steps 1a–1d get only the `// SOURCE:` line.

### 1a — Canvas plugin files → `src/`

Source: `public/app/plugins/panel/canvas/`

Preserve the subdirectory structure under `src/`. Files include:

- `CanvasPanel.tsx`
- `globalStyles.ts`
- `migrations.ts`
- `module.tsx` ← replaces the scaffolded stub
- `panelcfg.gen.ts`
- `types.ts`
- `utils.ts`
- `components/CanvasContextMenu.tsx`
- `components/CanvasTooltip.tsx`
- `components/SetBackground.tsx`
- `components/connections/ConnectionAnchors.tsx`
- `components/connections/ConnectionAnchors2.tsx`
- `components/connections/connectionMovementUtils.ts`
- `components/connections/Connections.tsx`
- `components/connections/Connections2.tsx`
- `components/connections/ConnectionSVG.tsx`
- `components/connections/ConnectionSVG2.tsx`
- `editor/connectionEditor.tsx`
- `editor/LineStyleEditor.tsx`
- `editor/options.ts`
- `editor/panZoomHelp.tsx`
- `editor/element/ActionsEditor.tsx`
- `editor/element/APIEditor.tsx`
- `editor/element/ButtonStyleEditor.tsx`
- `editor/element/ConstraintSelectionBox.tsx`
- `editor/element/DataLinksEditor.tsx`
- `editor/element/elementEditor.tsx`
- `editor/element/ParamsEditor.tsx`
- `editor/element/PlacementEditor.tsx`
- `editor/element/QuickPositioning.tsx`
- `editor/element/utils.ts`
- `editor/inline/InlineEdit.tsx`
- `editor/inline/InlineEditBody.tsx`
- `editor/inline/TabsEditor.tsx`
- `editor/layer/layerEditor.tsx`
- `editor/layer/tree.ts`
- `editor/layer/TreeNavigationEditor.tsx`
- `editor/layer/TreeNodeTitle.tsx`

### 1b — Canvas features → `src/features/canvas/`

Source: `public/app/features/canvas/`

- `element.ts`
- `frame.ts`
- `registry.ts`
- `types.ts`
- `runtime/ables.tsx`
- `runtime/element.tsx`
- `runtime/frame.tsx`
- `runtime/root.tsx`
- `runtime/scene.tsx`
- `runtime/sceneAbleManagement.ts`
- `runtime/sceneElementManagement.ts`
- `elements/button.tsx`
- `elements/cloud.tsx`
- `elements/droneFront.tsx`
- `elements/droneSide.tsx`
- `elements/droneTop.tsx`
- `elements/ellipse.tsx`
- `elements/icon.tsx`
- `elements/metricValue.tsx`
- `elements/notFound.tsx`
- `elements/parallelogram.tsx`
- `elements/rectangle.tsx`
- `elements/server/server.tsx`
- `elements/server/types/database.tsx`
- `elements/server/types/single.tsx`
- `elements/server/types/stack.tsx`
- `elements/server/types/terminal.tsx`
- `elements/text.tsx`
- `elements/triangle.tsx`
- `elements/windTurbine.tsx`

### 1c — Dimensions feature → `src/features/dimensions/`

Source: `public/app/features/dimensions/`

- `color.ts`
- `context.ts`
- `direction.ts`
- `resource.ts`
- `scalar.ts`
- `scale.ts`
- `text.ts`
- `types.ts`
- `utils.ts`
- `editors/BackgroundSizeEditor.tsx`
- `editors/ColorDimensionEditor.tsx`
- `editors/DirectionDimensionEditor.tsx`
- `editors/FileUploader.tsx`
- `editors/FolderPickerTab.tsx`
- `editors/ResourceCards.tsx`
- `editors/ResourceDimensionEditor.tsx`
- `editors/ResourcePicker.tsx`
- `editors/ResourcePickerPopover.tsx`
- `editors/ScalarDimensionEditor.tsx`
- `editors/ScaleDimensionEditor.tsx`
- `editors/TextDimensionEditor.tsx`
- `editors/URLPickerTab.tsx`

### 1d — Actions feature → `src/features/actions/`

Source: `public/app/features/actions/`

- `ActionEditor.tsx`
- `ActionEditorModalContent.tsx`
- `ActionVariablesEditor.tsx`
- `ActionsInlineEditor.tsx`
- `analytics.ts`
- `ConnectionPicker.tsx`
- `ParamsEditor.tsx`
- `utils.ts`

---

## Step 2 — Fix all `app/` absolute imports → relative paths

Mechanical pass across all files copied in Step 1. Every `from 'app/features/...'`,
`from 'app/plugins/panel/canvas/...'`, and `from 'app/core/...'` import path is replaced with
the correct relative path within `src/`. Imports that point to files duplicated in Step 4 are
also resolved here.

---

## Step 3 — Fix `@grafana/data/internal` and `@grafana/ui/internal` imports

### `@grafana/data/internal` → `@grafana/data`

All of the following were promoted to the public API in `@grafana/data@13.1.0`.
Change the import source only — no logic changes.

- `NestedValueAccess`
- `NestedPanelOptions`
- `PanelOptionsSupplier`

Affected files: `InlineEditBody.tsx`, `elementEditor.tsx`, `connectionEditor.tsx`,
`layerEditor.tsx`, `features/canvas/element.ts`, `features/canvas/frame.ts`.

### `@grafana/ui/internal` — split into two cases

**Now public in `@grafana/ui@13.1.0`** — change import source to `@grafana/ui`:

- `VizTooltipContent`, `VizTooltipFooter`, `VizTooltipHeader`, `VizTooltipItem`, `CloseButton`
- Affected file: `components/CanvasTooltip.tsx`

**Still internal — import from duplicated file** (see Step 4):

- `FieldNamePicker`, `frameHasName`, `getFrameFieldsDisplayNames`
- Affected file: `features/canvas/elements/metricValue.tsx`
- Import from: `src/core/MatchersUI/`

---

## Step 4 — Duplicate Grafana-core-internal components into `src/core/`

Each file gets both header comments (see Step 1 preamble).

| Source (in `grafana/grafana`)                                                                                                                          | Destination (in this repo)                               | TODO comment                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `public/app/core/components/SVG/SanitizedSVG.tsx`                                                                                                      | `src/core/SVG/SanitizedSVG.tsx`                          | Publish `SanitizedSVG` from `@grafana/ui`                                    |
| `public/app/core/components/SVG/utils.ts`                                                                                                              | `src/core/SVG/utils.ts`                                  | Publish `SanitizedSVG` from `@grafana/ui`                                    |
| `public/app/core/components/Layers/AddLayerButton.tsx`                                                                                                 | `src/core/Layers/AddLayerButton.tsx`                     | Publish `AddLayerButton` from `@grafana/ui`                                  |
| `public/app/core/components/Layers/LayerName.tsx`                                                                                                      | `src/core/Layers/LayerName.tsx`                          | Publish `LayerName` from `@grafana/ui`                                       |
| `public/app/core/components/OptionsUI/NumberInput.tsx`                                                                                                 | `src/core/OptionsUI/NumberInput.tsx`                     | Publish `NumberInput` from `@grafana/ui`                                     |
| `public/app/core/components/OptionsUI/string.tsx`                                                                                                      | `src/core/OptionsUI/string.tsx`                          | Publish `StringValueEditor` from `@grafana/ui`                               |
| `@grafana/ui` internal `FieldNamePicker` component                                                                                                     | `src/core/MatchersUI/FieldNamePicker.tsx`                | Publish `FieldNamePicker` from `@grafana/ui`                                 |
| `@grafana/ui` internal `MatchersUI/utils.ts`                                                                                                           | `src/core/MatchersUI/utils.ts`                           | Publish `frameHasName`, `getFrameFieldsDisplayNames` from `@grafana/ui`      |
| `public/app/features/dashboard/components/PanelEditor/OptionsPaneCategory.tsx`                                                                         | `src/core/PanelEditor/OptionsPaneCategory.tsx`           | Publish `OptionsPaneCategory` from `@grafana/ui`                             |
| `public/app/features/dashboard/components/PanelEditor/OptionsPaneCategoryDescriptor.tsx`                                                               | `src/core/PanelEditor/OptionsPaneCategoryDescriptor.tsx` | Publish `OptionsPaneCategoryDescriptor` from `@grafana/ui`                   |
| `public/app/features/dashboard/components/PanelEditor/OptionsPaneItemDescriptor.tsx`                                                                   | `src/core/PanelEditor/OptionsPaneItemDescriptor.tsx`     | Publish `OptionsPaneItemDescriptor` from `@grafana/ui`                       |
| `public/app/features/dashboard/components/PanelEditor/getVisualizationOptions.tsx` (`fillOptionsPaneItems` + direct helpers only — not the whole file) | `src/core/PanelEditor/fillOptionsPaneItems.ts`           | Publish `fillOptionsPaneItems` from `@grafana/ui`                            |
| `public/app/features/dashboard/components/PanelEditor/utils.ts` (`setOptionImmutably` only)                                                            | `src/core/PanelEditor/utils.ts`                          | Publish `setOptionImmutably` from `@grafana/ui`                              |
| `public/app/types/events.ts` (`PanelEditEnteredEvent`, `PanelEditExitedEvent` only)                                                                    | `src/core/events.ts`                                     | Publish `PanelEditEnteredEvent`, `PanelEditExitedEvent` from `@grafana/data` |
| `public/app/features/alerting/unified/utils/url.ts` (`createAbsoluteUrl`, `createRelativeUrl`, `RelativeUrl` only)                                     | `src/core/url.ts`                                        | Publish `createAbsoluteUrl` from `@grafana/runtime`                          |
| `public/app/core/hooks/useQueryParams.ts`                                                                                                              | `src/core/hooks/useQueryParams.ts`                       | Publish `useQueryParams` from `@grafana/runtime`                             |

### Additional resolutions inside `OptionsPaneCategory.tsx`

- `PANEL_EDITOR_UI_STATE_STORAGE_KEY` → inlined as the string literal `'grafana.dashboard.editor.ui'`
- `useQueryParams` → imported from `src/core/hooks/useQueryParams.ts`
- `@grafana/e2e-selectors` → imported as-is (available as a transitive dependency)

### Note on `fillOptionsPaneItems`

`getVisualizationOptions.tsx` in core has deep dashboard-scene and `@grafana/scenes`
dependencies that Canvas does not use. Extract only the `fillOptionsPaneItems` function and
its direct helpers (e.g. the `categoryGetter` type). Do not copy the entire file.

---

## Step 5 — Resolve remaining Grafana-core-internal API calls

| Internal API                                                      | Affected file(s)                                                                        | Resolution                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appEvents` from `app/core/app_events`                            | `runtime/scene.tsx`, `utils.ts`, `editor/element/utils.ts`, `features/actions/utils.ts` | Replace with `getAppEvents()` from `@grafana/runtime`                                                                                                                                                                                                                  |
| `hasAlphaPanels` from `app/core/config`                           | `utils.ts`                                                                              | Inline: `Boolean(config?.panels?.debug?.state === PluginState.alpha)` using `config` from `@grafana/runtime`                                                                                                                                                           |
| `getDashboardSrv().getCurrent()?.editable`                        | `runtime/scene.tsx`                                                                     | Simplify to `options.inlineEditing` — the panel option toggle is the sole gate. Add `// NOTE:` comment                                                                                                                                                                 |
| `getDashboardSrv().getCurrent()?.panelInEdit`                     | `editor/element/utils.ts`                                                               | Call `getTemplateSrv().replace(text)` with no `scopedVars` argument. Add `// NOTE:` comment explaining the omission                                                                                                                                                    |
| `config` default import from `app/core/config`                    | `elements/server/server.tsx`                                                            | Replace with named `config` import from `@grafana/runtime`                                                                                                                                                                                                             |
| `getTimeSrv().timeRange()`                                        | `features/actions/utils.ts`                                                             | Add optional `timeRange?: TimeRange` parameter to `getActions()`, thread through to `InfinityRequestBuilder.buildRequest()`. Add prominent `// NOTE:` comment above `getActions` explaining the signature divergence from source. Callers pass `scene.data?.timeRange` |
| `getNextRequestId()` from `features/query/state/PanelQueryRunner` | `features/actions/utils.ts`                                                             | Inline as a simple module-level counter: `let counter = 0; const getNextRequestId = () => 'Q' + counter++`                                                                                                                                                             |

### `// NOTE:` comment conventions

Each divergence from the source file gets a short prominent comment:

```ts
// NOTE: `timeRange` parameter added here (not in source) because `getTimeSrv()`
// is not available outside Grafana core. Callers pass `scene.data?.timeRange` instead.
```

```ts
// NOTE: `scopedVars` omitted here (not in source) because `panelInEdit` is not
// accessible outside Grafana core. Variable interpolation is less specific as a result.
```

```ts
// NOTE: `dashboard?.editable` check removed here (not in source). The panel option
// toggle (`options.inlineEditing`) is the sole gate for inline editing in the external plugin.
```

---

## Step 6 — Bundle icon/image assets and refactor asset URLs

### 6a — Create unicons allowlist

Create `src/features/dimensions/uniconsAllowlist.ts` (new file authored for this repo — no
`// SOURCE:` comment):

```ts
export enum AllowedUnicon {
  CheckCircle = 'check-circle',
  Cloud = 'cloud',
  ExclamationTriangle = 'exclamation-triangle',
  QuestionCircle = 'question-circle',
  TimesCircle = 'times-circle',
}
```

> **Note:** This is a minimum set for exact parity with the current Canvas source.
> Additional unicons will likely be needed once the full element set is audited.

### 6b — Copy icon SVG files

Copy from `grafana/public/img/icons/unicons/` into `src/img/icons/unicons/`:

- `check-circle.svg`
- `cloud.svg`
- `exclamation-triangle.svg`
- `question-circle.svg`
- `times-circle.svg`

### 6c — Refactor `getPublicOrAbsoluteUrl()`

In `src/features/dimensions/resource.ts`, update `getPublicOrAbsoluteUrl()` to resolve
plugin-bundled assets using the plugin's own public path, while continuing to pass through
absolute URLs unchanged.

---

## Step 7 — Wire up `src/module.ts` and `src/plugin.json`

### `src/plugin.json`

Keep the externalized repo's metadata (`version`, `keywords`, author, links, etc.) but
ensure `"id": "canvas"` matches core exactly so that existing dashboards using the built-in
Canvas panel remain compatible when switching to this plugin.

### `src/module.ts`

Replace the scaffolded stub with the logic from the copied `module.tsx`. Ensure
`addStandardCanvasEditorOptions` and all editor wiring is preserved exactly.

### Delete scaffolded stubs

- `src/types.ts` (scaffolded placeholder)
- `src/components/SimplePanel.tsx` (scaffolded placeholder)

---

## Step 8 — Build and typecheck

```sh
npm run typecheck
npm run build
```

Iterate on any remaining type errors. The build must produce a valid plugin bundle with the
same panel ID (`canvas`) and options schema as Grafana core's built-in Canvas panel.
