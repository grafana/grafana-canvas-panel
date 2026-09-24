import { forwardRef, memo } from 'react';

import { type OptionalUIExports } from './ui';

// Isolate the public namespace, not the adapter: tests must prove that imports
// compiled against 12.4 can discover newer exports and preserve their identity.
function withHost(host: OptionalUIExports, check: (adapter: typeof import('./ui')) => void) {
  jest.isolateModules(() => {
    jest.doMock('@grafana/ui', () => ({ ...jest.requireActual('@grafana/ui'), ...host }));
    check(require('./ui'));
  });
}

afterEach(() => jest.dontMock('@grafana/ui'));

test('uses local fallbacks when the host lacks public exports', () => {
  withHost(
    { CloseButton: undefined, VizTooltipContent: undefined, VizTooltipHeader: undefined, VizTooltipFooter: undefined },
    (adapter) => {
      expect(adapter.CloseButton).toBe(require('./fallbacks/CloseButton').CloseButton);
      expect(adapter.VizTooltipContent).toBe(require('./fallbacks/VizTooltip/VizTooltipContent').VizTooltipContent);
      expect(adapter.VizTooltipHeader).toBe(require('./fallbacks/VizTooltip/VizTooltipHeader').VizTooltipHeader);
      expect(adapter.VizTooltipFooter).toBe(require('./fallbacks/VizTooltip/VizTooltipFooter').VizTooltipFooter);
    }
  );
});

test('preserves host references, including memo and forwardRef components', () => {
  const host: Required<OptionalUIExports> = {
    CloseButton: forwardRef(function HostCloseButton() {
      return null;
    }),
    VizTooltipContent: memo(function HostContent() {
      return null;
    }),
    VizTooltipHeader: () => null,
    VizTooltipFooter: () => null,
  };
  withHost(host, (adapter) => {
    expect(adapter.CloseButton).toBe(host.CloseButton);
    expect(adapter.VizTooltipContent).toBe(host.VizTooltipContent);
    expect(adapter.VizTooltipHeader).toBe(host.VizTooltipHeader);
    expect(adapter.VizTooltipFooter).toBe(host.VizTooltipFooter);
  });
});

test('selects each export independently on partially upgraded hosts', () => {
  const CloseButton = memo(function HostCloseButton() {
    return null;
  });
  withHost({ CloseButton, VizTooltipContent: undefined }, (adapter) => {
    expect(adapter.CloseButton).toBe(CloseButton);
    expect(adapter.VizTooltipContent).toBe(require('./fallbacks/VizTooltip/VizTooltipContent').VizTooltipContent);
  });
});
