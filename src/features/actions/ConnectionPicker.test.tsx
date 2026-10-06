import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ActionType } from '@grafana/data';
import { getDataSourceInstanceList } from '@grafana/plugin-compat/datasources';
import { config } from '@grafana/runtime';

import { ConnectionPicker, type DataSourceListItem } from './ConnectionPicker';
import { INFINITY_DATASOURCE_TYPE } from './utils';

jest.mock('@grafana/plugin-compat/datasources', () => ({
  getDataSourceInstanceList: jest.fn(),
}));

const infinity = {
  uid: 'infinity-uid',
  name: 'Infinity',
  type: INFINITY_DATASOURCE_TYPE,
  meta: { info: { logos: { small: 'infinity.svg' } } },
} as DataSourceListItem;

describe('ConnectionPicker', () => {
  const originalToggle = config.featureToggles.vizActionsAuth;

  beforeAll(() => {
    // Select's menu uses IntersectionObserver, which jsdom doesn't provide
    global.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })) as unknown as typeof IntersectionObserver;
  });

  beforeEach(() => {
    jest.mocked(getDataSourceInstanceList).mockResolvedValue([infinity] as never);
    config.featureToggles.vizActionsAuth = true;
  });

  afterEach(() => {
    config.featureToggles.vizActionsAuth = originalToggle;
    jest.clearAllMocks();
  });

  const renderPicker = (props: Partial<React.ComponentProps<typeof ConnectionPicker>> = {}) => {
    const onChange = jest.fn();
    render(<ConnectionPicker actionType={ActionType.Fetch} onChange={onChange} id="connection" {...props} />);
    return { onChange };
  };

  const openSelect = () => userEvent.click(screen.getByRole('combobox'));

  it('lists Infinity datasources once loaded, filtering by type', async () => {
    renderPicker();
    await openSelect();

    expect(await screen.findByText('Infinity')).toBeInTheDocument();
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      expect.stringContaining('Direct from browser'),
      expect.stringContaining('Infinity'),
    ]);

    const { filter } = jest.mocked(getDataSourceInstanceList).mock.calls[0][0]!;
    expect(filter!({ ...infinity, type: 'prometheus' } as never)).toBe(false);
    expect(filter!(infinity as never)).toBe(true);
  });

  it('calls onChange with the list item when a datasource is selected', async () => {
    const { onChange } = renderPicker();
    await openSelect();
    await userEvent.click(await screen.findByText('Infinity'));

    expect(onChange).toHaveBeenCalledWith(infinity);
  });

  it('calls onChange with direct when the direct option is selected', async () => {
    const { onChange } = renderPicker({ actionType: ActionType.Infinity, datasourceUid: infinity.uid });
    await openSelect();
    await userEvent.click(await screen.findByText('Direct from browser'));

    expect(onChange).toHaveBeenCalledWith('direct');
  });

  it('does not fetch datasources when vizActionsAuth is off', async () => {
    config.featureToggles.vizActionsAuth = false;
    renderPicker();
    await openSelect();

    expect(getDataSourceInstanceList).not.toHaveBeenCalled();
    expect(screen.queryByText('Infinity')).not.toBeInTheDocument();
  });
});
