import { render } from '@testing-library/react';
import React from 'react';
import { BehaviorSubject } from 'rxjs';
import { usePanelContext } from '@grafana/ui';
import { TextDimensionMode } from '@grafana/schema';
import { textItem } from './text';
import { Align, VAlign } from '../types';
jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  usePanelContext: jest.fn(),
  useStyles2: () => ({ container: '', span: '', inlineEditorContainer: '' }),
}));
const mockedUsePanelContext = jest.mocked(usePanelContext);
describe('TextEdit', () => {
  it('does not crash when the selection is cleared before unmounting', () => {
    mockedUsePanelContext.mockReturnValue({
      instanceState: {
        scene: {
          data: { series: [] },
          editModeEnabled: new BehaviorSubject(true),
        },
        selected: undefined,
      },
    } as never);
    const Display = textItem.display;
    const { unmount } = render(
      <Display
        config={{
          text: { mode: TextDimensionMode.Fixed, fixed: 'before' },
          align: Align.Center,
          valign: VAlign.Middle,
        }}
        isSelected
      />
    );
    expect(() => unmount()).not.toThrow();
  });
});
