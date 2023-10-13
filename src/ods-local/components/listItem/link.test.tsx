import {render, screen} from '@testing-library/react';
import React from 'react';
import {ListItemLink} from './link';

describe('ListItemLink', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<ListItemLink {...args} />);
    return screen.getByTestId('listItem-link');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
