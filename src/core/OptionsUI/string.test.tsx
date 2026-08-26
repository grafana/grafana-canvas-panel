import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { StringValueEditor } from './string';

const makeDummyItem = (useTextarea = false, rows?: number) => ({
  settings: { useTextarea, rows },
  id: '',
  name: '',
  description: '',
  editor: StringValueEditor,
});

describe('StringValueEditor', () => {
  describe('Input mode', () => {
    it('calls onChange with the trimmed value on blur', () => {
      const onChange = jest.fn();
      render(
        <StringValueEditor value="old" onChange={onChange} item={makeDummyItem() as never} context={{} as never} />
      );
      const input = screen.getByRole('textbox');
      fireEvent.blur(input, { target: { value: '  new value  ' } });
      expect(onChange).toHaveBeenCalledWith('new value');
    });

    it('calls onChange with undefined when the value is cleared to empty', () => {
      const onChange = jest.fn();
      render(
        <StringValueEditor value="old" onChange={onChange} item={makeDummyItem() as never} context={{} as never} />
      );
      const input = screen.getByRole('textbox');
      fireEvent.blur(input, { target: { value: '' } });
      expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('does not call onChange when the value is unchanged on blur', () => {
      const onChange = jest.fn();
      render(
        <StringValueEditor value="same" onChange={onChange} item={makeDummyItem() as never} context={{} as never} />
      );
      const input = screen.getByRole('textbox');
      fireEvent.blur(input, { target: { value: 'same' } });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('calls onChange on Enter key with the current input value', async () => {
      const onChange = jest.fn();
      render(
        <StringValueEditor value="old" onChange={onChange} item={makeDummyItem() as never} context={{} as never} />
      );
      const input = screen.getByRole('textbox');
      await userEvent.clear(input);
      await userEvent.type(input, 'entered');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('entered');
    });

    it('does not call onChange on non-Enter keydown', async () => {
      const onChange = jest.fn();
      render(
        <StringValueEditor value="old" onChange={onChange} item={makeDummyItem() as never} context={{} as never} />
      );
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'a');
      fireEvent.keyDown(input, { key: 'b' });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not call onChange on non-Enter keydown', () => {
      const onChange = jest.fn();
      render(
        <StringValueEditor value="old" onChange={onChange} item={makeDummyItem() as never} context={{} as never} />
      );
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'a', currentTarget: { value: 'a' } });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Textarea mode', () => {
    it('calls onChange on blur', () => {
      const onChange = jest.fn();
      render(
        <StringValueEditor
          value="old"
          onChange={onChange}
          item={makeDummyItem(true, 4) as never}
          context={{} as never}
        />
      );
      const textarea = screen.getByRole('textbox');
      fireEvent.blur(textarea, { target: { value: 'multiline' } });
      expect(onChange).toHaveBeenCalledWith('multiline');
    });

    it('does not call onChange on Enter key (Enter is a newline in textarea)', () => {
      const onChange = jest.fn();
      render(
        <StringValueEditor value="old" onChange={onChange} item={makeDummyItem(true) as never} context={{} as never} />
      );
      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 'Enter', currentTarget: { value: 'old\n' } });
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
