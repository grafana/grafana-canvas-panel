import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ActionVariableType, createDataFrame, FieldType } from '@grafana/data';

import { VizTooltipFooter } from './VizTooltipFooter';

test('retains data links and action variable confirmation in the fallback footer', async () => {
  const user = userEvent.setup();
  const onClick = jest.fn();
  const field = createDataFrame({ fields: [{ name: 'value', type: FieldType.number, values: [1] }] }).fields[0];
  render(
    <VizTooltipFooter
      dataLinks={[{ title: 'Inspect', href: '/d/details', target: '_self', origin: field }]}
      actions={[
        {
          title: 'Restart service',
          onClick,
          confirmation: () => 'Restart this service?',
          style: {},
          variables: [{ key: 'service', name: 'Service', type: ActionVariableType.String }],
        },
      ]}
    />
  );
  expect(screen.getByRole('link', { name: 'Inspect' })).toHaveAttribute('href', '/d/details');
  await user.click(screen.getByRole('button', { name: 'Restart service' }));
  await user.type(screen.getByPlaceholderText('Value'), 'api');
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  expect(onClick).not.toHaveBeenCalled();
  expect(screen.getByText('Restart this service?')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Confirm' }));
  expect(onClick).toHaveBeenCalledWith(expect.any(MouseEvent), null, { service: 'api' });
});
