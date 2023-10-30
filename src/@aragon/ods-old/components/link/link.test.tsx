import {render, screen} from '@testing-library/react';
import React from 'react';
import {Link, type LinkProps} from './link';

describe('Link', () => {
  function setup(args: LinkProps = {} as LinkProps) {
    render(<Link {...args} />);
    return screen.getByTestId('link');
  }

  test('should render without crashing', () => {
    const element = setup();
    expect(element).toBeInTheDocument;
  });
});
