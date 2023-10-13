import {render, screen} from '@testing-library/react';
import React from 'react';
import {CardTransfer} from './cardTransfer';

describe('CardTransfer', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<CardTransfer {...args} />);
    return screen.getByTestId('cardTransfer');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
