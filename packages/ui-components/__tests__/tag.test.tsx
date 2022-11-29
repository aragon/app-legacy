import React from 'react';
import {render, screen} from '@testing-library/react';

import {Tag} from '../src';

describe('Tag', () => {
  // eslint-disable-next-line
  function setup(args: any) {
    render(<Tag {...args} />);
    return screen.getByTestId('tag');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
