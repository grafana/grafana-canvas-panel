import { type Page } from '@playwright/test';

import { expect } from '@grafana/plugin-e2e';

export const FLOORPLAN_DASHBOARD = 'canvas_showcase_floorplan.json';

// Icons and values sit in the middle of each room, so click near its top-left corner.
const CORNER = { x: 8, y: 8 };

const getRoom = (page: Page, label: string) =>
  page
    .getByTestId('canvas-scene')
    .getByRole('button')
    .filter({ has: page.getByText(label, { exact: true }) });

/**
 * A button in the layer tree editor, matched by its visible text. Grafana's
 * Select inputs also have icon buttons labelled "Clear selection".
 */
export const getTreeEditorButton = (page: Page, text: string) =>
  page.getByRole('button').filter({ hasText: new RegExp(`^${text}$`) });

/** Selects two floorplan rooms on the canvas: click the first, shift+click the second. */
export const selectOfficeAndServerRoom = async (page: Page) => {
  // The floorplan dashboard ships with inline editing off, which disables canvas selection.
  const inlineEditing = page.getByRole('switch', { name: /^Inline editing/ });
  await inlineEditing.setChecked(true, { force: true });
  await expect(inlineEditing).toBeChecked();

  await getRoom(page, 'Office').click({ position: CORNER });
  await expect(getTreeEditorButton(page, 'Clear selection')).toBeVisible();
  await getRoom(page, 'Server room').click({ position: CORNER, modifiers: ['Shift'] });
};
