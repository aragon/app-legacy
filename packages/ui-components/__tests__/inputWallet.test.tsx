import React from 'react';
import {render, screen} from '@testing-library/react';

import {Wallet as WalletInput} from '../stories/inputWallet.stories';

describe('WalletInput', () => {
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
