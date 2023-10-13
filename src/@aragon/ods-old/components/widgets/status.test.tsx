import {render, screen} from '@testing-library/react';
import React from 'react';
import {WidgetStatus} from './status';

describe('WidgetStatus', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<WidgetStatus {...args} />);
    return screen.getByTestId('widgetStatus');
  }

  test('should render without crashing', () => {
    const element = setup({steps: []});
    expect(element).toBeInTheDocument;
  });
});
