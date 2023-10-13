import React from 'react';
import styled from 'styled-components';
import {generatePath, Link, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ButtonText, IconChevronRight} from '@aragon/ods-old';

import {useNetwork} from 'context/network';
import {AllTokens, AllTransfers} from 'utils/paths';

type SectionHeader = {
  title: string;
};

export type SectionWrapperProps = SectionHeader & {
  children: React.ReactNode;
  showButton?: boolean;
};

const SectionHeader = ({title}: SectionHeader) => (
  <HeaderContainer>
    <Title>{title}</Title>
  </HeaderContainer>
);

/**
 * Section wrapper for tokens overview. Consists of a header with a title and a
 * button, as well as a footer with a button that takes the user to the token
 * overview. and a list of tokens (the children).
 *
 * NOTE: The wrapper imposes NO SPACING. It's entirely up to the children to
 * define this.
 */
export const TokenSectionWrapper = ({title, children}: SectionWrapperProps) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {dao} = useParams();

  return (
    <>
      <SectionHeader title={title} />
      {children}
      <Link to={generatePath(AllTokens, {network, dao})}>
        <ButtonText
          mode="secondary"
          label={t('labels.seeAllTokens')}
          iconRight={<IconChevronRight />}
        />
      </Link>
    </>
  );
};

/**
 * Section wrapper for transfer overview. Consists of a header with a title, as
 * well as a footer with a button that takes the user to the token overview. and
 * a list of transfers (the children).
 *
 * NOTE: The wrapper imposes NO SPACING. It's entirely up to the children to
 * define this.
 */
export const TransferSectionWrapper = ({
  title,
  children,
  showButton = false,
}: SectionWrapperProps) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {dao} = useParams();

  return (
    <>
      <SectionHeader title={title} />
      {children}
      {showButton && (
        <div>
          <Link to={generatePath(AllTransfers, {network, dao})}>
            <ButtonText
              mode="secondary"
              label={t('labels.seeAllTransfers')}
              iconRight={<IconChevronRight />}
            />
          </Link>
        </div>
      )}
    </>
  );
};

const Title = styled.p.attrs({
  className: 'flex text-lg font-bold items-center text-ui-800',
})``;

const HeaderContainer = styled.div.attrs({
  className: 'flex justify-between content-center',
})``;
