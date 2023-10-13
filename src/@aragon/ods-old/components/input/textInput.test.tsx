import {render, screen} from '@testing-library/react';
import React from 'react';
import {TextInput} from './textInput';

describe('TextInput', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<TextInput {...args} />);
    return screen.getByTestId('input');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
