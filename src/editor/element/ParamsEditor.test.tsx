import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ParamsEditor } from './ParamsEditor';

const setup = (initial: Array<[string, string]> = []) => {
  const onChange = jest.fn();
  render(<ParamsEditor value={initial} onChange={onChange} />);
  return { onChange };
};

const keyInput = () => screen.getByPlaceholderText('Key');
const valueInput = () => screen.getByPlaceholderText('Value');
const addButton = () => screen.getByRole('button', { name: /add/i });

describe('ParamsEditor', () => {
  it('renders existing params as disabled rows', () => {
    setup([
      ['foo', 'bar'],
      ['baz', 'qux'],
    ]);
    const inputs = screen.getAllByRole('textbox');
    const values = inputs.map((i) => (i as HTMLInputElement).value);
    expect(values).toContain('foo');
    expect(values).toContain('bar');
    expect(values).toContain('baz');
  });

  it('add button is disabled when both fields are empty', () => {
    setup();
    expect(addButton()).toBeDisabled();
  });

  it('add button is enabled when key field has a value', async () => {
    setup();
    await userEvent.type(keyInput(), 'mykey');
    expect(addButton()).not.toBeDisabled();
  });

  it('add button is enabled when value field has a value', async () => {
    setup();
    await userEvent.type(valueInput(), 'myval');
    expect(addButton()).not.toBeDisabled();
  });

  it('calls onChange with sorted new param when add is clicked', async () => {
    const { onChange } = setup([['alpha', 'first']]);
    await userEvent.type(keyInput(), 'beta');
    await userEvent.type(valueInput(), 'second');
    await userEvent.click(addButton());

    expect(onChange).toHaveBeenCalledWith([
      ['alpha', 'first'],
      ['beta', 'second'],
    ]);
  });

  it('replaces existing key when re-adding with same key', async () => {
    const { onChange } = setup([['key', 'old']]);
    await userEvent.type(keyInput(), 'key');
    await userEvent.type(valueInput(), 'new');
    await userEvent.click(addButton());

    expect(onChange).toHaveBeenCalledWith([['key', 'new']]);
  });

  it('clears the input fields after adding', async () => {
    setup();
    await userEvent.type(keyInput(), 'k');
    await userEvent.type(valueInput(), 'v');
    await userEvent.click(addButton());
    expect((keyInput() as HTMLInputElement).value).toBe('');
    expect((valueInput() as HTMLInputElement).value).toBe('');
  });

  it('calls onChange with the filtered list when delete is clicked', async () => {
    const { onChange } = setup([
      ['a', '1'],
      ['b', '2'],
    ]);
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    expect(onChange).toHaveBeenCalledWith([['b', '2']]);
  });
});
