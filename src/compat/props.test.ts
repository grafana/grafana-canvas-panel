import { fieldsetProps, getUseFieldset, noOptionsMessageProps } from './props';

test('does not forward a fieldset prop from older host builders', () => {
  expect(fieldsetProps(getUseFieldset({}))).toEqual({});
  expect(fieldsetProps(getUseFieldset({ useFieldset: 'true' }))).toEqual({});
});

test.each([true, false])('preserves the newer builder fieldset value %s', (useFieldset) => {
  expect(fieldsetProps(getUseFieldset({ useFieldset }))).toEqual({ useFieldset });
});

test('forwards optional combobox text; older Combobox implementations ignore it', () => {
  expect(noOptionsMessageProps(undefined)).toEqual({});
  expect(noOptionsMessageProps('')).toEqual({ noOptionsMessage: '' });
  expect(noOptionsMessageProps('No fields')).toEqual({ noOptionsMessage: 'No fields' });
});
