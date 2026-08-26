import {
  createTheme,
  type DataFrame,
  type Field,
  FieldColorModeId,
  FieldType,
  ReducerID,
  toDataFrame,
} from '@grafana/data';
import {
  ConnectionDirection,
  DirectionDimensionMode,
  ResourceDimensionMode,
  type ScaleDimensionConfig,
  ScalarDimensionMode,
  TextDimensionMode,
} from '@grafana/schema';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  config: { theme2: createTheme(), panels: {} },
}));

import {
  findField,
  findFieldIndex,
  getColorDimensionFromData,
  getDirectionDimensionFromData,
  getLastNotNullFieldValue,
  getResourceDimensionFromData,
  getScalarDimensionFromData,
  getScaleDimensionFromData,
  getTextDimensionFromData,
} from './utils';

function makeFrame(fields: Array<Partial<Field> & { name: string; values: unknown[] }>): DataFrame {
  return toDataFrame({ fields });
}

describe('findFieldIndex / findField', () => {
  const frame = makeFrame([
    { name: 'time', type: FieldType.time, values: [1, 2] },
    { name: 'value', type: FieldType.number, values: [10, 20], config: { displayName: 'Temperature' } },
  ]);

  it('returns undefined for a missing frame or empty name', () => {
    expect(findFieldIndex('value', undefined)).toBeUndefined();
    expect(findFieldIndex('', frame)).toBeUndefined();
    expect(findFieldIndex(undefined, frame)).toBeUndefined();
  });

  it('matches by raw field name', () => {
    expect(findFieldIndex('time', frame)).toBe(0);
    expect(findFieldIndex('value', frame)).toBe(1);
  });

  it('matches by computed display name when the raw name does not match', () => {
    expect(findFieldIndex('Temperature', frame)).toBe(1);
  });

  it('returns undefined when nothing matches', () => {
    expect(findFieldIndex('missing', frame)).toBeUndefined();
  });

  it('findField returns the matching field or undefined', () => {
    expect(findField(frame, 'time')?.name).toBe('time');
    expect(findField(frame, 'missing')).toBeUndefined();
    expect(findField(undefined, 'time')).toBeUndefined();
  });
});

describe('getLastNotNullFieldValue', () => {
  it('prefers the precomputed lastNotNull reducer value', () => {
    const field: Field = {
      name: 'v',
      type: FieldType.number,
      config: {},
      values: [1, 2, 3],
      state: { calcs: { [ReducerID.lastNotNull]: 99 } },
    };
    expect(getLastNotNullFieldValue(field)).toBe(99);
  });

  it('scans from the end skipping trailing nulls when no calcs exist', () => {
    const field: Field = {
      name: 'v',
      type: FieldType.number,
      config: {},
      values: [1, 5, null, null],
    };
    expect(getLastNotNullFieldValue(field)).toBe(5);
  });

  it('returns undefined when every value is null', () => {
    const field: Field = {
      name: 'v',
      type: FieldType.number,
      config: {},
      values: [null, null],
    };
    expect(getLastNotNullFieldValue(field)).toBeUndefined();
  });
});

describe('getScaleDimensionFromData multi-series selection', () => {
  const cfg: ScaleDimensionConfig = { min: 0, max: 1, fixed: 0, field: 'v' };

  it('skips frames where the dimension is assumed and uses the first real match', () => {
    const withoutField = makeFrame([{ name: 'other', type: FieldType.number, values: [0, 1] }]);
    const withField = makeFrame([{ name: 'v', type: FieldType.number, values: [0, 10], config: { min: 0, max: 10 } }]);

    const dim = getScaleDimensionFromData({ series: [withoutField, withField] } as never, cfg);
    expect(dim.field?.name).toBe('v');
    expect(dim.get(1)).toBe(1);
  });

  it('falls back to a fixed (fieldless) dimension when no field is configured', () => {
    const dim = getScaleDimensionFromData({ series: [] } as never, { min: 0, max: 1, fixed: 0.5 });
    expect(dim.field).toBeUndefined();
    expect(dim.value()).toBe(0.5);
    expect(dim.get(0)).toBe(0.5);
  });
});

describe('getColorDimensionFromData', () => {
  const theme = createTheme();

  it('picks the first frame where the field actually resolves', () => {
    const without = makeFrame([{ name: 'other', type: FieldType.number, values: [1] }]);
    const with_ = makeFrame([
      {
        name: 'c',
        type: FieldType.number,
        values: [0],
        config: { color: { mode: FieldColorModeId.Fixed, fixedColor: 'green' } },
      },
    ]);
    const dim = getColorDimensionFromData({ series: [without, with_] } as never, { fixed: '', field: 'c' });
    expect(dim.field?.name).toBe('c');
    expect(dim.value()).toBe(theme.visualization.getColorByName('green'));
  });

  it('falls back to fixed color when no data', () => {
    const dim = getColorDimensionFromData(undefined, { fixed: 'red', field: '' });
    expect(dim.value()).toBe(theme.visualization.getColorByName('red'));
    expect(dim.field).toBeUndefined();
  });
});

describe('getDirectionDimensionFromData', () => {
  it('picks the first frame where the field resolves', () => {
    const without = makeFrame([{ name: 'other', type: FieldType.number, values: [1] }]);
    const with_ = makeFrame([{ name: 'dir', type: FieldType.number, values: [5] }]);
    const dim = getDirectionDimensionFromData({ series: [without, with_] } as never, {
      mode: DirectionDimensionMode.Field,
      field: 'dir',
      fixed: ConnectionDirection.Forward,
    });
    expect(dim.field?.name).toBe('dir');
    expect(dim.get(0)).toBe(ConnectionDirection.Forward);
  });

  it('falls back to fixed when no data', () => {
    const dim = getDirectionDimensionFromData(undefined, {
      mode: DirectionDimensionMode.Fixed,
      fixed: ConnectionDirection.Reverse,
    } as never);
    expect(dim.value()).toBe(ConnectionDirection.Reverse);
  });
});

describe('getScalarDimensionFromData', () => {
  it('picks the first frame where the field resolves', () => {
    const without = makeFrame([{ name: 'other', type: FieldType.number, values: [1] }]);
    const with_ = makeFrame([{ name: 's', type: FieldType.number, values: [90] }]);
    const dim = getScalarDimensionFromData({ series: [without, with_] } as never, {
      min: -360,
      max: 360,
      fixed: 0,
      field: 's',
      mode: ScalarDimensionMode.Clamped,
    });
    expect(dim.field?.name).toBe('s');
    expect(dim.get(0)).toBe(90);
  });

  it('falls back to fixed when no data', () => {
    const dim = getScalarDimensionFromData(undefined, {
      min: -360,
      max: 360,
      fixed: 45,
      mode: ScalarDimensionMode.Clamped,
    });
    expect(dim.value()).toBe(45);
  });
});

describe('getResourceDimensionFromData', () => {
  it('falls back to fixed URL when no field configured', () => {
    const dim = getResourceDimensionFromData(undefined, {
      mode: ResourceDimensionMode.Fixed,
      fixed: 'https://example.com/icon.png',
    });
    expect(dim.value()).toBe('https://example.com/icon.png');
  });

  it('picks the first frame where the field resolves', () => {
    const with_ = toDataFrame({
      fields: [
        {
          name: 'img',
          values: ['https://example.com/a.png'],
          display: (v: unknown) => ({ text: String(v), numeric: NaN, icon: undefined }),
        },
      ],
    });
    const dim = getResourceDimensionFromData({ series: [with_] } as never, {
      mode: ResourceDimensionMode.Field,
      field: 'img',
      fixed: '',
    });
    expect(dim.field?.name).toBe('img');
    expect(dim.value()).toBe('https://example.com/a.png');
  });
});

describe('getTextDimensionFromData', () => {
  it('falls back to fixed text when no data', () => {
    const dim = getTextDimensionFromData(undefined, {
      mode: TextDimensionMode.Fixed,
      fixed: 'hello',
      field: '',
    });
    expect(dim.value()).toBe('hello');
  });

  it('picks the first frame where the field resolves', () => {
    const without = makeFrame([{ name: 'other', type: FieldType.number, values: [1] }]);
    const with_ = makeFrame([{ name: 'label', type: FieldType.string, values: ['world'] }]);
    with_.fields[0].display = (v: unknown) => ({ text: String(v), numeric: NaN });

    const dim = getTextDimensionFromData({ series: [without, with_] } as never, {
      mode: TextDimensionMode.Field,
      fixed: '',
      field: 'label',
    });
    expect(dim.field?.name).toBe('label');
    expect(dim.value()).toBe('world');
  });
});
