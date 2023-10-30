import React from 'react';
import {render, screen} from '@testing-library/react';

import Footer from '..';

describe('Footer', () => {
  function setup() {
    render(<Footer />);
    return screen.getByTestId(/footer/i);
  }

  test('should render without crashing', () => {
    const element = setup();
    expect(element).toBeInTheDocument();
  });
});
