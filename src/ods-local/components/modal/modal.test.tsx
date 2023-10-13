import {render, screen} from '@testing-library/react';
import React from 'react';
import {Modal} from './modal';

describe('Modal', () => {
  // eslint-disable-next-line
    function setup({ children, ...props }: any) {
    render(<Modal {...props}>{children}</Modal>);
    return screen.getByTestId('modal-content');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
