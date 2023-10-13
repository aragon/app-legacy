import {render, screen} from '@testing-library/react';
import React from 'react';
import {IllustrationHuman} from './illuHuman';

describe('IlluHuman', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<IllustrationHuman {...args} />);
    return screen.getByTestId('illu-human');
  }

  test('should render without crashing', () => {
    const element = setup({
      body: 'chart',
      expression: 'casual',
      hair: 'long',
      sunglass: 'big_rounded',
      accessory: 'earrings_circle',
      width: 800,
      height: 450,
    });
    expect(element).toBeInTheDocument;
  });
});
