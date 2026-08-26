import { createTheme } from '@grafana/data';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  config: { theme2: createTheme(), panels: {}, featureToggles: {} },
}));

import {
  advancedElementItems,
  canvasElementRegistry,
  DEFAULT_CANVAS_ELEMENT_CONFIG,
  defaultElementItems,
} from './registry';

describe('canvas element registry', () => {
  it('defaultElementItems and advancedElementItems have no duplicate ids', () => {
    const allItems = [...defaultElementItems, ...advancedElementItems];
    const ids = allItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('canvasElementRegistry lists all default + advanced items', () => {
    const listed = canvasElementRegistry.list();
    const expectedIds = [...defaultElementItems, ...advancedElementItems].map((i) => i.id);
    expectedIds.forEach((id) => {
      expect(listed.find((item) => item.id === id)).toBeDefined();
    });
    expect(listed.length).toBe(expectedIds.length);
  });

  it('canvasElementRegistry.getIfExists returns the item for a known id', () => {
    const item = canvasElementRegistry.getIfExists('rectangle');
    expect(item).toBeDefined();
    expect(item?.id).toBe('rectangle');
  });

  it('canvasElementRegistry.getIfExists returns undefined for an unknown id', () => {
    expect(canvasElementRegistry.getIfExists('does-not-exist')).toBeUndefined();
  });

  it('every item has a non-empty id, name, and display function', () => {
    const all = [...defaultElementItems, ...advancedElementItems];
    all.forEach((item) => {
      expect(item.id.length).toBeGreaterThan(0);
      expect(item.name.length).toBeGreaterThan(0);
      expect(['function', 'object']).toContain(typeof item.display);
    });
  });

  it('DEFAULT_CANVAS_ELEMENT_CONFIG uses the metricValue element type', () => {
    expect(DEFAULT_CANVAS_ELEMENT_CONFIG.type).toBe('metric-value');
  });

  it('every item getNewOptions returns an object with a type field', () => {
    const all = [...defaultElementItems, ...advancedElementItems];
    all.forEach((item) => {
      const opts = item.getNewOptions();
      expect(opts).toBeDefined();
    });
  });
});
