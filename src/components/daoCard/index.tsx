import {AvatarDao, IconBlock, IconCommunity} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import useScreen from 'hooks/useScreen';
import {useHref} from 'react-router-dom';
import {useResolveDaoAvatar} from 'hooks/useResolveDaoAvatar';
import {CHAIN_METADATA} from 'utils/constants';
import {generatePath} from 'react-router-dom';
import {toDisplayEns} from 'utils/library';
import {Dashboard} from 'utils/paths';
import {IDao} from 'services/aragon-backend/domain/dao';

export interface IDaoCardProps {
  dao: IDao;
}

export const DaoCard = (props: IDaoCardProps) => {
  const {dao} = props;
  const {
    name,
    address,
    daoAddress,
    logo,
    ens,
    description,
    network,
    governanceId,
  } = dao;

  const {t} = useTranslation();
  const {isDesktop} = useScreen();

  const {avatar} = useResolveDaoAvatar(logo);

  const daoPage = generatePath(Dashboard, {
    network,
    dao: toDisplayEns(ens) || address || daoAddress,
  });
  const daoUrl = useHref(daoPage);

  const daoType = t(
    governanceId === 'token-voting.plugin.dao.eth'
      ? 'explore.explorer.tokenBased'
      : 'explore.explorer.walletBased'
  );

  return (
    <Container href={daoUrl}>
      <DaoDataWrapper>
        <HeaderContainer>
          <AvatarDao daoName={name} src={avatar} />
          <div className="space-y-0.5 text-left xl:space-y-1">
            <Title>{name}</Title>
            <p className="font-semibold text-neutral-500 ft-text-sm">
              {toDisplayEns(ens)}
            </p>
          </div>
        </HeaderContainer>
        <Description isDesktop={isDesktop}>{description}</Description>
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

const Container = styled.a.attrs({
  className: `p-4 xl:p-6 w-full flex flex-col space-y-6
    box-border border border-neutral-0
    focus:outline-none focus:ring focus:ring-primary
    hover:border-neutral-100 active:border-200
    bg-neutral-0 rounded-xl cursor-pointer
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
})<{isDesktop: boolean}>`
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
