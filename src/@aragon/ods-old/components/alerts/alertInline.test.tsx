import {render, screen} from '@testing-library/react';
import React from 'react';
import {AlertInline} from './alertInline';

describe('AlertInline', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<AlertInline {...args} />);
    return screen.getByTestId('alertInline');
  }

  test('should render without crashing', () => {
    const element = setup({label: 'Test Message'});
    expect(element).toBeInTheDocument;
    expect(screen.getByText(/test/i)).toBeInTheDocument;
  });
});
