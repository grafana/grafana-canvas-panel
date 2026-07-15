// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/canvas/editor/element/PlacementEditor.tsx
import * as React from 'react';
import { useObservable } from 'react-use';
import { Subject } from 'rxjs';

import { type SelectableValue, type StandardEditorProps } from '@grafana/data';
import { Trans, t } from '@grafana/i18n';
import { Field, Icon, InlineField, InlineFieldRow, Select, Stack } from '@grafana/ui';
import { NumberInput } from '../../core/OptionsUI/NumberInput';

import { HorizontalConstraint, type Options, type Placement, VerticalConstraint } from '../../panelcfg.gen';

import { ConstraintSelectionBox } from './ConstraintSelectionBox';
import { QuickPositioning } from './QuickPositioning';
import { type CanvasEditorOptions } from './elementEditor';

const places: Array<keyof Placement> = ['top', 'left', 'bottom', 'right', 'width', 'height', 'rotation'];

type Props = StandardEditorProps<unknown, CanvasEditorOptions, Options>;

export function PlacementEditor({ item }: Props) {
  const settings = item.settings;
  const horizontalOptions: Array<SelectableValue<HorizontalConstraint>> = [
    { label: t('canvas.placement-editor.horizontal-options.label-left', 'Left'), value: HorizontalConstraint.Left },
    { label: t('canvas.placement-editor.horizontal-options.label-right', 'Right'), value: HorizontalConstraint.Right },
    {
      label: t('canvas.placement-editor.horizontal-options.label-left-and-right', 'Left & right'),
      value: HorizontalConstraint.LeftRight,
    },
    {
      label: t('canvas.placement-editor.horizontal-options.label-center', 'Center'),
      value: HorizontalConstraint.Center,
    },
    { label: t('canvas.placement-editor.horizontal-options.label-scale', 'Scale'), value: HorizontalConstraint.Scale },
  ];

  const verticalOptions: Array<SelectableValue<VerticalConstraint>> = [
    { label: t('canvas.placement-editor.vertical-options.label-top', 'Top'), value: VerticalConstraint.Top },
    { label: t('canvas.placement-editor.vertical-options.label-bottom', 'Bottom'), value: VerticalConstraint.Bottom },
    {
      label: t('canvas.placement-editor.vertical-options.label-top-and-bottom', 'Top & bottom'),
      value: VerticalConstraint.TopBottom,
    },
    { label: t('canvas.placement-editor.vertical-options.label-center', 'Center'), value: VerticalConstraint.Center },
    { label: t('canvas.placement-editor.vertical-options.label-scale', 'Scale'), value: VerticalConstraint.Scale },
  ];

  // Will force a rerender whenever the subject changes
  useObservable(settings?.scene ? settings.scene.moved : new Subject());

  if (!settings) {
    return (
      <div>
        <Trans i18nKey="canvas.placement-editor.loading">Loading...</Trans>
      </div>
    );
  }

  const element = settings.element;
  if (!element) {
    return <div>???</div>;
  }
  const { options } = element;
  const { placement, constraint: layout } = options;

  const elementRef = element;
  const settingsRef = settings;

  if (placement) {
    // eslint-disable-next-line react-hooks/immutability
    placement.rotation = placement?.rotation ?? 0;
  }

  const reselectElementAfterChange = () => {
    setTimeout(() => {
      settingsRef.scene.select({ targets: [elementRef.div!] });
    });
  };

  const onHorizontalConstraintSelect = (h: SelectableValue<HorizontalConstraint>) => {
    onHorizontalConstraintChange(h.value!);
  };

  const onHorizontalConstraintChange = (h: HorizontalConstraint) => {
    // eslint-disable-next-line react-hooks/immutability
    elementRef.options.constraint!.horizontal = h;
    elementRef.setPlacementFromConstraint(undefined, undefined, settingsRef.scene.scale);
    // eslint-disable-next-line react-hooks/immutability
    settingsRef.scene.revId++;
    settingsRef.scene.save(true);
    reselectElementAfterChange();
  };

  const onVerticalConstraintSelect = (v: SelectableValue<VerticalConstraint>) => {
    onVerticalConstraintChange(v.value!);
  };

  const onVerticalConstraintChange = (v: VerticalConstraint) => {
    // eslint-disable-next-line react-hooks/immutability
    elementRef.options.constraint!.vertical = v;
    elementRef.setPlacementFromConstraint(undefined, undefined, settingsRef.scene.scale);
    // eslint-disable-next-line react-hooks/immutability
    settingsRef.scene.revId++;
    settingsRef.scene.save(true);
    reselectElementAfterChange();
  };

  const onPositionChange = (value: number | undefined, placement: keyof Placement) => {
    // eslint-disable-next-line react-hooks/immutability
    elementRef.options.placement![placement] = value ?? elementRef.options.placement![placement];
    elementRef.applyLayoutStylesToDiv();
    settingsRef.scene.clearCurrentSelection(true);
    reselectElementAfterChange();
  };

  const constraint = element.tempConstraint ?? layout ?? {};

  return (
    <div>
      <QuickPositioning onPositionChange={onPositionChange} settings={settings} element={element} />
      <br />
      <Field label={t('canvas.placement-editor.label-constraints', 'Constraints')}>
        <Stack direction="row">
          <ConstraintSelectionBox
            onVerticalConstraintChange={onVerticalConstraintChange}
            onHorizontalConstraintChange={onHorizontalConstraintChange}
            currentConstraints={constraint}
          />
          <Stack direction="column">
            <Stack direction="row">
              <Icon name="arrows-h" />
              <Select
                options={horizontalOptions}
                onChange={onHorizontalConstraintSelect}
                value={constraint.horizontal}
              />
            </Stack>
            <Stack direction="row">
              <Icon name="arrows-v" />
              <Select options={verticalOptions} onChange={onVerticalConstraintSelect} value={constraint.vertical} />
            </Stack>
          </Stack>
        </Stack>
      </Field>

      <br />

      <Field label={t('canvas.placement-editor.label-position', 'Position')}>
        <>
          {places.map((p) => {
            const v = placement![p];
            if (v == null) {
              return null;
            }

            // Need to set explicit min/max for rotation as logic only can handle 0-360
            const min = p === 'rotation' ? 0 : undefined;
            const max = p === 'rotation' ? 360 : undefined;

            return (
              <InlineFieldRow key={p}>
                <InlineField label={p} labelWidth={8} grow={true}>
                  <NumberInput min={min} max={max} value={v} onChange={(v) => onPositionChange(v, p)} />
                </InlineField>
              </InlineFieldRow>
            );
          })}
        </>
      </Field>
    </div>
  );
}
