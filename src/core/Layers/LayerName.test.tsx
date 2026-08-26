import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { type LayerNameProps, LayerName } from './LayerName';

describe('LayerName', () => {
  it('Can edit title', async () => {
    const scenario = renderScenario({});
    await userEvent.click(screen.getByTestId('layer-name-div'));

    const input = screen.getByTestId('layer-name-input');
    await userEvent.clear(input);
    await userEvent.type(input, 'new name');
    await userEvent.click(document.body);

    expect(jest.mocked(scenario.props.onChange).mock.calls[0][0]).toBe('new name');
  });

  it('Show error when empty name is specified', async () => {
    renderScenario({});

    await userEvent.click(screen.getByTestId('layer-name-div'));
    const input = screen.getByTestId('layer-name-input');
    await userEvent.clear(input);
    const alert = await screen.findByRole('alert');

    expect(alert.textContent).toBe('An empty layer name is not allowed');
  });

  it('Submits via Enter key', async () => {
    const scenario = renderScenario({});
    await userEvent.click(screen.getByTestId('layer-name-div'));

    const input = screen.getByTestId('layer-name-input');
    await userEvent.clear(input);
    await userEvent.type(input, 'entered name{Enter}');

    expect(jest.mocked(scenario.props.onChange).mock.calls[0][0]).toBe('entered name');
  });

  it('Discards edit and clears error when blurring while invalid', async () => {
    const scenario = renderScenario({});
    await userEvent.click(screen.getByTestId('layer-name-div'));

    const input = screen.getByTestId('layer-name-input');
    await userEvent.clear(input);
    await screen.findByRole('alert');

    await userEvent.click(document.body);

    expect(scenario.props.onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByTestId('layer-name-input')).toBeNull();
  });

  it('Show error when other layer with same name exists', async () => {
    renderScenario({});

    await userEvent.click(screen.getByTestId('layer-name-div'));
    const input = screen.getByTestId('layer-name-input');
    await userEvent.clear(input);
    await userEvent.type(input, 'Layer 2');
    const alert = await screen.findByRole('alert');

    expect(alert.textContent).toBe('Layer name already exists');
  });

  function renderScenario(overrides: Partial<LayerNameProps>) {
    const props: LayerNameProps = {
      name: 'Layer 1',
      onChange: jest.fn(),
      verifyLayerNameUniqueness: (nameToCheck: string) => {
        const names = new Set(['Layer 1', 'Layer 2']);
        return !names.has(nameToCheck);
      },
    };

    Object.assign(props, overrides);

    return {
      props,
      renderResult: render(<LayerName {...props} />),
    };
  }
});
