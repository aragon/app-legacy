import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {DropdownInput} from './dropdownInput';

describe('DropdownInput', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<DropdownInput label="test" {...args} />);
    return screen.getByRole('button');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });

  test('should call the onClick method when clicked', () => {
    const mockHandler = jest.fn();
    const element = setup({onClick: mockHandler});

    fireEvent.click(element);
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
