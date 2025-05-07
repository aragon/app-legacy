import {Button, IconType} from '@aragon/ods';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

export type DeprecationBannerProps = {};

export const DeprecationBanner: React.FC<DeprecationBannerProps> = () => {
  const {t} = useTranslation();
  return (
    <Container>
      <p>
        {t('deprecationBanner.message')}{' '}
        <a
          href="https://blog.aragon.org/legacy-app-deprecation/"
          className="text-neutral-0 underline"
          target="_blank"
          rel="noreferrer noopener"
        >
          {t('deprecationBanner.learn')}
        </a>
      </p>
      <Button
        size="sm"
        iconRight={IconType.LINK_EXTERNAL}
        href="https://app.aragon.org/"
        target="_blank"
        className="w-full shrink-0 sm:w-auto"
      >
        {t('deprecationBanner.button')}
      </Button>
    </Container>
  );
};

const Container = styled.div.attrs({
  className:
    'sticky top-0 z-[var(--app-navbar-z-index)] w-full flex flex-col sm:flex-row items-center gap gap-4 sm:gap-x-6 lg:gap-x-8 justify-center bg-primary-800 text-sm text-neutral-0 p-4 md:px-6',
})``;
