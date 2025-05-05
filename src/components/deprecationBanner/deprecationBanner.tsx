import {Button, IconType} from '@aragon/ods';
import React from 'react';
import styled from 'styled-components';

export type DeprecationBannerProps = {};

export const DeprecationBanner: React.FC<DeprecationBannerProps> = () => {
  return (
    <Container>
      <p>
        We’ve moved to a new UI with a better experience. This version will be
        phased out in the coming weeks.{' '}
        <a href="/" className="text-neutral-0 underline">
          Learn more
        </a>
      </p>
      <Button
        size="sm"
        iconRight={IconType.LINK_EXTERNAL}
        href="https://app.aragon.org/"
        target="_blank"
        className="w-full shrink-0 sm:w-auto"
      >
        New UI
      </Button>
    </Container>
  );
};

const Container = styled.div.attrs({
  className:
    'sticky top-0 w-full flex flex-col sm:flex-row items-center gap gap-4 sm:gap-x-6 lg:gap-x-8 justify-center bg-primary-800 ft-text-sm text-neutral-0 p-4 md:px-6',
})``;
