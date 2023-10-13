import {render, screen} from '@testing-library/react';
import React from 'react';
import {ListItemAction} from './action';

describe('ListItemAction', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<ListItemAction {...args} />);
    return screen.getByTestId('listItem-action');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
