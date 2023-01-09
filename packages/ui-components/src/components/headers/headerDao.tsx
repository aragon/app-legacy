import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

import useScreen from '../../hooks/useScreen';
import {AvatarDao} from '../avatar';
import {ButtonIcon, ButtonText} from '../button';
import {Dropdown} from '../dropdown';
import {
  IconBlock,
  IconChevronDown,
  IconCommunity,
  IconCopy,
  IconFavoriteDefault,
  IconFavoriteSelected,
  IconFlag,
} from '../icons';
import {Link} from '../link';
import {ListItemLink} from '../listItem';

const DEFAULT_LINES_SHOWN = 2;
const DEFAULT_LINKS_SHOWN = 3;

export type HeaderDaoProps = {
  daoName: string;
  daoAvatar?: string;
  daoUrl: string;
  description: string;
  created_at: string;
  daoChain: string;
  daoType: string;
  favorited?: boolean;
  links?: Array<{
    label: string;
    href: string;
  }>;
  translation?: {
    readMore: string;
    readLess: string;
  };
  copiedOnClick?: () => void;
  onFavoriteClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
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
  favorited = false,
  links = [],
  translation,
  copiedOnClick,
  onFavoriteClick,
}) => {
  const [showAll, setShowAll] = useState(true);
  const [shouldClamp, setShouldClamp] = useState(false);

  const {isDesktop} = useScreen();

  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // this should be extracted into a hook if clamping/showing elsewhere
  useEffect(() => {
    function countNumberOfLines() {
      const descriptionEl = descriptionRef.current;

      if (!descriptionEl) return;

      const numberOfLines =
        descriptionEl.offsetHeight /
        parseFloat(getComputedStyle(descriptionEl).lineHeight);

      setShouldClamp(numberOfLines > DEFAULT_LINES_SHOWN);
      setShowAll(numberOfLines <= DEFAULT_LINES_SHOWN);
    }

    countNumberOfLines();

    window.addEventListener('resize', countNumberOfLines);

    return () => {
      window.removeEventListener('resize', countNumberOfLines);
    };
  }, []);

  // always show dropdown if there are links, unless we're on desktop with less than 3 links
  const showDropdown =
    !(links?.length <= DEFAULT_LINKS_SHOWN && isDesktop) && links?.length !== 0;

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
            <Description ref={descriptionRef} {...{fullDescription: showAll}}>
              {description}
            </Description>
            {shouldClamp && (
              <Link
                label={
                  showAll
                    ? `${translation?.readLess || 'Read less'} ↑`
                    : `${translation?.readMore || 'Read more'} ↓`
                }
                className="ft-text-base"
                onClick={() => setShowAll(prevState => !prevState)}
              />
            )}
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
              ?.slice(0, DEFAULT_LINKS_SHOWN)
              ?.map(({label, href}, index: number) => (
                <Link {...{label, href}} external key={index} />
              ))}
          </LinksWrapper>
          <ActionContainer>
            {showDropdown && (
              <Dropdown
                align="start"
                trigger={
                  <ButtonText
                    iconRight={<IconChevronDown />}
                    label={'All Links'}
                    mode="secondary"
                    size="large"
                    bgWhite
                  />
                }
                sideOffset={8}
                className="max-w-xs"
                listItems={links?.map(({label, href}, index: number) => ({
                  component: (
                    <div className="p-1 mb-1.5">
                      <ListItemLink {...{label, href}} key={index} external />
                    </div>
                  ),
                }))}
              />
            )}
            <ButtonIcon
              icon={
                favorited ? <IconFavoriteSelected /> : <IconFavoriteDefault />
              }
              onClick={onFavoriteClick}
              mode="secondary"
              size="large"
              bgWhite
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
  -webkit-line-clamp: ${props =>
    props.fullDescription ? 'unset' : DEFAULT_LINES_SHOWN};
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
