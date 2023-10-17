import {AvatarDao, IconBlock, IconCommunity} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import useScreen from 'hooks/useScreen';
import {useResolveDaoAvatar} from 'hooks/useResolveDaoAvatar';
import {CHAIN_METADATA, getSupportedNetworkByChainId} from 'utils/constants';

export interface IDaoCardProps {
  name: string;
  ensName: string;
  logo?: string;
  description: string;
  chainId: number;
  daoType: DaoType;
  onClick?: () => void;
}

export type DaoType = 'wallet-based' | 'token-based';

const useGetDaoType = (daoType?: DaoType) => {
  const {t} = useTranslation();
  switch (daoType) {
    case 'token-based':
      return t('explore.explorer.tokenBased');
    case 'wallet-based':
      return t('explore.explorer.walletBased');
  }
};

// this is needed for line-clamp
type DescriptionProps = {
  isDesktop?: boolean;
};

export const DaoCard = (props: IDaoCardProps) => {
  const {isDesktop} = useScreen();
  const daoType = useGetDaoType(props.daoType);

  const {avatar} = useResolveDaoAvatar(props.logo);
  const network = getSupportedNetworkByChainId(props.chainId) ?? 'unsupported';

  return (
    <Container data-testid="daoCard" onClick={props.onClick}>
      <DaoDataWrapper>
        <HeaderContainer>
          <AvatarDao daoName={props.name} src={avatar} />
          <div className="space-y-0.5 text-left xl:space-y-1">
            <Title>{props.name}</Title>
            <p className="font-semibold text-neutral-500 ft-text-sm">
              {props.ensName}
            </p>
          </div>
        </HeaderContainer>
        <Description isDesktop={isDesktop}>{props.description}</Description>
      </DaoDataWrapper>
      <DaoMetadataWrapper>
        <IconWrapper>
          <StyledIconBlock />
          <IconLabel>{CHAIN_METADATA[network].name}</IconLabel>
        </IconWrapper>
        <IconWrapper>
          <StyledIconCommunity />
          <IconLabel>{daoType}</IconLabel>
        </IconWrapper>
      </DaoMetadataWrapper>
    </Container>
  );
};

const Container = styled.button.attrs({
  className: `p-4 xl:p-6 w-full flex flex-col space-y-6
    box-border border border-neutral-0
    focus:outline-none focus:ring-2 focus:ring-primary-500
    hover:border-neutral-100 active:border-200
    bg-neutral-0 rounded-xl
    `,
})`
  &:hover {
    box-shadow:
      0px 4px 8px rgba(31, 41, 51, 0.04),
      0px 0px 2px rgba(31, 41, 51, 0.06),
      0px 0px 1px rgba(31, 41, 51, 0.04);
  }
  &:focus {
    box-shadow: 0px 0px 0px 2px #003bf5;
  }
`;

const HeaderContainer = styled.div.attrs({
  className: 'flex flex-row space-x-4 items-center',
})``;

const Title = styled.p.attrs({
  className: 'font-semibold text-neutral-800 ft-text-xl break-words',
})``;

// The line desktop breakpoint does not work with
// the tailwind line clamp plugin so the same effect
// is achieved using styled components
const Description = styled.p.attrs({
  className: `
  font-medium text-neutral-600 ft-text-base flex text-left
  `,
})<DescriptionProps>`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${props => (props.isDesktop ? 2 : 3)};
`;

const DaoMetadataWrapper = styled.div.attrs({
  className: 'flex flex-row space-x-6',
})``;
const IconLabel = styled.p.attrs({
  className: 'text-neutral-600 ft-text-sm capitalize',
})``;
const IconWrapper = styled.div.attrs({
  className: 'flex flex-row space-x-2',
})``;

const DaoDataWrapper = styled.div.attrs({
  className: 'flex flex-col grow space-y-3 flex-1',
})``;

const StyledIconBlock = styled(IconBlock).attrs({
  className: 'text-neutral-600',
})``;

const StyledIconCommunity = styled(IconCommunity).attrs({
  className: 'text-neutral-600',
})``;
