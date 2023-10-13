import {render, screen} from '@testing-library/react';
import React from 'react';
import {SearchInput} from './searchInput';

describe('inputSearch', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<SearchInput {...args} />);
    return screen.getByTestId('search-input');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
