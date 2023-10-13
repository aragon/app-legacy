import {render, screen} from '@testing-library/react';
import React from 'react';
import {Pagination} from './pagination';

describe('Pagination', () => {
  // eslint-disable-next-line
    function setup({ children, ...props }: any) {
    render(<Pagination {...props}>{children}</Pagination>);
    return screen.getByTestId('pagination');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
