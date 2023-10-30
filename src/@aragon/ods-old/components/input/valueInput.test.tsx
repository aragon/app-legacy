import {render, screen} from '@testing-library/react';
import React from 'react';
import {ValueInput} from './valueInput';

describe('ValueInput', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<ValueInput {...args} />);
    return screen.getByTestId('input-value');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
