import {render, screen} from '@testing-library/react';
import React from 'react';
import {CheckboxSimple} from './checkboxSimple';

describe('CheckboxSimple', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<CheckboxSimple {...args} />);
    return screen.getByTestId('checkboxSimple');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
