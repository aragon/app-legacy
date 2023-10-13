import {render, screen} from '@testing-library/react';
import React from 'react';
import {Tag} from './tag';
import {type TagProps} from './tag.api';

describe('<Tag /> component', () => {
  const createTestComponent = (props?: Partial<TagProps>) => {
    const completeProps = {
      label: 'my-label',
      ...props,
    };

    return <Tag {...completeProps} />;
  };

  it('renders the specified label', () => {
    const label = 'label-test';
    render(createTestComponent({label}));
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
