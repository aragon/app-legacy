import {render, screen} from '@testing-library/react';
import React from 'react';
import {TransferListItem} from './transferListItem';

describe('TransferListItem', () => {
  // eslint-disable-next-line
    function setup(args?: any) {
    render(<TransferListItem {...args} />);
    return screen.getByTestId('transferListItem');
  }

  test('should render without crashing', () => {
    const element = setup();
    expect(element).toBeVisible;
  });
});
