import { InMemoryProvider, OpenFeature } from '@openfeature/web-sdk';

import { initFeatureFlags, isPanZoomEnabled, OPEN_FEATURE_DOMAIN, PAN_ZOOM_FLAG } from './featureFlags';

// The real providers proxy Grafana's OFREP provider, which needs fetch.
jest.mock('@grafana/runtime', () => {
  const { InMemoryProvider } = jest.requireActual('@openfeature/web-sdk');
  return {
    ...jest.requireActual('@grafana/runtime'),
    createOpenFeatureLocalStorageProvider: () => new InMemoryProvider(),
    createOpenFeatureOFREPWebProvider: () => new InMemoryProvider(),
  };
});

const panZoomProvider = (enabled: boolean) =>
  new InMemoryProvider({
    [PAN_ZOOM_FLAG]: { variants: { on: true, off: false }, defaultVariant: enabled ? 'on' : 'off', disabled: false },
  });

describe('featureFlags', () => {
  afterEach(async () => {
    await OpenFeature.clearProviders();
  });

  it('registers a provider for the plugin domain', () => {
    initFeatureFlags();
    expect(OpenFeature.getProvider(OPEN_FEATURE_DOMAIN)).not.toBe(OpenFeature.getProvider());
  });

  it('keeps an existing domain provider', async () => {
    const existing = panZoomProvider(true);
    await OpenFeature.setProviderAndWait(OPEN_FEATURE_DOMAIN, existing);
    initFeatureFlags();
    expect(OpenFeature.getProvider(OPEN_FEATURE_DOMAIN)).toBe(existing);
  });

  it('returns false when no provider has the flag', () => {
    expect(isPanZoomEnabled()).toBe(false);
  });

  it.each([true, false])('returns the flag value from the domain provider (%s)', async (enabled) => {
    await OpenFeature.setProviderAndWait(OPEN_FEATURE_DOMAIN, panZoomProvider(enabled));
    expect(isPanZoomEnabled()).toBe(enabled);
  });
});
