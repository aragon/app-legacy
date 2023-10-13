import {render, screen} from '@testing-library/react';
import React from 'react';
import {HeaderDao} from './headerDao';

describe('HeaderDao', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<HeaderDao {...args} />);
    return screen.getByTestId('header-dao');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
