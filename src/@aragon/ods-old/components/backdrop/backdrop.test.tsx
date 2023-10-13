import {render, screen} from '@testing-library/react';
import React from 'react';
import {Backdrop} from './backdrop';

describe('Backdrop', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<Backdrop {...args} />);
    return screen.getByTestId('backdrop-container');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
