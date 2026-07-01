// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/core/components/Layers/AddLayerButton.tsx
// TODO: Publish AddLayerButton from @grafana/ui and delete this duplicate file
import * as React from 'react';
import { type SelectableValue } from '@grafana/data';
import { ValuePicker } from '@grafana/ui';

export type AddLayerButtonProps = {
  onChange: (sel: SelectableValue<string>) => void;
  options: Array<SelectableValue<string>>;
  label: string;
};

export const AddLayerButton = ({ onChange, options, label }: AddLayerButtonProps) => {
  return (
    <ValuePicker
      icon="plus"
      label={label}
      variant="secondary"
      options={options}
      onChange={onChange}
      isFullWidth={true}
    />
  );
};
