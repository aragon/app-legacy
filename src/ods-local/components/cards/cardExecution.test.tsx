import {render, screen} from '@testing-library/react';
import React from 'react';
import {CardExecution} from './cardExecution';

describe('cardExecution', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<CardExecution {...args} />);
    return screen.getByTestId('cardExecution');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
