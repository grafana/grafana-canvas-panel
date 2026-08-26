import { type DataFrame, type Field, FieldType, PluginState } from '@grafana/data';
import { type CanvasElementItem, type CanvasElementOptions } from './features/canvas/element';
import { type ElementState } from './features/canvas/runtime/element';

import type * as UtilsModule from './utils';

jest.mock('@grafana/runtime', () => {
  const { createTheme } = jest.requireActual('@grafana/data');
  const theme2 = createTheme();
  return {
    ...jest.requireActual('@grafana/runtime'),
    config: {
      panels: {},
      theme2,
    },
  };
});

describe('canvas utils - data transformations', () => {
  let getElementTypesOptions: typeof UtilsModule.getElementTypesOptions;
  let getElementTypes: typeof UtilsModule.getElementTypes;
  let isConnectionSource: typeof UtilsModule.isConnectionSource;
  let isConnectionTarget: typeof UtilsModule.isConnectionTarget;
  let getConnections: typeof UtilsModule.getConnections;
  let getElementFields: typeof UtilsModule.getElementFields;

  beforeAll(async () => {
    const utilsModule = await import('./utils');
    getElementTypesOptions = utilsModule.getElementTypesOptions;
    getElementTypes = utilsModule.getElementTypes;
    isConnectionSource = utilsModule.isConnectionSource;
    isConnectionTarget = utilsModule.isConnectionTarget;
    getConnections = utilsModule.getConnections;
    getElementFields = utilsModule.getElementFields;
  });

  describe('getElementTypes', () => {
    it('should return only default element types when shouldShowAdvancedTypes is false', () => {
      const result = getElementTypes(false, undefined);

      expect(result.options.length).toBeGreaterThan(0);
      expect(result.current).toEqual([]);
    });

    it('should return only default element types when shouldShowAdvancedTypes is undefined', () => {
      const result = getElementTypes(undefined, undefined);

      expect(result.options.length).toBeGreaterThan(0);
      expect(result.current).toEqual([]);
    });

    it('should return both default and advanced element types when shouldShowAdvancedTypes is true', () => {
      const resultWithoutAdvanced = getElementTypes(false, undefined);
      const resultWithAdvanced = getElementTypes(true, undefined);

      expect(resultWithAdvanced.options.length).toBeGreaterThan(resultWithoutAdvanced.options.length);
    });

    it('should mark current selection when provided', () => {
      const result = getElementTypes(false, 'text');

      expect(result.current.length).toBe(1);
      expect(result.current[0].value).toBe('text');
    });
  });

  describe('getElementTypesOptions', () => {
    it('should transform basic element items into selectable options', () => {
      const items: CanvasElementItem[] = [
        { id: 'rect', name: 'Rectangle', description: 'A rectangle' } as CanvasElementItem,
        { id: 'circle', name: 'Circle', description: 'A circle' } as CanvasElementItem,
      ];

      const result = getElementTypesOptions(items, undefined);

      expect(result.options).toEqual([
        { label: 'Rectangle', value: 'rect', description: 'A rectangle' },
        { label: 'Circle', value: 'circle', description: 'A circle' },
      ]);
    });

    it('should mark the current selection', () => {
      const items: CanvasElementItem[] = [
        { id: 'rect', name: 'Rectangle', description: 'A rectangle' } as CanvasElementItem,
      ];

      const result = getElementTypesOptions(items, 'rect');

      expect(result.current).toEqual([{ label: 'Rectangle', value: 'rect', description: 'A rectangle' }]);
    });

    it('should filter out alpha elements when debug panel is not alpha', () => {
      const items: CanvasElementItem[] = [
        { id: 'stable', name: 'Stable', description: 'stable', state: undefined } as CanvasElementItem,
        { id: 'alpha', name: 'Alpha', description: 'alpha', state: PluginState.alpha } as CanvasElementItem,
      ];

      const result = getElementTypesOptions(items, undefined);

      const values = result.options.map((o) => o.value);
      expect(values).toContain('stable');
      expect(values).not.toContain('alpha');
    });

    it('should include alpha elements with "(Alpha)" label when debug panel is alpha', () => {
      const { config } = jest.requireMock('@grafana/runtime');
      config.panels = { debug: { state: PluginState.alpha } };

      const items: CanvasElementItem[] = [
        { id: 'stable', name: 'Stable', description: 'stable', state: undefined } as CanvasElementItem,
        { id: 'alpha', name: 'Alpha', description: 'alpha', state: PluginState.alpha } as CanvasElementItem,
      ];

      const result = getElementTypesOptions(items, undefined);
      config.panels = {};

      const alphaOpt = result.options.find((o) => o.value === 'alpha');
      expect(alphaOpt).toBeDefined();
      expect(alphaOpt?.label).toContain('(Alpha)');
    });
  });

  describe('getConnections', () => {
    it('migrates a legacy string color to an object', () => {
      const element = {
        options: {
          connections: [{ targetName: 'b', color: '#ff0000' }],
        },
        parent: null,
      } as unknown as ElementState;
      const sceneByName = new Map<string, ElementState>([
        ['a', element],
        ['b', { options: {} } as unknown as ElementState],
      ]);

      const result = getConnections(sceneByName);

      expect(result[0].info.color).toEqual({ fixed: '#ff0000' });
    });

    it('migrates a legacy numeric size to a scale object', () => {
      const element = {
        options: {
          connections: [{ targetName: 'b', size: 5 }],
        },
        parent: null,
      } as unknown as ElementState;
      const sceneByName = new Map<string, ElementState>([
        ['a', element],
        ['b', { options: {} } as unknown as ElementState],
      ]);

      const result = getConnections(sceneByName);

      expect(result[0].info.size).toEqual({ fixed: 2, min: 1, max: 10 });
    });

    it('falls back to parent when targetName is not set', () => {
      const parent = { options: {} } as unknown as ElementState;
      const element = {
        options: { connections: [{ targetName: undefined }] },
        parent,
      } as unknown as ElementState;
      const sceneByName = new Map<string, ElementState>([['a', element]]);

      const result = getConnections(sceneByName);

      expect(result[0].target).toBe(parent);
    });
  });

  describe('isConnectionSource', () => {
    it('should return true when element has connections', () => {
      const element = {
        options: {
          connections: [{ targetName: 'someOtherElement' }],
        },
      } as unknown as ElementState;

      const result = isConnectionSource(element);

      expect(result).toBe(true);
    });

    it('should return falsy when element has no connections', () => {
      const element = {
        options: {},
      } as unknown as ElementState;

      const result = isConnectionSource(element);

      expect(result).toBeFalsy();
    });
  });

  describe('isConnectionTarget', () => {
    it('should return true when element is a target of a connection', () => {
      const targetElement = { options: {} } as unknown as ElementState;
      const source = {
        options: {
          connections: [{ targetName: 'target' }],
        },
        parent: null,
      } as unknown as ElementState;
      const sceneByName = new Map<string, ElementState>([
        ['source', source],
        ['target', targetElement],
      ]);

      const result = isConnectionTarget(targetElement, sceneByName);

      expect(result).toBe(true);
    });

    it('should return false when element is not a target of any connection', () => {
      const notTarget = { options: {} } as unknown as ElementState;
      const source = {
        options: {
          connections: [{ targetName: 'someOtherElement' }],
        },
        parent: null,
      } as unknown as ElementState;
      const sceneByName = new Map<string, ElementState>([
        ['source', source],
        ['notTarget', notTarget],
        ['someOtherElement', { options: {} } as unknown as ElementState],
      ]);

      const result = isConnectionTarget(notTarget, sceneByName);

      expect(result).toBe(false);
    });

    it('should return false when no connections exist', () => {
      const element = { options: {} } as unknown as ElementState;
      const sceneByName = new Map<string, ElementState>([['element', element]]);

      const result = isConnectionTarget(element, sceneByName);

      expect(result).toBe(false);
    });
  });

  describe('getElementFields', () => {
    it('should return empty array when no matching fields', () => {
      const frames: DataFrame[] = [
        {
          fields: [
            { name: 'field1', type: FieldType.string, values: [], config: {} } as Field,
            { name: 'field2', type: FieldType.number, values: [], config: {} } as Field,
          ],
          length: 0,
        } as DataFrame,
      ];
      const opts: Partial<CanvasElementOptions> = {};

      const result = getElementFields(frames, opts as CanvasElementOptions);

      expect(result).toEqual([]);
    });

    it('should extract background color field', () => {
      const colorField = { name: 'color', type: FieldType.string, values: [], config: {} } as Field;
      const frames: DataFrame[] = [
        {
          fields: [colorField, { name: 'other', type: FieldType.string, values: [], config: {} } as Field],
          length: 0,
        } as DataFrame,
      ];
      const opts: Partial<CanvasElementOptions> = {
        background: { color: { field: 'color', fixed: 'red' } },
      };

      const result = getElementFields(frames, opts as CanvasElementOptions);

      expect(result).toEqual([colorField]);
    });

    it('should extract text and color config fields', () => {
      const textField = { name: 'text', type: FieldType.string, values: [], config: {} } as Field;
      const colorField = { name: 'color', type: FieldType.string, values: [], config: {} } as Field;
      const frames: DataFrame[] = [
        {
          fields: [textField, colorField, { name: 'other', type: FieldType.string, values: [], config: {} } as Field],
          length: 0,
        } as DataFrame,
      ];
      const opts: Partial<CanvasElementOptions> = {
        config: {
          text: { field: 'text' },
          color: { field: 'color' },
        },
      };

      const result = getElementFields(frames, opts as CanvasElementOptions);

      expect(result).toContain(textField);
      expect(result).toContain(colorField);
      expect(result).toHaveLength(2);
    });

    it('should deduplicate fields when same field matches multiple configs', () => {
      const colorField = { name: 'color', type: FieldType.string, values: [], config: {} } as Field;
      const frames: DataFrame[] = [
        {
          fields: [colorField, { name: 'other', type: FieldType.string, values: [], config: {} } as Field],
          length: 0,
        } as DataFrame,
      ];
      const opts: Partial<CanvasElementOptions> = {
        background: { color: { field: 'color', fixed: 'red' } },
        border: { color: { field: 'color', fixed: 'blue' } },
        config: {
          color: { field: 'color' },
        },
      };

      const result = getElementFields(frames, opts as CanvasElementOptions);

      expect(result).toEqual([colorField]);
    });

    it('should handle multiple frames', () => {
      const field1 = { name: 'field1', type: FieldType.string, values: [], config: {} } as Field;
      const field2 = { name: 'field2', type: FieldType.string, values: [], config: {} } as Field;
      const frames: DataFrame[] = [
        { fields: [field1], length: 0 } as DataFrame,
        { fields: [field2], length: 0 } as DataFrame,
      ];
      const opts: Partial<CanvasElementOptions> = {
        background: { color: { field: 'field1', fixed: 'red' } },
        config: {
          text: { field: 'field2' },
        },
      };

      const result = getElementFields(frames, opts as CanvasElementOptions);

      expect(result).toContain(field1);
      expect(result).toContain(field2);
      expect(result).toHaveLength(2);
    });

    it('should handle undefined config', () => {
      const frames: DataFrame[] = [
        {
          fields: [{ name: 'field1', type: FieldType.string, values: [], config: {} } as Field],
          length: 0,
        } as DataFrame,
      ];
      const opts: Partial<CanvasElementOptions> = {
        config: undefined,
      };

      const result = getElementFields(frames, opts as CanvasElementOptions);

      expect(result).toEqual([]);
    });
  });
});
