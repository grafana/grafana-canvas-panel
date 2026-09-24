import { test, expect } from '@grafana/plugin-e2e';

test('external Canvas renders, pins, and closes a field tooltip', async ({
  page,
  gotoDashboardPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'canvas_showcase.json' });
  const pluginLoaded = page.waitForResponse(
    (response) => response.url().includes('/public/plugins/canvas/module.js') && response.ok()
  );
  await gotoDashboardPage({ uid: dashboard.uid });
  // Ensure this exercises the external build, not Grafana's bundled Canvas.
  await pluginLoaded;

  const value = page.getByRole('button', { name: '42 ms', exact: true });
  await expect(value).toBeVisible();
  await value.hover();
  const tooltip = page.getByRole('dialog');
  await expect(tooltip.getByText('API latency', { exact: true })).toBeVisible();
  await expect(tooltip.getByText('api_latency', { exact: true })).toBeVisible();
  await expect(tooltip.getByText('42 ms', { exact: true })).toBeVisible();

  await value.click();
  await tooltip.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(tooltip).toBeHidden();
});
