import {render, screen} from '@testing-library/react';
import React from 'react';
import {ListItemAddress} from './address';

describe('ListItemAddress', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<ListItemAddress {...args} />);
    return screen.getByTestId('listItem-address');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
