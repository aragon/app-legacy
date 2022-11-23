import styled from 'styled-components';
import React, {useState} from 'react';

import {
  IconBlock,
  IconChevronDown,
  IconCommunity,
  IconCopy,
  IconFlag,
  IconFavoriteSelected,
} from '../icons';
import {AvatarDao} from '../avatar';
import {Link} from '../link';
import {ButtonIcon, ButtonText} from '../button';
import {Dropdown} from '../dropdown';
import {ListItemLink} from '../listItem';

export type HeaderDaoProps = {
  daoName: string;
  daoAvatar?: string;
  daoUrl: string;
  description: string;
  created_at: string;
  daoChain: string;
  daoType: string;
  links: Array<{
    label: string;
    href: string;
  }>;
  translation?: {
    readMore: string;
    readLess: string;
  };
  copiedOnClick?: () => void;
};

type DescriptionProps = {
  fullDescription?: boolean;
};

export const HeaderDao: React.FC<HeaderDaoProps> = ({
  daoName,
  daoAvatar,
  daoUrl,
  description,
  created_at,
  daoChain,
  daoType,
  links,
  translation,
  copiedOnClick,
}) => {
  const [fullDescription, setFullDescription] = useState<boolean>(false);

  return (
    <Card data-testid="header-dao">
      <ContentWrapper>
        <Content>
          <Title>{daoName}</Title>
          <Link
            label={daoUrl}
            iconRight={<IconCopy />}
            onClick={copiedOnClick}
          />
          <div>
            <Description {...{fullDescription}}>{description}</Description>
            <Link
              label={
                fullDescription
                  ? `${translation?.readLess || 'Read less'} ↑`
                  : `${translation?.readMore || 'Read more'} ↓`
              }
              className="ft-text-base"
              onClick={() => setFullDescription(prevState => !prevState)}
            />
          </div>
        </Content>
        <AvatarContainer>
          <AvatarDao
            daoName={daoName || ''}
            size="unset"
            className="w-10 desktop:w-14 h-10 desktop:h-14 text-lg desktop:text-xl"
            {...(daoAvatar && {src: daoAvatar})}
          />
        </AvatarContainer>
      </ContentWrapper>
      <DetailsWrapper>
        <NetworkDetailsContainer>
          <NetworkDetails>
            <IconFlag className="text-primary-400" />
            <DetailsText>{created_at}</DetailsText>
          </NetworkDetails>
          <NetworkDetails>
            <IconBlock className="text-primary-400" />
            <DetailsText className="capitalize">{daoChain}</DetailsText>
          </NetworkDetails>
          <NetworkDetails>
            <IconCommunity className="text-primary-400" />
            <DetailsText>{daoType}</DetailsText>
          </NetworkDetails>
        </NetworkDetailsContainer>
        <ActionWrapper>
          <LinksWrapper>
            {links
              ?.slice(0, 3)
              ?.map(
                (
                  {label, href}: HeaderDaoProps['links'][number],
                  index: number
                ) => (
                  <Link {...{label, href}} external key={index} />
                )
              )}
          </LinksWrapper>
          <ActionContainer>
            <Dropdown
              align="start"
              trigger={
                <ButtonText
                  iconRight={<IconChevronDown />}
                  label={'All Links'}
                  mode="ghost"
                  size="large"
                />
              }
              sideOffset={8}
              className="max-w-xs"
              listItems={links?.map(
                (
                  {label, href}: HeaderDaoProps['links'][number],
                  index: number
                ) => ({
                  component: (
                    <div className="p-1 mb-1.5">
                      <ListItemLink {...{label, href}} key={index} external />
                    </div>
                  ),
                })
              )}
            />
            <ButtonIcon
              icon={<StyledIconFavoriteSelected />}
              mode="ghost"
              size="large"
            />
          </ActionContainer>
        </ActionWrapper>
      </DetailsWrapper>
    </Card>
  );
};

const Card = styled.div.attrs({
  className:
    'w-full bg-white tablet:rounded-xl p-2 tablet:p-3 desktop:p-6 border border-ui-100 space-y-3',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const ContentWrapper = styled.div.attrs({
  className: 'flex justify-between grid grid-cols-12',
})``;

const Content = styled.div.attrs({
  className: 'col-span-10 space-y-1.5',
})``;

const AvatarContainer = styled.div.attrs({
  className: 'tablet:flex hidden justify-end col-span-2 desktop:items-center',
})``;

const Title = styled.h1.attrs({
  className: 'ft-text-3xl font-bold text-ui-800',
})``;

const Description = styled.p.attrs({
  className: 'font-medium text-ui-600 ft-text-base',
})<DescriptionProps>`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${props => (props.fullDescription ? 'unset' : 2)};
`;

const DetailsWrapper = styled.div.attrs({
  className: 'flex items-center justify-between flex-col tablet:flex-row',
})``;

const NetworkDetailsContainer = styled.div.attrs({
  className: 'flex space-x-3 w-full tablet:w-auto',
})``;

const NetworkDetails = styled.div.attrs({
  className: 'flex space-x-1 items-center justify-center',
})``;

const DetailsText = styled.span.attrs({
  className: 'text-ui-600 ft-text-sm' as string | undefined,
})``;

const LinksWrapper = styled.div.attrs({
  className: 'space-x-3 hidden desktop:flex',
})``;

const ActionContainer = styled.div.attrs({
  className: 'flex space-x-1.5 w-full justify-between',
})``;

const ActionWrapper = styled.div.attrs({
  className:
    'flex items-center tablet:space-x-3 justify-between tablet:justify-start w-full tablet:w-max space-y-3 tablet:space-y-0',
})``;

const StyledIconFavoriteSelected = styled(IconFavoriteSelected).attrs({
  className: 'text-ui-600',
})``;
