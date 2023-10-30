import {render, screen} from '@testing-library/react';
import React from 'react';
import {WalletInput} from './walletInput';

describe.skip('WalletInput', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<WalletInput {...args} />);
    return screen.getByTestId('input-wallet');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
