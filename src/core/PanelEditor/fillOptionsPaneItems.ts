// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/features/dashboard/components/PanelEditor/getVisualizationOptions.tsx
// TODO: Publish fillOptionsPaneItems from @grafana/ui and delete this duplicate file
import * as React from 'react';

import { PanelOptionsEditorBuilder, type StandardEditorContext } from '@grafana/data';

import { OptionsPaneCategoryDescriptor } from './OptionsPaneCategoryDescriptor';
import { OptionsPaneItemDescriptor } from './OptionsPaneItemDescriptor';
import { getUseFieldset, isNestedPanelOptions, type NestedValueAccess, type PanelOptionsSupplier } from '../../compat';

type categoryGetter = (categoryNames?: string[]) => OptionsPaneCategoryDescriptor;

export function fillOptionsPaneItems(
  idPrefix: string,
  supplier: PanelOptionsSupplier<any>,
  access: NestedValueAccess,
  getOptionsPaneCategory: categoryGetter,
  context: StandardEditorContext<unknown, unknown>,
  parentCategory?: OptionsPaneCategoryDescriptor
) {
  const builder = new PanelOptionsEditorBuilder();
  supplier(builder, context);

  for (const pluginOption of builder.getItems()) {
    if (pluginOption.showIf && !pluginOption.showIf(context.options, context.data, context.annotations)) {
      continue;
    }

    const htmlId = `${idPrefix ? `${idPrefix}-` : ''}${pluginOption.id}`;

    let category = parentCategory;
    if (!category) {
      category = getOptionsPaneCategory(pluginOption.category);
    } else if (pluginOption.category?.[0]?.length) {
      category = category.getCategory(pluginOption.category[0]);
    }

    if (isNestedPanelOptions(pluginOption)) {
      const subAccess = pluginOption.getNestedValueAccess(access);
      const subContext = subAccess.getContext
        ? subAccess.getContext(context)
        : { ...context, options: access.getValue(pluginOption.path) };

      fillOptionsPaneItems(htmlId, pluginOption.getBuilder(), subAccess, getOptionsPaneCategory, subContext, category);
      continue;
    }

    const Editor = pluginOption.editor;
    category.addItem(
      new OptionsPaneItemDescriptor({
        title: pluginOption.name,
        id: htmlId,
        description: pluginOption.description,
        useFieldset: getUseFieldset(pluginOption),
        render: function renderEditor() {
          return React.createElement(Editor, {
            value: access.getValue(pluginOption.path),
            onChange: (value: unknown) => {
              access.onChange(pluginOption.path, value);
            },
            item: pluginOption,
            context: context,
            id: htmlId,
          }) as unknown as React.ReactElement<Record<string, unknown>>;
        },
      })
    );
  }
}
