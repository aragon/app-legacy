import {render, screen} from '@testing-library/react';
import React from 'react';
import {HeaderPage} from './headerPage';

describe('HeaderPage', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<HeaderPage {...args} />);
    return screen.getByTestId('header-page');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
