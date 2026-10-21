import { test, expect } from '@grafana/plugin-e2e';

import { FLOORPLAN_DASHBOARD, getTreeEditorButton, selectOfficeAndServerRoom } from '../utils/canvasSelection';

// canvas-flags-off.spec.ts covers the same steps with nesting off.
test.use({
  openFeature: { flags: { canvasPanelPanZoom: false, canvasPanelNesting: true } },
});

test.describe('Canvas Panel - nesting flag on', () => {
  test('offers Frame selection when two elements are selected', async ({
    gotoPanelEditPage,
    readProvisionedDashboard,
    page,
  }) => {
    const dashboard = await readProvisionedDashboard({ fileName: FLOORPLAN_DASHBOARD });
    await gotoPanelEditPage({ dashboard, id: '1' });

    await selectOfficeAndServerRoom(page);
    await expect(getTreeEditorButton(page, 'Frame selection')).toBeVisible();
  });
});
