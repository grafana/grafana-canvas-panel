import { createTheme } from '@grafana/data';
import { config } from '@grafana/runtime';
import { ConnectionDirection } from '@grafana/schema';

import { type ElementState } from './features/canvas/runtime/element';
import { type Scene } from './features/canvas/runtime/scene';
import { type ConnectionState, LineStyle } from './types';
import {
  applyStyles,
  calculateAbsoluteCoords,
  calculateAngle,
  calculateCoordinates,
  calculateDistance,
  calculateMidpoint,
  getConnectionsByTarget,
  getConnectionStyles,
  getParentBoundingClientRect,
  getRowIndex,
  removeStyles,
  updateConnectionsForSource,
} from './utils';

describe('utils geometry helpers', () => {
  describe('calculateMidpoint', () => {
    it.each([
      { name: 'should calculate midpoint of horizontal line', input: [0, 0, 10, 0] as const, expected: { x: 5, y: 0 } },
      { name: 'should calculate midpoint of vertical line', input: [0, 0, 0, 10] as const, expected: { x: 0, y: 5 } },
      { name: 'should calculate midpoint of diagonal line', input: [0, 0, 10, 10] as const, expected: { x: 5, y: 5 } },
      { name: 'should handle negative coordinates', input: [-10, -10, 10, 10] as const, expected: { x: 0, y: 0 } },
      {
        name: 'should handle floating point coordinates',
        input: [1.5, 2.5, 3.5, 4.5] as const,
        expected: { x: 2.5, y: 3.5 },
      },
      { name: 'should handle same point (zero distance)', input: [5, 5, 5, 5] as const, expected: { x: 5, y: 5 } },
    ])('$name', ({ input, expected }) => {
      const [x1, y1, x2, y2] = input;
      expect(calculateMidpoint(x1, y1, x2, y2)).toEqual(expected);
    });
  });

  describe('calculateAbsoluteCoords', () => {
    it.each([
      {
        name: 'should calculate absolute coordinates at origin',
        input: [0, 0, 10, 10, 0, 0, 10, 10] as const,
        expected: { x: 0, y: 0 },
      },
      {
        name: 'should calculate absolute coordinates at midpoint',
        input: [0, 0, 10, 10, 0.5, 0.5, 10, 10] as const,
        expected: { x: 5, y: 5 },
      },
      {
        name: 'should calculate absolute coordinates at end point',
        input: [0, 0, 10, 10, 1, 1, 10, 10] as const,
        expected: { x: 10, y: 10 },
      },
      {
        name: 'should handle negative deltas',
        input: [10, 10, 0, 0, 0.5, 0.5, -10, -10] as const,
        expected: { x: 5, y: 5 },
      },
      {
        name: 'should handle horizontal line',
        input: [0, 5, 10, 5, 0.5, 0, 10, 0] as const,
        expected: { x: 5, y: 5 },
      },
      {
        name: 'should handle vertical line',
        input: [5, 0, 5, 10, 0, 0.5, 0, 10] as const,
        expected: { x: 5, y: 5 },
      },
      {
        name: 'should handle zero valueX and valueY',
        input: [10, 20, 30, 40, 0, 0, 20, 20] as const,
        expected: { x: 10, y: 20 },
      },
    ])('$name', ({ input, expected }) => {
      const [x1, y1, x2, y2, valueX, valueY, deltaX, deltaY] = input;
      expect(calculateAbsoluteCoords(x1, y1, x2, y2, valueX, valueY, deltaX, deltaY)).toEqual(expected);
    });
  });

  describe('calculateDistance', () => {
    it.each([
      { name: 'should calculate distance for horizontal line', input: [0, 0, 10, 0] as const, expected: 10 },
      { name: 'should calculate distance for vertical line', input: [0, 0, 0, 10] as const, expected: 10 },
      { name: 'should calculate distance for diagonal (3-4-5 triangle)', input: [0, 0, 3, 4] as const, expected: 5 },
      {
        name: 'should calculate distance for diagonal (5-12-13 triangle)',
        input: [0, 0, 5, 12] as const,
        expected: 13,
      },
      { name: 'should handle negative coordinates', input: [-3, -4, 0, 0] as const, expected: 5 },
      { name: 'should handle zero distance (same point)', input: [5, 5, 5, 5] as const, expected: 0 },
      { name: 'should handle floating point coordinates', input: [0, 0, 1.5, 2] as const, expected: 2.5 },
      { name: 'should calculate unit distance', input: [0, 0, 1, 0] as const, expected: 1 },
    ])('$name', ({ input, expected }) => {
      const [x1, y1, x2, y2] = input;
      expect(calculateDistance(x1, y1, x2, y2)).toBeCloseTo(expected, 10);
    });
  });

  describe('calculateAngle', () => {
    it.each([
      { name: 'should calculate angle for horizontal right (0 degrees)', input: [0, 0, 10, 0] as const, expected: 0 },
      {
        name: 'should calculate angle for vertical down (90 degrees)',
        input: [0, 0, 0, 10] as const,
        expected: Math.PI / 2,
      },
      {
        name: 'should calculate angle for horizontal left (180 degrees)',
        input: [0, 0, -10, 0] as const,
        expected: Math.PI,
      },
      {
        name: 'should calculate angle for vertical up (-90 degrees)',
        input: [0, 0, 0, -10] as const,
        expected: -Math.PI / 2,
      },
      { name: 'should calculate angle for 45 degrees diagonal', input: [0, 0, 10, 10] as const, expected: Math.PI / 4 },
      { name: 'should handle same point (undefined angle)', input: [5, 5, 5, 5] as const, expected: 0 },
      { name: 'should handle negative starting coordinates', input: [-5, -5, 5, 5] as const, expected: Math.PI / 4 },
    ])('$name', ({ input, expected }) => {
      const [x1, y1, x2, y2] = input;
      expect(calculateAngle(x1, y1, x2, y2)).toBeCloseTo(expected, 10);
    });
  });
});

describe('applyStyles / removeStyles', () => {
  it('applies CSS properties to a div', () => {
    const div = document.createElement('div');
    applyStyles({ color: 'red', opacity: '0.5' }, div);
    expect(div.style.color).toBe('red');
    expect(div.style.opacity).toBe('0.5');
  });

  it('removes CSS properties from a div', () => {
    const div = document.createElement('div');
    div.style.color = 'red';
    div.style.opacity = '0.5';
    removeStyles({ color: 'red', opacity: '0.5' }, div);
    expect(div.style.color).toBe('');
    expect(div.style.opacity).toBe('');
  });

  it('removeStyles ignores properties not present on the element', () => {
    const div = document.createElement('div');
    expect(() => removeStyles({ color: 'blue' }, div)).not.toThrow();
  });
});

describe('calculateCoordinates', () => {
  const sourceRect: DOMRect = {
    left: 100,
    top: 100,
    width: 50,
    height: 50,
    right: 150,
    bottom: 150,
    x: 100,
    y: 100,
    toJSON: () => ({}),
  };
  const parentRect: DOMRect = {
    left: 0,
    top: 0,
    width: 800,
    height: 600,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };

  it('computes connection coordinates for a named target', () => {
    const targetRect: DOMRect = {
      left: 300,
      top: 200,
      width: 60,
      height: 60,
      right: 360,
      bottom: 260,
      x: 300,
      y: 200,
      toJSON: () => ({}),
    };
    const target = { div: { getBoundingClientRect: () => targetRect } } as never;
    const info = { source: { x: 0, y: 0 }, target: { x: 0, y: 0 }, targetName: 'el', path: 'straight' } as never;

    const result = calculateCoordinates(sourceRect, parentRect, info, target, 1);

    expect(result.x1).toBeCloseTo(125);
    expect(result.y1).toBeCloseTo(125);
    expect(result.x2).toBeCloseTo(330);
    expect(result.y2).toBeCloseTo(230);
  });

  it('uses parent center when targetName is absent', () => {
    const target = { div: undefined } as never;
    const info = { source: { x: 0, y: 0 }, target: { x: 0, y: 0 }, targetName: undefined, path: 'straight' } as never;

    const result = calculateCoordinates(sourceRect, parentRect, info, target, 1);

    expect(result.x2).toBeCloseTo(400);
    expect(result.y2).toBeCloseTo(300);
  });

  it('applies transformScale', () => {
    const targetRect: DOMRect = {
      left: 300,
      top: 200,
      width: 60,
      height: 60,
      right: 360,
      bottom: 260,
      x: 300,
      y: 200,
      toJSON: () => ({}),
    };
    const target = { div: { getBoundingClientRect: () => targetRect } } as never;
    const info = { source: { x: 0, y: 0 }, target: { x: 0, y: 0 }, targetName: 'el', path: 'straight' } as never;

    const scaled = calculateCoordinates(sourceRect, parentRect, info, target, 2);
    const unscaled = calculateCoordinates(sourceRect, parentRect, info, target, 1);

    expect(scaled.x1).toBeCloseTo(unscaled.x1 / 2);
    expect(scaled.y1).toBeCloseTo(unscaled.y1 / 2);
  });

  it('offsets x2 by 1 to avoid zero-length horizontal connections', () => {
    const targetRect: DOMRect = {
      left: 75,
      top: 100,
      width: 50,
      height: 50,
      right: 125,
      bottom: 150,
      x: 75,
      y: 100,
      toJSON: () => ({}),
    };
    const target = { div: { getBoundingClientRect: () => targetRect } } as never;
    const info = { source: { x: 0, y: 0 }, target: { x: 0, y: 0 }, targetName: 'el', path: 'straight' } as never;

    const result = calculateCoordinates(sourceRect, parentRect, info, target, 1);

    expect(result.x2 - result.x1).not.toBe(0);
  });
});

describe('getRowIndex', () => {
  const mockScene = (fields: Array<{ name: string; values: unknown[] }>) =>
    ({
      data: {
        series: [{ fields: fields.map((f) => ({ name: f.name, values: f.values })) }],
      },
    }) as never;

  it('returns the last index of the named field', () => {
    const scene = mockScene([{ name: 'v', values: [10, 20, 30] }]);
    expect(getRowIndex('v', scene)).toBe(2);
  });

  it('returns 0 when the field name is not found', () => {
    const scene = mockScene([{ name: 'v', values: [1, 2] }]);
    expect(getRowIndex('missing', scene)).toBe(0);
  });

  it('returns 0 when fieldName is undefined', () => {
    const scene = mockScene([{ name: 'v', values: [1] }]);
    expect(getRowIndex(undefined, scene)).toBe(0);
  });
});

describe('getParentBoundingClientRect', () => {
  const mockRect = { left: 10, top: 20, width: 800, height: 600 } as DOMRect;

  it('returns scene.div rect when canvasPanelPanZoom is off', () => {
    config.featureToggles = { canvasPanelPanZoom: false } as never;
    const scene = { div: { getBoundingClientRect: () => mockRect } } as never;
    expect(getParentBoundingClientRect(scene)).toBe(mockRect);
  });

  it('returns scene.viewportDiv rect when canvasPanelPanZoom is on', () => {
    config.featureToggles = { canvasPanelPanZoom: true } as never;
    const viewportRect = { left: 0, top: 0, width: 1024, height: 768 } as DOMRect;
    const scene = { viewportDiv: { getBoundingClientRect: () => viewportRect } } as never;
    expect(getParentBoundingClientRect(scene)).toBe(viewportRect);
  });
});

describe('getConnectionsByTarget', () => {
  const makeElement = (name: string): ElementState => ({ getName: () => name, options: {} }) as unknown as ElementState;

  it('returns connections that point to the given element', () => {
    const target = makeElement('target');
    const other = makeElement('other');
    const connections: ConnectionState[] = [
      { target, source: makeElement('s1'), info: {} as never, index: 0 },
      { target: other, source: makeElement('s2'), info: {} as never, index: 0 },
    ];
    const scene = { connections: { state: connections } } as unknown as Scene;

    expect(getConnectionsByTarget(target, scene)).toHaveLength(1);
    expect(getConnectionsByTarget(target, scene)[0].target).toBe(target);
  });

  it('returns empty array when no connections target the element', () => {
    const el = makeElement('el');
    const scene = { connections: { state: [] } } as unknown as Scene;
    expect(getConnectionsByTarget(el, scene)).toHaveLength(0);
  });
});

describe('updateConnectionsForSource', () => {
  const makeElement = (name: string, connections: Array<{ targetName: string }> = []): ElementState =>
    ({
      getName: () => name,
      options: { connections },
      onChange: jest.fn(),
    }) as unknown as ElementState;

  it('removes connections pointing at the deleted element', () => {
    const target = makeElement('target');
    const source = makeElement('source', [{ targetName: 'target' }, { targetName: 'other' }]);
    const connections: ConnectionState[] = [{ target, source, info: {} as never, index: 0 }];
    const scene = {
      connections: {
        state: connections,
        updateState: jest.fn(),
      },
    } as unknown as Scene;

    updateConnectionsForSource(target, scene);

    expect(jest.mocked(source.onChange)).toHaveBeenCalledWith(
      expect.objectContaining({
        connections: [{ targetName: 'other' }],
      })
    );
    expect(jest.mocked(scene.connections.updateState)).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when no connections target the element', () => {
    const el = makeElement('el');
    const updateState = jest.fn();
    const scene = {
      connections: { state: [], updateState },
    } as unknown as Scene;

    updateConnectionsForSource(el, scene);

    expect(updateState).toHaveBeenCalledTimes(1);
  });
});

describe('getConnectionStyles', () => {
  const theme = createTheme();
  const defaultArrowSize = 2;
  const defaultArrowDirection = ConnectionDirection.Forward;

  const makeSceneContext = (overrides: Record<string, unknown> = {}) => ({
    getColor: (_cfg: unknown) => ({ value: () => 'rgba(0,0,0,1)' }),
    getScale: (_cfg: unknown) => ({ get: (_i: number) => 3 }),
    getDirection: (_cfg: unknown) => ({ get: (_i: number) => ConnectionDirection.Reverse }),
    ...overrides,
  });

  const makeScene = (contextOverrides: Record<string, unknown> = {}) =>
    ({
      data: { series: [] },
      connections: { state: [] },
      context: makeSceneContext(contextOverrides),
    }) as unknown as Scene;

  beforeEach(() => {
    config.theme2 = theme;
  });

  it('uses defaults when info has no color, size, direction, or lineStyle', () => {
    const scene = makeScene();
    const info = { source: { x: 0, y: 0 }, target: { x: 1, y: 1 } } as never;

    const result = getConnectionStyles(info, scene, defaultArrowSize, defaultArrowDirection);

    expect(result.strokeColor).toBe(theme.colors.text.primary);
    expect(result.strokeWidth).toBe(defaultArrowSize);
    expect(result.arrowDirection).toBe(defaultArrowDirection);
    expect(result.lineStyle).toBeDefined();
    expect(result.shouldAnimate).toBeUndefined();
  });

  it('reads strokeColor from scene.context.getColor when info.color is set', () => {
    const scene = makeScene();
    const info = { color: { fixed: 'red' }, source: { x: 0, y: 0 }, target: { x: 1, y: 1 } } as never;

    const result = getConnectionStyles(info, scene, defaultArrowSize, defaultArrowDirection);

    expect(result.strokeColor).toBe('rgba(0,0,0,1)');
  });

  it('reads strokeWidth from scene.context.getScale when info.size is set', () => {
    const scene = makeScene();
    const info = { size: { fixed: 5, min: 1, max: 10 }, source: { x: 0, y: 0 }, target: { x: 1, y: 1 } } as never;

    const result = getConnectionStyles(info, scene, defaultArrowSize, defaultArrowDirection);

    expect(result.strokeWidth).toBe(3);
  });

  it('reads arrowDirection from scene.context.getDirection when info.direction is set', () => {
    const scene = makeScene();
    const info = {
      direction: { mode: 'fixed', fixed: 'forward' },
      source: { x: 0, y: 0 },
      target: { x: 1, y: 1 },
    } as never;

    const result = getConnectionStyles(info, scene, defaultArrowSize, defaultArrowDirection);

    expect(result.arrowDirection).toBe(ConnectionDirection.Reverse);
  });

  it.each([
    { style: LineStyle.Dashed, expected: '8 8' },
    { style: LineStyle.Dotted, expected: '3' },
    { style: undefined, expected: '0' },
  ])('maps lineStyle $style to the correct StrokeDasharray', ({ style, expected }) => {
    const scene = makeScene();
    const info = { lineStyle: { style }, source: { x: 0, y: 0 }, target: { x: 1, y: 1 } } as never;

    const result = getConnectionStyles(info, scene, defaultArrowSize, defaultArrowDirection);

    expect(result.lineStyle).toBe(expected);
  });

  it('exposes animate flag from info.lineStyle', () => {
    const scene = makeScene();
    const info = { lineStyle: { animate: true }, source: { x: 0, y: 0 }, target: { x: 1, y: 1 } } as never;

    const result = getConnectionStyles(info, scene, defaultArrowSize, defaultArrowDirection);

    expect(result.shouldAnimate).toBe(true);
  });
});
