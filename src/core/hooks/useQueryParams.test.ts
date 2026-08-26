import { renderHook, act } from '@testing-library/react';

import { locationService } from '@grafana/runtime';

import { useQueryParams } from './useQueryParams';

jest.mock('react-router-dom-v5-compat', () => ({
  useLocation: jest.fn(() => ({ search: '' })),
}));

jest.mock('@grafana/runtime', () => ({
  locationSearchToObject: (search: string) => {
    if (!search) {
      return {};
    }
    const params = new URLSearchParams(search.replace(/^\?/, ''));
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  },
  locationService: {
    partial: jest.fn(),
  },
}));

const { useLocation } = jest.requireMock('react-router-dom-v5-compat');

describe('useQueryParams', () => {
  beforeEach(() => {
    jest.mocked(locationService.partial).mockClear();
    useLocation.mockReturnValue({ search: '' });
  });

  it('returns empty params when there is no query string', () => {
    const { result } = renderHook(() => useQueryParams());

    expect(result.current[0]).toEqual({});
  });

  it('parses a single query parameter from the location search string', () => {
    useLocation.mockReturnValue({ search: '?foo=bar' });

    const { result } = renderHook(() => useQueryParams());

    expect(result.current[0]).toEqual({ foo: 'bar' });
  });

  it('parses multiple query parameters', () => {
    useLocation.mockReturnValue({ search: '?a=1&b=2' });

    const { result } = renderHook(() => useQueryParams());

    expect(result.current[0]).toEqual({ a: '1', b: '2' });
  });

  it('calls locationService.partial with the given values when the update function is called', () => {
    const { result } = renderHook(() => useQueryParams());

    act(() => {
      result.current[1]({ foo: 'baz' });
    });

    expect(jest.mocked(locationService.partial)).toHaveBeenCalledWith({ foo: 'baz' }, undefined);
  });

  it('passes replace=true to locationService.partial when requested', () => {
    const { result } = renderHook(() => useQueryParams());

    act(() => {
      result.current[1]({ key: 'value' }, true);
    });

    expect(jest.mocked(locationService.partial)).toHaveBeenCalledWith({ key: 'value' }, true);
  });

  it('returns a stable update function reference across re-renders', () => {
    const { result, rerender } = renderHook(() => useQueryParams());
    const firstUpdate = result.current[1];

    rerender();

    expect(result.current[1]).toBe(firstUpdate);
  });
});
