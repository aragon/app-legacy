import React, {useEffect, useMemo, useRef, useState} from 'react';
import {styled} from 'styled-components';
import {useScreen} from '../../hooks';
import {shortenAddress, shortenDaoUrl} from '../../utils';
import {AvatarDao} from '../avatar';
import {Button, Icon, IconType, Dropdown} from '@aragon/ods';
import {Link} from '../link';
import {ListItemLink} from '../listItem';

const DEFAULT_LINES_SHOWN = 2;
const DEFAULT_LINKS_SHOWN = 2;
const DEFAULT_TRANSLATIONS = {
  follow: 'Follow',
  following: 'Following',
  readLess: 'Read less',
  readMore: 'Read more',
};

export type HeaderDaoProps = {
  daoName: string;
  daoAddress: string;
  daoEnsName?: string;
  daoAvatar?: string;
  daoUrl: string;
  description: string;
  created_at: string;
  daoChain: string;
  daoType: string;
  following?: boolean;
  links?: Array<{
    label: string;
    href: string;
  }>;
  translation?: {
    readMore?: string;
    readLess?: string;
    follow?: string;
    following?: string;
  };
  onCopy?: (input: string) => void;
  onFollowClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

type DescriptionProps = {
  fullDescription?: boolean;
};

export const HeaderDao: React.FC<HeaderDaoProps> = ({
  daoName,
  daoAddress,
  daoEnsName,
  daoAvatar,
  daoUrl,
  description,
  created_at,
  daoChain,
  daoType,
  following = false,
  links = [],
  translation = {},
  onCopy,
  onFollowClick,
}) => {
  const labels = {...DEFAULT_TRANSLATIONS, ...translation};

  const [showAll, setShowAll] = useState(true);
  const [shouldClamp, setShouldClamp] = useState(false);

  const {isDesktop} = useScreen();

  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // this should be extracted into a hook if clamping/showing elsewhere
  useEffect(() => {
    function countNumberOfLines() {
      const descriptionEl = descriptionRef.current;

      if (!descriptionEl) {
        return;
      }

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

  const daoCredentialsDropdownItems = useMemo(() => {
    const result = [
      <Dropdown.Item
        key={2}
        onClick={() => onCopy?.(daoAddress)}
        icon={IconType.COPY}
        iconPosition="right"
      >
        {shortenAddress(daoAddress)}
      </Dropdown.Item>,
      <Dropdown.Item
        key={3}
        onClick={() => onCopy?.(`https://${daoUrl}`)}
        icon={IconType.COPY}
        iconPosition="right"
      >
        {shortenDaoUrl(daoUrl)}
      </Dropdown.Item>,
    ];

    if (daoEnsName) {
      result.unshift(
        <Dropdown.Item
          key={1}
          onClick={() => onCopy?.(daoEnsName)}
          icon={IconType.COPY}
          iconPosition="right"
        >
          {shortenAddress(daoEnsName)}
        </Dropdown.Item>
      );
    }

    return result;
  }, [onCopy, daoAddress, daoEnsName, daoUrl]);

  return (
    <Card data-testid="header-dao">
      <ContentWrapper>
        <Content>
          <Title>{daoName}</Title>

          <Dropdown.Container
            align="start"
            customTrigger={
              <CredentialsDropdownTrigger
                label={daoEnsName ? daoEnsName : shortenAddress(daoAddress)}
                iconRight={IconType.CHEVRON_DOWN}
              />
            }
          >
            {daoCredentialsDropdownItems}
          </Dropdown.Container>

          <div className="mt-3">
            <Description ref={descriptionRef} {...{fullDescription: showAll}}>
              {description}
            </Description>
            {shouldClamp && (
              <Link
                {...(showAll
                  ? {
                      label: labels.readLess,
                      iconRight: IconType.CHEVRON_UP,
                    }
                  : {
                      label: labels.readMore,
                      iconRight: IconType.CHEVRON_DOWN,
                    })}
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
            className="h-20 w-20 text-xl leading-tight xl:h-28 xl:w-28 xl:text-2xl"
            {...(daoAvatar && {src: daoAvatar})}
          />
        </AvatarContainer>
      </ContentWrapper>
      <DetailsWrapper>
        <NetworkDetailsContainer>
          <NetworkDetails>
            <Icon icon={IconType.FLAG} className="text-primary-400" />
            <DetailsText>{created_at}</DetailsText>
          </NetworkDetails>
          <NetworkDetails>
            <Icon
              icon={IconType.BLOCKCHAIN_BLOCK}
              className="text-primary-400"
            />
            <DetailsText>{daoChain}</DetailsText>
          </NetworkDetails>
          <NetworkDetails>
            <Icon icon={IconType.APP_MEMBERS} className="text-primary-400" />
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
              <Dropdown.Container
                align="start"
                customTrigger={
                  <Button
                    iconRight={IconType.CHEVRON_DOWN}
                    variant="tertiary"
                    size="lg"
                  >
                    All Links
                  </Button>
                }
              >
                {links?.map(({label, href}, index: number) => (
                  <div className="mb-3 p-2" key={index}>
                    <ListItemLink {...{label, href}} external />
                  </div>
                ))}
              </Dropdown.Container>
            )}
            <Button
              onClick={onFollowClick}
              variant="tertiary"
              size="lg"
              iconLeft={following ? IconType.CHECKMARK : undefined}
            >
              {following ? labels.following : labels.follow}
            </Button>
          </ActionContainer>
        </ActionWrapper>
      </DetailsWrapper>
    </Card>
  );
};

const Card = styled.div.attrs({
  className:
    'w-full bg-neutral-0 md:rounded-xl p-4 md:p-6 xl:p-12 border border-neutral-100 space-y-6',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const ContentWrapper = styled.div.attrs({
  className: 'flex justify-between grid grid-cols-12',
})``;

const Content = styled.div.attrs({
  className: 'col-span-10',
})``;

const AvatarContainer = styled.div.attrs({
  className: 'md:flex hidden justify-end col-span-2 xl:items-center',
})``;

const Title = styled.h1.attrs({
  className: 'ft-text-3xl font-semibold text-neutral-800',
})``;

const Description = styled.p.attrs({
  className: 'font-medium text-neutral-600 ft-text-base',
})<DescriptionProps>`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${props =>
    props.fullDescription ? 'unset' : DEFAULT_LINES_SHOWN};
`;

const DetailsWrapper = styled.div.attrs({
  className: 'flex items-center justify-between flex-col md:flex-row',
})``;

const NetworkDetailsContainer = styled.div.attrs({
  className: 'flex space-x-6 w-full md:w-auto',
})``;

const NetworkDetails = styled.div.attrs({
  className: 'flex space-x-2 items-center justify-center',
})``;

const DetailsText = styled.span.attrs({
  className: 'text-neutral-600 ft-text-sm' as string | undefined,
})``;

const LinksWrapper = styled.div.attrs({
  className: 'space-x-6 hidden xl:flex',
})``;

const ActionContainer = styled.div.attrs({
  className: 'flex space-x-3 w-full justify-between',
})``;

const ActionWrapper = styled.div.attrs({
  className:
    'flex items-center md:space-x-6 justify-between md:justify-start w-full md:w-max space-y-6 md:space-y-0',
})``;

const CredentialsDropdownTrigger = styled(Link).attrs({
  className:
    'mt-3 text-primary-400 hover:text-primary-600 active:text-primary-800 focus-visible:ring focus-visible:ring-primary-200 focus-visible:bg-neutral-50',
})``;
