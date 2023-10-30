import {render, screen} from '@testing-library/react';
import React from 'react';
import {TimeInput} from './timeInput';

describe('TimeInput', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<TimeInput {...args} />);
    return screen.getByTestId('time-input');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
