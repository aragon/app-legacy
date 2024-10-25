import {AvatarDao} from '@aragon/ods-old';
import {AvatarIcon, Icon, IconType} from '@aragon/ods';
import React from 'react';
import styled from 'styled-components';
import useScreen from 'hooks/useScreen';
import {generatePath, useHref} from 'react-router-dom';
import {useResolveDaoAvatar} from 'hooks/useResolveDaoAvatar';
import {CHAIN_METADATA} from 'utils/constants';
import {toDisplayEns} from 'utils/library';
import {Dashboard} from 'utils/paths';
import {IDao} from 'services/aragon-backend/domain/dao';

interface IDaoWithOverride extends IDao {
  overrideUrl?: string;
}

export interface IDaoCardProps {
  dao: IDaoWithOverride;
}

export const DaoCard = (props: IDaoCardProps) => {
  const {dao} = props;
  const {name, daoAddress, logo, ens, description, network, overrideUrl} = dao;

  const {isDesktop} = useScreen();
  const {avatar} = useResolveDaoAvatar(logo);

  const daoPage = generatePath(Dashboard, {
    network,
    dao: toDisplayEns(ens) || daoAddress,
  });
  const daoUrl = useHref(daoPage);

  const resolvedDaoUrl = overrideUrl ?? daoUrl;

  return (
    <Container
      href={resolvedDaoUrl}
      target={overrideUrl != null ? '_blank' : undefined}
    >
      <DaoDataWrapper>
        <HeaderContainer>
          <AvatarDao daoName={name} src={logo && avatar} />
          <div className="space-y-0.5 text-left xl:space-y-1">
            <Title>{name}</Title>
          </div>
        </HeaderContainer>
        <Description isDesktop={isDesktop}>{description}</Description>
      </DaoDataWrapper>
      <DaoMetadataWrapper>
        <IconWrapper>
          <Icon
            icon={IconType.BLOCKCHAIN_BLOCKCHAIN}
            className="text-neutral-600"
          />
          <IconLabel>{CHAIN_METADATA[network].name}</IconLabel>
        </IconWrapper>
        {overrideUrl != null && (
          <IconWrapper>
            <AvatarIcon variant="primary" icon={IconType.LINK_EXTERNAL} />
          </IconWrapper>
        )}
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
  className: 'flex flex-row justify-between items-center',
})``;
const IconLabel = styled.p.attrs({
  className: 'text-neutral-600 ft-text-sm',
})``;
const IconWrapper = styled.div.attrs({
  className: 'flex flex-row space-x-2',
})``;

const DaoDataWrapper = styled.div.attrs({
  className: 'flex flex-col grow space-y-3 flex-1',
})``;
