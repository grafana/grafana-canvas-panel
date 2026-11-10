import { fireEvent, render, screen, act } from '@testing-library/react';
import * as React from 'react';
import { BehaviorSubject } from 'rxjs';

import { createTheme, type EventBusSrv } from '@grafana/data';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  config: { theme2: createTheme(), panels: {}, featureToggles: {} },
}));

import { TextDimensionMode } from '@grafana/schema';
import { type PanelContext, PanelContextRoot } from '@grafana/ui';
import { Align, type TextConfig, type TextData, VAlign } from '../types';
import { textItem } from './text';

const makePanelContext = (instanceState: Record<string, unknown>): PanelContext => ({
  eventsScope: 'canvas-test',
  eventBus: {} as EventBusSrv,
  instanceState,
});

describe('textItem / TextEdit', () => {
  const baseConfig: TextConfig = {
    align: Align.Center,
    valign: VAlign.Middle,
    text: { mode: TextDimensionMode.Fixed, fixed: 'Fixed relative path' },
  };
  const baseData: TextData = {
    text: 'Fixed relative path',
    align: Align.Center,
    valign: VAlign.Middle,
  };

  it('does not crash under StrictMode when instanceState.selected is undefined', () => {
    const editModeEnabled = new BehaviorSubject<boolean>(true);
    const scene = {
      editModeEnabled,
      data: { series: [] },
      updateData: jest.fn(),
    };
    const context = makePanelContext({ scene });
    const TextDisplay = textItem.display;

    expect(() =>
      render(
        <React.StrictMode>
          <PanelContextRoot.Provider value={context}>
            <TextDisplay config={baseConfig} data={baseData} isSelected={true} />
          </PanelContextRoot.Provider>
        </React.StrictMode>
      )
    ).not.toThrow();

    expect(screen.getByDisplayValue('Fixed relative path')).toBeInTheDocument();
  });

  it('does not crash on unmount when instanceState.selected is empty', () => {
    const editModeEnabled = new BehaviorSubject<boolean>(true);
    const scene = {
      editModeEnabled,
      data: { series: [] },
      updateData: jest.fn(),
    };
    const context = makePanelContext({ scene, selected: [] });
    const TextDisplay = textItem.display;

    const { unmount } = render(
      <PanelContextRoot.Provider value={context}>
        <TextDisplay config={baseConfig} data={baseData} isSelected={true} />
      </PanelContextRoot.Provider>
    );

    expect(() => unmount()).not.toThrow();
  });

  it('saves edited text on unmount when a selected element is present', () => {
    const editModeEnabled = new BehaviorSubject<boolean>(true);
    const updateData = jest.fn();
    const onChange = jest.fn();
    const selectedElement = {
      options: {
        name: 'Text 1',
        type: 'text',
        config: { ...baseConfig },
      },
      onChange,
    };
    const scene = {
      editModeEnabled,
      data: { series: [] },
      updateData,
    };
    const context = makePanelContext({ scene, selected: [selectedElement] });
    const TextDisplay = textItem.display;

    render(
      <PanelContextRoot.Provider value={context}>
        <TextDisplay config={baseConfig} data={baseData} isSelected={true} />
      </PanelContextRoot.Provider>
    );

    const input = screen.getByDisplayValue('Fixed relative path');
    fireEvent.keyUp(input, { target: { value: 'Updated label' }, currentTarget: { value: 'Updated label' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    act(() => {
      editModeEnabled.next(false);
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          text: { mode: TextDimensionMode.Fixed, fixed: 'Updated label' },
        }),
      })
    );
    expect(updateData).toHaveBeenCalledWith(scene.data);
  });
});
