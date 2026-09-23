# Contributing Guide

> Internal reference, to be removed eventually:
>
> - [`RUN_EXTERNALIZED_PLUGIN_LOCALLY.md`](./RUN_EXTERNALIZED_PLUGIN_LOCALLY.md) — how to run this
>   plugin against a local Grafana core checkout
> - [`CODE_MIGRATION_PLAN.md`](./CODE_MIGRATION_PLAN.md) — background on the Canvas-from-core
>   externalization effort

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Build plugin in development mode and run in watch mode

   ```bash
   npm run dev
   ```

3. Build plugin in production mode

   ```bash
   npm run build
   ```

4. Run the tests (using Jest)

   ```bash
   # Runs the tests and watches for changes, requires git init first
   npm run test

   # Exits after running all the tests
   npm run test:ci
   ```

5. Spin up a Grafana instance and run the plugin inside it (using Docker)

   ```bash
   npm run server
   ```

6. Run the E2E tests (using Playwright)

   ```bash
   # Spins up a Grafana instance first that we tests against
   npm run server

   # If you wish to start a certain Grafana version. If not specified will use latest by default
   GRAFANA_VERSION=13.2.0 npm run server

   # Run several instances side by side on different ports and versions.
   # Each port gets its own compose project, container and network.
   # Pass the same GRAFANA_PORT to `npm run e2e` to test against that instance.
   GRAFANA_VERSION=12.4.0 GRAFANA_PORT=3002 npm run server

   # Load this repo's build instead of the core Canvas panel
   # (sets [plugin.canvas] as_external = true)
   CANVAS_AS_EXTERNAL=true npm run server

   # Starts the tests
   npm run e2e
   ```

7. Run the linter

   ```bash
   npm run lint

   # or

   npm run lint:fix
   ```
