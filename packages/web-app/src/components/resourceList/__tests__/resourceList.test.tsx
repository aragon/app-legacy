import React from 'react';
import {render, screen} from 'test-utils';

import ResourceList from '..';

const links = [
  {url: 'https://client.aragon.org/', name: 'Client'},
  {url: 'https://govern.aragon.org/', name: 'Govern'},
];

describe('ResourceList', () => {
  test('should render', () => {
    render(<ResourceList links={links} />);

    const element = screen.getByTestId(/resourceList/i);
    expect(element).toBeInTheDocument();
  });

  test('should display all the links passed in', () => {
    render(<ResourceList links={links} />);

    const elements = screen.getAllByTestId(/listItem-link/i);
    expect(elements.length).toBe(links.length);
  });
});
