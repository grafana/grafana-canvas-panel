import { createDataFrame } from '@grafana/data';
import { config } from '@grafana/runtime';
import { ResourceDimensionMode } from '@grafana/schema';

import { getPublicOrAbsoluteUrl, getResourceDimension } from './resource';

const PLUGIN_ID = 'canvas';
const FAKE_BASE_URL = 'https://grafana.fake/public/plugins/canvas';

beforeEach(() => {
  config.panels = {
    [PLUGIN_ID]: { baseUrl: FAKE_BASE_URL } as never,
  };
});

afterEach(() => {
  config.panels = {};
});

describe('getPublicOrAbsoluteUrl', () => {
  it('returns the path prefixed with plugin baseUrl for a relative path', () => {
    expect(getPublicOrAbsoluteUrl('img/icon.svg')).toEqual(`${FAKE_BASE_URL}/img/icon.svg`);
  });

  it('returns an absolute URL unchanged', () => {
    expect(getPublicOrAbsoluteUrl('https://example.com/icon.png')).toEqual('https://example.com/icon.png');
  });

  it('returns empty string for non-string values', () => {
    expect(getPublicOrAbsoluteUrl(true)).toEqual('');
    expect(getPublicOrAbsoluteUrl(123)).toEqual('');
    expect(getPublicOrAbsoluteUrl(null)).toEqual('');
    expect(getPublicOrAbsoluteUrl(undefined)).toEqual('');
    expect(getPublicOrAbsoluteUrl({ path: 'icon.png' })).toEqual('');
    expect(getPublicOrAbsoluteUrl(['icon.png'])).toEqual('');
  });

  it('returns path prefixed with empty string when no plugin baseUrl is configured', () => {
    config.panels = {};
    expect(getPublicOrAbsoluteUrl('img/icon.svg')).toEqual('/img/icon.svg');
  });
});

describe('getResourceDimension', () => {
  it('fixed relative path resolves through plugin baseUrl', () => {
    const fixedValue = 'img/icons/unicons/question-circle.svg';
    const config = { mode: ResourceDimensionMode.Fixed, fixed: fixedValue };

    expect(getResourceDimension(undefined, config).value()).toEqual(`${FAKE_BASE_URL}/${fixedValue}`);
  });

  it('fixed full URL path is returned unchanged', () => {
    const fixedUrlValue = 'https://3rdparty.fake/image.png';
    const config = { mode: ResourceDimensionMode.Fixed, fixed: fixedUrlValue };

    expect(getResourceDimension(undefined, config).value()).toEqual(fixedUrlValue);
  });

  it('field URL path returns the display text URL from the field', () => {
    const frame = createDataFrame({
      fields: [
        {
          name: 'image_field',
          values: ['https://3rdparty.fake/icon.png'],
          display: (v) => ({
            text: String(v),
            numeric: NaN,
            icon: undefined,
          }),
        },
      ],
    });
    const cfg = { mode: ResourceDimensionMode.Field, field: 'image_field', fixed: '' };

    expect(getResourceDimension(frame, cfg).value()).toEqual('https://3rdparty.fake/icon.png');
  });

  it('uses the display icon url when the field display processor provides one', () => {
    const frame = createDataFrame({
      fields: [
        {
          name: 'image_field',
          values: ['img1'],
          display: (v) => ({
            text: String(v),
            numeric: NaN,
            icon: v === 'img1' ? 'https://3rdparty.fake/field.png' : undefined,
          }),
        },
      ],
    });
    const cfg = { mode: ResourceDimensionMode.Field, field: 'image_field', fixed: '' };

    expect(getResourceDimension(frame, cfg).value()).toEqual('https://3rdparty.fake/field.png');
  });

  it('returns empty string for boolean field values', () => {
    const frame = createDataFrame({
      fields: [
        {
          name: 'image_field',
          values: [true],
          display: (v) => ({ text: String(v), numeric: NaN, icon: undefined }),
        },
      ],
    });
    const cfg = { mode: ResourceDimensionMode.Field, field: 'image_field', fixed: '' };

    expect(getResourceDimension(frame, cfg).get(0)).toEqual('');
    expect(getResourceDimension(frame, cfg).value()).toEqual('');
  });

  it('returns empty string for numeric field values without a mapped icon', () => {
    const frame = createDataFrame({
      fields: [
        {
          name: 'image_field',
          values: [123],
          display: (v) => ({ text: String(v), numeric: Number(v), icon: undefined }),
        },
      ],
    });
    const cfg = { mode: ResourceDimensionMode.Field, field: 'image_field', fixed: '' };

    expect(getResourceDimension(frame, cfg).get(0)).toEqual('');
    expect(getResourceDimension(frame, cfg).value()).toEqual('');
  });

  it('resolves numeric field values that have a mapped relative icon through plugin baseUrl', () => {
    const frame = createDataFrame({
      fields: [
        {
          name: 'status_field',
          values: [1, 2],
          display: (v) => ({
            text: v === 1 ? 'OK' : 'Error',
            numeric: Number(v),
            icon: v === 1 ? 'img/icons/ok.svg' : 'img/icons/error.svg',
          }),
        },
      ],
    });
    const cfg = { mode: ResourceDimensionMode.Field, field: 'status_field', fixed: '' };

    expect(getResourceDimension(frame, cfg).get(0)).toEqual(`${FAKE_BASE_URL}/img/icons/ok.svg`);
    expect(getResourceDimension(frame, cfg).get(1)).toEqual(`${FAKE_BASE_URL}/img/icons/error.svg`);
  });
});
