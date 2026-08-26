import { createTheme } from '@grafana/data';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  config: { theme2: createTheme(), panels: {}, featureToggles: {} },
}));

import { serverItem } from './server';

const makeDimensionContext = (colorValue = 'green', scalarValue = 2) => ({
  getColor: () => ({ value: () => colorValue }),
  getScale: () => ({ value: () => scalarValue }),
  getScalar: () => ({ value: () => scalarValue }),
  getDirection: () => ({ get: () => 0 }),
  getText: () => ({ value: () => '' }),
  getResource: () => ({ value: () => '' }),
});

describe('serverItem', () => {
  describe('getNewOptions', () => {
    it('returns a valid config with default server type', () => {
      const opts = serverItem.getNewOptions();
      expect(opts.config?.type).toBe('Single');
    });

    it('merges provided placement options', () => {
      const opts = serverItem.getNewOptions({ placement: { top: 10, left: 20 } } as never);
      expect(opts.placement?.top).toBe(10);
      expect(opts.placement?.left).toBe(20);
      expect(opts.placement?.width).toBe(100);
      expect(opts.placement?.height).toBe(100);
    });

    it('sets transparent background', () => {
      const opts = serverItem.getNewOptions();
      expect(opts.background?.color?.fixed).toBe('transparent');
    });

    it('defaults links to an empty array', () => {
      const opts = serverItem.getNewOptions();
      expect(opts.links).toEqual([]);
    });

    it('preserves existing links when provided', () => {
      const links = [{ title: 'Test', url: 'http://test.com' }];
      const opts = serverItem.getNewOptions({ links } as never);
      expect(opts.links).toBe(links);
    });
  });

  describe('prepareData', () => {
    it('resolves blinkRate from dimension context when configured', () => {
      const ctx = makeDimensionContext('blue', 5);
      const opts = { config: { type: 'Single', blinkRate: { fixed: 5, min: 0, max: 100 } } } as never;
      const data = serverItem.prepareData!(ctx as never, opts);
      expect(data.blinkRate).toBe(5);
    });

    it('defaults blinkRate to 0 when not configured', () => {
      const ctx = makeDimensionContext();
      const opts = { config: { type: 'Single' } } as never;
      const data = serverItem.prepareData!(ctx as never, opts);
      expect(data.blinkRate).toBe(0);
    });

    it('resolves statusColor from dimension context when configured', () => {
      const ctx = makeDimensionContext('red');
      const opts = { config: { type: 'Single', statusColor: { fixed: 'red' } } } as never;
      const data = serverItem.prepareData!(ctx as never, opts);
      expect(data.statusColor).toBe('red');
    });

    it('defaults statusColor to transparent when not configured', () => {
      const ctx = makeDimensionContext();
      const opts = { config: { type: 'Single' } } as never;
      const data = serverItem.prepareData!(ctx as never, opts);
      expect(data.statusColor).toBe('transparent');
    });

    it('resolves bulbColor from dimension context when configured', () => {
      const ctx = makeDimensionContext('yellow');
      const opts = { config: { type: 'Single', bulbColor: { fixed: 'yellow' } } } as never;
      const data = serverItem.prepareData!(ctx as never, opts);
      expect(data.bulbColor).toBe('yellow');
    });

    it('defaults bulbColor to green when not configured', () => {
      const ctx = makeDimensionContext();
      const opts = { config: { type: 'Single' } } as never;
      const data = serverItem.prepareData!(ctx as never, opts);
      expect(data.bulbColor).toBe('green');
    });

    it('passes through the server type', () => {
      const ctx = makeDimensionContext();
      const opts = { config: { type: 'Database' } } as never;
      const data = serverItem.prepareData!(ctx as never, opts);
      expect(data.type).toBe('Database');
    });
  });
});
