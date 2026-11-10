import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { BehaviorSubject } from 'rxjs';

import { createTheme, FieldType, toDataFrame, type EventBusSrv } from '@grafana/data';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  config: { theme2: createTheme(), panels: {}, featureToggles: {} },
}));

jest.mock('../../../core/MatchersUI/FieldNamePicker', () => ({
  FieldNamePicker: ({ value, onChange }: { value?: string; onChange: (value: string | undefined) => void }) => (
    <div>
      <span data-testid="selected-field">{value}</span>
      <button type="button" onClick={() => onChange('Value')}>
        Select Value field
      </button>
    </div>
  ),
}));

import { TextDimensionMode } from '@grafana/schema';
import { type PanelContext, PanelContextRoot } from '@grafana/ui';
import { Align, type TextConfig, type TextData, VAlign } from '../types';
import { metricValueItem } from './metricValue';

const makePanelContext = (instanceState: Record<string, unknown>): PanelContext => ({
  eventsScope: 'canvas-test',
  eventBus: {} as EventBusSrv,
  instanceState,
});

describe('metricValueItem / MetricValueEdit', () => {
  const baseSeries = [
    toDataFrame({
      name: 'metrics',
      fields: [{ name: 'Value', type: FieldType.number, values: [42] }],
    }),
  ];

  const baseConfig: TextConfig = {
    align: Align.Center,
    valign: VAlign.Middle,
    text: { mode: TextDimensionMode.Field, fixed: '', field: '' },
  };

  const baseData: TextData = {
    text: '42',
    align: Align.Center,
    valign: VAlign.Middle,
  };

  it('does not crash under StrictMode when instanceState.selected is undefined', () => {
    const editModeEnabled = new BehaviorSubject<boolean>(true);
    const updateData = jest.fn();
    const scene = {
      editModeEnabled,
      data: { series: baseSeries },
      updateData,
    };
    const context = makePanelContext({ scene });
    const MetricValueDisplay = metricValueItem.display;

    expect(() =>
      render(
        <React.StrictMode>
          <PanelContextRoot.Provider value={context}>
            <MetricValueDisplay config={baseConfig} data={baseData} isSelected={true} />
          </PanelContextRoot.Provider>
        </React.StrictMode>
      )
    ).not.toThrow();

    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Select Value field' }))).not.toThrow();
    expect(updateData).not.toHaveBeenCalled();
  });

  it('does not crash when selection is cleared before field change or unmount', () => {
    const editModeEnabled = new BehaviorSubject<boolean>(true);
    const onChange = jest.fn();
    const updateData = jest.fn();
    const selectedElement = {
      options: {
        name: 'Metric 1',
        type: 'metric-value',
        config: { ...baseConfig },
        background: { color: { fixed: 'transparent' } },
      },
      onChange,
    };
    const scene = {
      editModeEnabled,
      data: { series: baseSeries },
      updateData,
    };
    const instanceState: Record<string, unknown> = { scene, selected: [selectedElement] };
    const context = makePanelContext(instanceState);
    const MetricValueDisplay = metricValueItem.display;

    const { unmount } = render(
      <PanelContextRoot.Provider value={context}>
        <MetricValueDisplay config={baseConfig} data={baseData} isSelected={true} />
      </PanelContextRoot.Provider>
    );

    instanceState.selected = undefined;
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Select Value field' }))).not.toThrow();

    instanceState.selected = [];
    expect(() => unmount()).not.toThrow();
    expect(onChange).not.toHaveBeenCalled();
    expect(updateData).not.toHaveBeenCalled();
  });

  it('updates element config and scene data when a selected element is present', () => {
    const editModeEnabled = new BehaviorSubject<boolean>(true);
    const onChange = jest.fn();
    const updateData = jest.fn();
    const selectedElement = {
      options: {
        name: 'Metric 1',
        type: 'metric-value',
        config: { ...baseConfig },
        background: { color: { fixed: '#111111' } },
      },
      onChange,
    };
    const scene = {
      editModeEnabled,
      data: { series: baseSeries },
      updateData,
    };
    const context = makePanelContext({ scene, selected: [selectedElement] });
    const MetricValueDisplay = metricValueItem.display;

    render(
      <PanelContextRoot.Provider value={context}>
        <MetricValueDisplay config={baseConfig} data={baseData} isSelected={true} />
      </PanelContextRoot.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select Value field' }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          text: { fixed: '', field: 'Value', mode: TextDimensionMode.Field },
        }),
        background: {
          color: { field: 'Value', fixed: '#111111' },
        },
      })
    );
    expect(editModeEnabled.value).toBe(false);
    expect(updateData).toHaveBeenCalledWith(scene.data);
  });
});
