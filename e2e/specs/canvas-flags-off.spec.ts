import { test, expect } from '@grafana/plugin-e2e';

import { FLOORPLAN_DASHBOARD, getTreeEditorButton, selectOfficeAndServerRoom } from '../utils/canvasSelection';

// Flags are set explicitly through OpenFeature so the specs do not depend on
// the server's feature toggle defaults. openFeature is worker-scoped, so each
// flag combination needs its own spec file.
test.use({
  featureToggles: { dashboardNewLayouts: false },
  openFeature: { flags: { canvasPanelPanZoom: false, canvasPanelNesting: false } },
});

test.describe('Canvas Panel - flags off', () => {
  test('renders the plain scene and hides the pan and zoom options', async ({ gotoDashboardPage, page }) => {
    const dashboardPage = await gotoDashboardPage({});
    const panelEditPage = await dashboardPage.addPanel();
    await panelEditPage.setVisualization('Canvas');

    await expect(page.getByTestId('canvas-scene')).toBeVisible();
    await expect(page.getByTestId('canvas-scene-pan-zoom')).toHaveCount(0);
    await expect(page.getByRole('switch', { name: 'Pan and zoom' })).toHaveCount(0);
    await expect(page.getByRole('switch', { name: 'Zoom to content' })).toHaveCount(0);
  });

  test('hides Frame selection when two elements are selected', async ({
    gotoPanelEditPage,
    readProvisionedDashboard,
    page,
  }) => {
    const dashboard = await readProvisionedDashboard({ fileName: FLOORPLAN_DASHBOARD });
    await gotoPanelEditPage({ dashboard, id: '1' });

    await selectOfficeAndServerRoom(page);
    await expect(getTreeEditorButton(page, 'Clear selection')).toBeVisible();
    await expect(getTreeEditorButton(page, 'Frame selection')).toHaveCount(0);
  });
});
