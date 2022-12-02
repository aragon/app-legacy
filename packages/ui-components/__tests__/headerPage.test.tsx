import React from 'react';
import {render, screen} from '@testing-library/react';

import {Page as HeaderPage} from '../stories/headerPage.stories';

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
