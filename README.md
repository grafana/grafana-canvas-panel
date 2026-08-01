# Canvas panel plugin

[![Marketplace](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins%2Fgrafana-canvas-panel&label=Marketplace&query=%24.version&prefix=v&color=orange)](https://grafana.com/grafana/plugins/grafana-canvas-panel/)
[![Downloads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins%2Fgrafana-canvas-panel&label=Downloads&query=%24.downloads&color=blue)](https://grafana.com/grafana/plugins/grafana-canvas-panel/)
[![CI](https://github.com/grafana/grafana-canvas-panel/actions/workflows/push.yml/badge.svg)](https://github.com/grafana/grafana-canvas-panel/actions/workflows/push.yml)
[![CD](https://github.com/grafana/grafana-canvas-panel/actions/workflows/publish.yml/badge.svg)](https://github.com/grafana/grafana-canvas-panel/actions/workflows/publish.yml)
[![License](https://img.shields.io/github/license/grafana/grafana-canvas-panel)](https://github.com/grafana/grafana-canvas-panel/blob/main/LICENSE)

Draw pictures with the Canvas visualization panel plugin, then paint by numbers with your Grafana metrics data!

## Overview

Canvas is a composable panel where you place and style elements — rectangles, text, icons, images, and more — freely on
a grid, then bind their properties (position, color, text, visibility) to fields from your Grafana data. It's well
suited to building custom infographics, floor plans, network diagrams, and other visualizations that don't fit a
standard chart type.

This plugin is the externalized version of the Canvas panel that was previously built into Grafana core.

## Showcase

| | |
| --- | --- |
| ![A Canvas panel showing three service-status nodes (API, Database, Cache) connected by lines, each with a live-bound latency value](https://raw.githubusercontent.com/grafana/grafana-canvas-panel/main/src/img/screenshots/status-board.png) | ![Floor plan with sensor icons showing office (22°C), server room (68°C, alarm), and warehouse (18°C) temperatures](https://raw.githubusercontent.com/grafana/grafana-canvas-panel/main/src/img/screenshots/floorplan.png) |
| Service status board — connected nodes with live-bound status and latency | Floor plan sensor overlay — rooms as shapes, live data-bound status icons |
| ![Two wind turbines and a drone with live-bound RPM and battery values](https://raw.githubusercontent.com/grafana/grafana-canvas-panel/main/src/img/screenshots/fleet-monitor.png) | ![Two styled action buttons, "Restart service" and "Scale up", that call an API on click](https://raw.githubusercontent.com/grafana/grafana-canvas-panel/main/src/img/screenshots/action-buttons.png) |
| Turbine and drone fleet monitor — custom elements bound to live data | Interactive action buttons — Canvas elements can trigger API calls, not just display data |

The provisioned dashboards behind these screenshots live under
[`provisioning/dashboards/`](https://github.com/grafana/grafana-canvas-panel/tree/main/provisioning/dashboards)
(`canvas_showcase*.json`) — run `npm run server` to load them locally.

## Documentation

- See complete documentation at
  [grafana.com](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/canvas/)

## Changelog

- [`CHANGELOG.md`](./CHANGELOG.md) — release history

## Contributing

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — development setup, building, testing, and linting
