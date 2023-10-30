import {render, screen} from '@testing-library/react';
import React from 'react';
import {CardWallet} from './cardWallet';

describe('CardWallet', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<CardWallet {...args} />);
    return screen.getByTestId('cardWallet');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
