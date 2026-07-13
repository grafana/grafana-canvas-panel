// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/canvas/editor/LineStyleEditor.tsx
import * as React from 'react';
import { useCallback } from 'react';

import { type SelectableValue, type StandardEditorProps } from '@grafana/data';
import { t } from '@grafana/i18n';
import { Field, RadioButtonGroup, Switch } from '@grafana/ui';

import { LineStyle } from '../types';

const options: Array<SelectableValue<LineStyle>> = [
  { value: LineStyle.Solid, label: 'Solid' },
  { value: LineStyle.Dashed, label: 'Dashed' },
  { value: LineStyle.Dotted, label: 'Dotted' },
];

export interface LineStyleConfig {
  style: LineStyle;
  animate?: boolean;
}

type Props = StandardEditorProps<LineStyleConfig>;

const defaultLineStyleConfig: LineStyleConfig = {
  style: LineStyle.Solid,
  animate: false,
};

export const LineStyleEditor = ({ value: valueProp, onChange }: Props) => {
  let value: LineStyleConfig;
  if (!valueProp) {
    value = defaultLineStyleConfig;
  } else if (typeof valueProp !== 'object') {
    value = {
      style: valueProp,
      animate: false,
    };
  } else {
    value = valueProp;
  }

  const onLineStyleChange = useCallback(
    (lineStyle: LineStyle) => {
      onChange({ ...value, style: lineStyle });
    },
    [onChange, value]
  );

  const onAnimateChange = useCallback(
    (animate: boolean) => {
      onChange({ ...value, animate });
    },
    [onChange, value]
  );

  return (
    <>
      <RadioButtonGroup value={value.style} options={options} onChange={onLineStyleChange} fullWidth />
      {value.style !== LineStyle.Solid && (
        <>
          <br />
          <Field label={t('canvas.line-style-editor.label-animate', 'Animate')}>
            <Switch value={value.animate} onChange={(e) => onAnimateChange(e.currentTarget.checked)} />
          </Field>
        </>
      )}
    </>
  );
};
