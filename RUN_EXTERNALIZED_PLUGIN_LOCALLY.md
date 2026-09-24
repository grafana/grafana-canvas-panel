# Running locally with this repo

### Prerequisites

- Grafana core repo checked out at `../grafana`
- This repo's plugin built: `npm run dev` (watch) or `npm run build`

### `conf/custom.ini`

Create or update `../grafana/conf/custom.ini`:

```ini
app_mode = development

[paths]
plugins = /path/to/grafana-canvas-panel

[plugins]
allow_loading_unsigned_plugins = grafana-canvas-panel

[plugin.canvas]
as_external = true

[plugin.grafana-canvas-panel]
alias_ids = canvas
```

> **Note:** `[paths] plugins` must point to the **parent** directory of `dist/` — i.e. the root of this repo, not `dist/` itself. Grafana scans one level of subdirectories for `plugin.json`.


### Start all three processes

**Terminal 1** — plugin (in this repo):

```bash
npm run dev
```

**Terminal 2** — Grafana backend (in `../grafana`):

```bash
make run
```

**Terminal 3** — Grafana frontend (in `../grafana`):

```bash
yarn start
```

Grafana will be available at http://localhost:3000 (admin/admin).

### Verify it's working

```bash
curl -s -u admin:admin http://localhost:3000/api/plugins/grafana-canvas-panel/settings | jq '.module'
# should return: "public/plugins/grafana-canvas-panel/module.js"
```
