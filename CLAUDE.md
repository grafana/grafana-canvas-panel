## Project knowledge

This repository contains a **Grafana plugin**. You must Read @./.config/AGENTS/instructions.md before doing changes.

## GitHub Actions workflows

- SHA-pin third-party actions, but pin `grafana/plugin-ci-workflows` to a tagged release (e.g. `@ci-cd-workflows/v10.2.0`) instead — it rejects SHA pins, even with a version comment, and fails the build. See the [release channel docs](https://enghub.grafana-ops.net/docs/default/component/grafana-plugins-platform/plugins-ci-github-actions/010-plugins-ci-github-actions/#versions-and-release-channels).
- Workflow file naming follows the convention used across Grafana-owned plugin repos: `push.yml` calls the reusable `ci.yml` (CI), `publish.yml` calls the reusable `cd.yml` (CD).
