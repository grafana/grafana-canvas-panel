import { defineConfig } from 'eslint/config';
import baseConfig from './.config/eslint.config.mjs';
import grafanaI18nPlugin from '@grafana/i18n/eslint-plugin';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default defineConfig([
  {
    ignores: [
      '**/logs',
      '**/*.log',
      '**/npm-debug.log*',
      '**/yarn-debug.log*',
      '**/yarn-error.log*',
      '**/.pnpm-debug.log*',
      '**/node_modules/',
      '.yarn/cache',
      '.yarn/unplugged',
      '.yarn/build-state.yml',
      '.yarn/install-state.gz',
      '**/.pnp.*',
      '**/pids',
      '**/*.pid',
      '**/*.seed',
      '**/*.pid.lock',
      '**/lib-cov',
      '**/coverage',
      '**/dist/',
      '**/artifacts/',
      '**/work/',
      '**/ci/',
      'test-results/',
      'playwright-report/',
      'blob-report/',
      'playwright/.cache/',
      'playwright/.auth/',
      '**/.idea',
      '**/.eslintcache',
    ],
  },
  ...baseConfig,
  {
    plugins: {
      '@grafana/i18n': grafanaI18nPlugin,
      'jsx-a11y': jsxA11y,
      '@grafana': {
        rules: {
          'no-unreduced-motion': { create: () => ({}) },
        },
      },
    },
    rules: {
      '@grafana/no-unreduced-motion': 'off',
    },
  },
]);
