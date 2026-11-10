import { applyNativeScrollBehavior } from './sceneAbleManagement';

describe('applyNativeScrollBehavior', () => {
  const setup = () => {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.style.overscrollBehavior = 'none';
    wrapper.style.overflow = 'auto';
    const viewer = { getContainer: () => container, getWrapper: () => wrapper };
    return { container, wrapper, viewer };
  };

  it('lets wheel scrolling reach the dashboard when pan/zoom is disabled', () => {
    const { container, wrapper, viewer } = setup();

    applyNativeScrollBehavior(viewer, false);

    expect(wrapper.style.overflow).toBe('hidden');
    expect(container.style.overscrollBehavior).toBe('auto');
  });

  it('restores InfiniteViewer scroll handling when pan/zoom is re-enabled', () => {
    const { container, wrapper, viewer } = setup();

    applyNativeScrollBehavior(viewer, false);
    applyNativeScrollBehavior(viewer, true);

    expect(wrapper.style.overflow).toBe('');
    expect(container.style.overscrollBehavior).toBe('');
  });
});
