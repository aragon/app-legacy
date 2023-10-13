import {render, screen} from '@testing-library/react';
import React from 'react';
import {Avatar} from './avatar';

describe('Avatar', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<Avatar {...args} />);
    return screen.getByRole('img');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
