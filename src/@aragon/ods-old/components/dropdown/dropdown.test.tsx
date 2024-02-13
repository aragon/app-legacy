import {render, screen} from '@testing-library/react';
import React from 'react';
import {Button} from '@aragon/ods';
import {Dropdown} from './dropdown';

describe('Dropdown', () => {
  // eslint-disable-next-line
  function setup({children, ...props}: any) {
    render(
      <Dropdown
        trigger={
          <Button size="md" variant="primary">
            button
          </Button>
        }
        {...props}
      >
        {children}
      </Dropdown>
    );
    return screen.getByTestId('dropdown-trigger');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
