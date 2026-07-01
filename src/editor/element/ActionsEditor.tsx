// SOURCE: https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/canvas/editor/element/ActionsEditor.tsx
import * as React from 'react';
import { type StandardEditorProps, type Action, VariableSuggestionsScope } from '@grafana/data';
import { ActionsInlineEditor } from '../../features/actions/ActionsInlineEditor';
import { type CanvasElementOptions } from '../../features/canvas/element';

type Props = StandardEditorProps<Action[], CanvasElementOptions>;

export function ActionsEditor({ value, onChange, item, context }: Props) {
  const dataLinks = item.settings?.links || [];

  return (
    <ActionsInlineEditor
      actions={value}
      onChange={(actions) => {
        if (actions.some(({ oneClick }) => oneClick === true)) {
          dataLinks.forEach((link) => {
            link.oneClick = false;
          });
        }
        onChange(actions);
      }}
      getSuggestions={() => (context.getSuggestions ? context.getSuggestions(VariableSuggestionsScope.Values) : [])}
      data={[]}
      showOneClick={true}
    />
  );
}
