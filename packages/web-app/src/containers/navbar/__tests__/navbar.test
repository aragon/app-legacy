import React from 'react';
import {render, screen} from 'test-utils';
import {GlobalModalsProvider} from 'context/globalModals';
import 'whatwg-fetch';

import Navbar from '..';
import {PrivacyContextProvider} from 'context/privacyContext';

describe('Navbar', () => {
  test('should render', () => {
    render(
      <PrivacyContextProvider>
        <GlobalModalsProvider>
          <Navbar />
        </GlobalModalsProvider>
      </PrivacyContextProvider>
    );

    const element = screen.getByTestId('navbar');
    expect(element).toBeInTheDocument();
  });
});
