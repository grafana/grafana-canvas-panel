import { type OptionalDataExports } from './data';
import { type NestedPanelOptionsBuilder } from './types';

function withHost(host: OptionalDataExports, check: (adapter: typeof import('./data')) => void) {
  jest.isolateModules(() => {
    jest.doMock('@grafana/data', () => ({ ...jest.requireActual('@grafana/data'), ...host }));
    check(require('./data'));
  });
}

afterEach(() => jest.dontMock('@grafana/data'));

test('uses the host functions without wrapping them', () => {
  const generateUUID = jest.fn(() => 'host-uuid');
  const nestedCalls = jest.fn();
  const isNestedPanelOptions = (item: unknown): item is NestedPanelOptionsBuilder => {
    nestedCalls(item);
    return true;
  };
  withHost({ generateUUID, isNestedPanelOptions }, (adapter) => {
    expect(adapter.generateUUID).toBe(generateUUID);
    expect(adapter.isNestedPanelOptions).toBe(isNestedPanelOptions);
    expect(adapter.generateUUID()).toBe('host-uuid');
    const item = {};
    expect(adapter.isNestedPanelOptions(item)).toBe(true);
    expect(nestedCalls).toHaveBeenCalledWith(item);
  });
});

test('falls back per export and retains legacy behavior', () => {
  withHost({ generateUUID: undefined, isNestedPanelOptions: undefined }, (adapter) => {
    const fallback = require('./fallbacks/data');
    expect(adapter.generateUUID).toBe(fallback.generateUUID);
    expect(adapter.isNestedPanelOptions).toBe(fallback.isNestedPanelOptions);
    expect(adapter.generateUUID()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(adapter.isNestedPanelOptions({ id: 'nested-panel-options' })).toBe(true);
    for (const item of [null, undefined, 0, 'nested-panel-options', {}, { id: 'other' }]) {
      expect(adapter.isNestedPanelOptions(item)).toBe(false);
    }
  });
});

test('does not hide errors from an available host function', () => {
  const failure = new Error('host failure');
  const generateUUID = () => {
    throw failure;
  };
  withHost({ generateUUID, isNestedPanelOptions: undefined }, (adapter) => {
    expect(() => adapter.generateUUID()).toThrow(failure);
    expect(adapter.isNestedPanelOptions).toBe(require('./fallbacks/data').isNestedPanelOptions);
  });
});
