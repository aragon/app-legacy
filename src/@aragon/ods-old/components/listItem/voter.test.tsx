import {render, screen} from '@testing-library/react';
import React from 'react';
import {ListItemVoter} from './voter';

describe('ListItemVoter', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<ListItemVoter {...args} />);
    return screen.getByTestId('listItem-voter');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
