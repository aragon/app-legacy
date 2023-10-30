import {render, screen} from '@testing-library/react';
import React from 'react';
import {DateInput} from './dateInput';

describe('TextInput', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<DateInput {...args} />);
    return screen.getByTestId('date-input');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
