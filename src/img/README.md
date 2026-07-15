# img — Bundled Image Assets

This directory contains all static image assets bundled directly into the Canvas plugin. They are copied to `dist/img/` at build time by the `CopyWebpackPlugin` configuration in `webpack.config.ts`.

## Directory structure

| Directory        | Contents                      |
| ---------------- | ----------------------------- |
| `icons/unicons/` | 1,245 Unicon SVG icons        |
| `icons/marker/`  | 7 marker SVG icons            |
| `icons/iot/`     | 3 IoT SVG icons               |
| `bg/`            | 7 stock background PNG images |
| `logo.svg`       | Plugin logo                   |

## Asset manifests

Each asset directory has a generated `manifest.ts` that enumerates its contents:

| Manifest            | Export          | Shape                                                                                       |
| ------------------- | --------------- | ------------------------------------------------------------------------------------------- |
| `icons/manifest.ts` | `ICON_MANIFEST` | `Record<string, Record<string, true>>` — keyed by folder path, values are sets of filenames |
| `bg/manifest.ts`    | `BG_MANIFEST`   | same shape, keyed by `'img/bg'`                                                             |

These manifests are used by `FolderPickerTab` to enumerate available icons and backgrounds in the resource picker UI, replacing the previous dependency on the `-- Grafana --` built-in datasource's `listFiles()` API.

The schema uses full filenames including extensions (e.g. `'arrow-right.svg': true`) for backwards compatibility with existing dashboard JSON, which stores full paths like `img/icons/unicons/arrow-right.svg`.

## Regenerating manifests

**⚠️ Manifests are auto-generated — do not edit them by hand.**

Run after adding, removing, or renaming any asset files:

```sh
npm run generate-img-manifests
```

This also runs automatically as a `prebuild` step before every `npm run build`.

The generation script lives at `scripts/generate-img-manifests.mjs`.
