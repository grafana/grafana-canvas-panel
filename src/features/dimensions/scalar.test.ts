import { type DataFrame, FieldType } from '@grafana/data';
import { ScalarDimensionMode } from '@grafana/schema';

import { getScalarDimension } from './scalar';

describe('scalar dimensions', () => {
  it('returns the fixed value (assumed) when no field is configured', () => {
    const dim = getScalarDimension(undefined, {
      min: -360,
      max: 360,
      fixed: 45,
      mode: ScalarDimensionMode.Clamped,
    });
    expect(dim.value()).toBe(45);
    expect(dim.get(0)).toBe(45);
    expect(dim.isAssumed).toBe(false);
  });

  it('is assumed when fixed is 0 (falsy) and no field configured', () => {
    const dim = getScalarDimension(undefined, { min: -360, max: 360, fixed: 0, mode: ScalarDimensionMode.Clamped });
    expect(dim.isAssumed).toBe(true);
    expect(dim.value()).toBe(0);
  });

  it('returns .value() as the last non-null field value in mod mode', () => {
    const values = [10, 20, 30];
    const frame: DataFrame = {
      name: 'a',
      length: values.length,
      fields: [{ name: 'test', type: FieldType.number, values, config: {} }],
    };
    const supplier = getScalarDimension(frame, {
      min: -360,
      max: 360,
      field: 'test',
      fixed: 0,
      mode: ScalarDimensionMode.Mod,
    });
    expect(supplier.value()).toBe(30);
  });

  it('handles string field', () => {
    const values = ['-720', '10', '540', '90', '-210'];
    const frame: DataFrame = {
      name: 'a',
      length: values.length,
      fields: [
        {
          name: 'test',
          type: FieldType.number,
          values: values,
          config: {
            min: -720,
            max: 540,
          },
        },
      ],
    };

    const supplier = getScalarDimension(frame, {
      min: -360,
      max: 360,
      field: 'test',
      fixed: 0,
      mode: ScalarDimensionMode.Clamped,
    });

    const clamped = frame.fields[0].values.map((_k, i) => supplier.get(i));
    expect(clamped).toEqual([0, 0, 0, 0, 0]);
  });

  it('clamps out of range values', () => {
    const values = [-720, 10, 540, 90, -210];
    const frame: DataFrame = {
      name: 'a',
      length: values.length,
      fields: [
        {
          name: 'test',
          type: FieldType.number,
          values: values,
          config: {
            min: -720,
            max: 540,
          },
        },
      ],
    };

    const supplier = getScalarDimension(frame, {
      min: -360,
      max: 360,
      field: 'test',
      fixed: 0,
      mode: ScalarDimensionMode.Clamped,
    });

    const clamped = frame.fields[0].values.map((_k, i) => supplier.get(i));
    expect(clamped).toEqual([-360, 10, 360, 90, -210]);
  });

  it('keeps remainder after divisible by max', () => {
    const values = [-721, 10, 540, 390, -210];
    const frame: DataFrame = {
      name: 'a',
      length: values.length,
      fields: [
        {
          name: 'test',
          type: FieldType.number,
          values: values,
          config: {
            min: -721,
            max: 540,
          },
        },
      ],
    };

    const supplier = getScalarDimension(frame, {
      min: -360,
      max: 360,
      field: 'test',
      fixed: 0,
      mode: ScalarDimensionMode.Mod,
    });

    const remainder = frame.fields[0].values.map((_k, i) => supplier.get(i));
    expect(remainder).toEqual([-1, 10, 180, 30, -210]);
  });
});
