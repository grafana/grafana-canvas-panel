// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/features/dashboard/components/PanelEditor/OptionsPaneItemDescriptor.tsx
// TODO: Publish OptionsPaneItemDescriptor from @grafana/ui and delete this duplicate file
import { type ReactNode } from 'react';
import * as React from 'react';

import { selectors } from '@grafana/e2e-selectors';
import { Field } from '@grafana/ui';

import { type OptionsPaneCategoryDescriptor } from './OptionsPaneCategoryDescriptor';

export interface OptionsPaneItemInfo {
  title?: string;
  value?: any;
  description?: string;
  popularRank?: number;
  render: (descriptor: OptionsPaneItemDescriptor) => React.ReactElement<Record<string, unknown>>;
  skipField?: boolean;
  useFieldset?: boolean;
  showIf?: () => boolean;
  useShowIf?: () => boolean;
  overrides?: unknown[];
  addon?: ReactNode;
  id: string;
}

export class OptionsPaneItemDescriptor {
  parent!: OptionsPaneCategoryDescriptor;
  props: OptionsPaneItemInfo;

  constructor(props: OptionsPaneItemInfo) {
    this.props = { ...props };
  }

  renderElement(_searchQuery?: string) {
    return <OptionsPaneItem key={this.props.id} itemDescriptor={this} />;
  }

  useShowIf() {
    if (this.props.useShowIf) {
      return this.props.useShowIf();
    }
    if (this.props.showIf) {
      return this.props.showIf();
    }
    return true;
  }
}

interface OptionsPaneItemProps {
  itemDescriptor: OptionsPaneItemDescriptor;
}

function OptionsPaneItem({ itemDescriptor }: OptionsPaneItemProps) {
  const { title, description, id, render, skipField, useFieldset } = itemDescriptor.props;
  const key = `${itemDescriptor.parent.props.id} ${title}`;
  const showIf = itemDescriptor.useShowIf();

  if (!showIf) {
    return null;
  }

  if (skipField) {
    return render(itemDescriptor);
  }

  return (
    <Field
      label={title}
      description={description}
      key={key}
      data-testid={selectors.components.PanelEditor.OptionsPane.fieldLabel(key)}
      htmlFor={id}
      useFieldset={useFieldset}
    >
      {render(itemDescriptor)}
    </Field>
  );
}
