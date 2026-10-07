import { test, expect } from '@grafana/plugin-e2e';

const DASHBOARD_UID = 'canvas-showcase-action';

// Needs the vizActionsAuth feature toggle and the Infinity datasource provisioned
// as "Infinity" (see docker-compose.yaml and provisioning/datasources).
test.describe('Canvas Panel - Action connection picker', () => {
  test('lists Infinity datasources as action connections', async ({
    gotoPanelEditPage,
    readProvisionedDashboard,
    selectors,
  }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'canvas_showcase_action.json' });
    expect(dashboard.uid).toBe(DASHBOARD_UID);
    const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });
    const page = panelEditPage.ctx.page;
    const modal = page.getByRole('dialog', { name: 'Add action' });
    const connection = modal.getByRole('combobox', { name: 'Connection' });

    await test.step('Open the add action modal for an element', async () => {
      await page
        .getByRole('tree')
        .getByRole('treeitem', { name: /^Scale up button/ })
        .getByRole('button', { name: 'Scale up button', exact: true })
        .click();
      await page.getByRole('button', { name: 'Add action' }).click();
      await expect(modal).toBeVisible();
    });

    await test.step('Infinity is listed next to the direct option', async () => {
      await connection.click();
      const options = panelEditPage.getByGrafanaSelector(selectors.components.Select.option);
      await expect(options).toHaveCount(2);
      await expect(options.nth(0)).toContainText('Direct from browser');
      await expect(options.nth(1)).toContainText('Infinity');
    });

    await test.step('Selecting Infinity keeps it as the connection', async () => {
      await panelEditPage.getByGrafanaSelector(selectors.components.Select.option).nth(1).click();
      await expect(modal.getByText('Infinity', { exact: true })).toBeVisible();
    });
  });
});
