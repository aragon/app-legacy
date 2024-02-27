import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {ListItemHeader} from './header';
import {IconType} from '@aragon/ods';

const DefaultProps = {
  buttonText: 'New Transfer',
  icon: IconType.APP_ASSETS,
  label: 'Treasury Volume',
  value: '$1,000,000.00',
};

describe('ListItemHeader', () => {
  // eslint-disable-next-line
  function setup(args?: any) {
    render(<ListItemHeader {...DefaultProps} {...args} />);
    return {
      button: screen.getByRole('button'),
      element: screen.getByTestId('listItem-header'),
    };
  }

  test('should render without crashing', () => {
    const {element} = setup();
    expect(element).toBeVisible;
  });

  test('should call the onClick method when clicked', () => {
    const mockHandler = jest.fn();
    const {button} = setup({onClick: mockHandler});

    fireEvent.click(button);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
