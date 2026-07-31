## Project knowledge

This repository contains a **Grafana plugin**. You must Read @./.config/AGENTS/instructions.md before doing changes.

## GitHub Actions workflows

- Always pin `grafana/plugin-ci-workflows` references to a tagged release (e.g. `@ci-cd-workflows/v10.2.0`), never a commit SHA — even with a `# ci-cd-workflows/vX.Y.Z` comment. `plugin-ci-workflows` runs its own `check-for-release-channel` job internally and hard-fails any caller that pins it to a raw SHA. `push.yml` has a fast `check-workflow-pins` job that catches this early, but the underlying rule is: SHA-pin third-party actions in general, but not `grafana/plugin-ci-workflows` itself.
- Workflow file naming follows the convention used across Grafana-owned plugin repos: `push.yml` calls the reusable `ci.yml` (CI), `publish.yml` calls the reusable `cd.yml` (CD).
