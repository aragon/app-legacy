import React, {useEffect, useMemo, useRef, useState, ReactNode} from 'react';
import {styled} from 'styled-components';
import {
  Link,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  Dropdown,
  ButtonText,
  AvatarWallet,
  shortenAddress,
  shortenDaoUrl,
  IconLinkExternal,
} from '@aragon/ods-old';

const DEFAULT_LINES_SHOWN = 2;

const DEFAULT_TRANSLATIONS = {
  readLess: 'Read less',
  readMore: 'Read more',
};

export interface HeaderMemberStat {
  value: ReactNode;
  description: ReactNode;
  helpText?: ReactNode;
}

export type HeaderMemberProps = {
  address: string;
  profileUrl: string;
  explorerUrl: string;
  explorerName: string;
  avatarUrl?: string;
  description?: string;
  ens?: string;
  actions?: ReactNode;
  stats?: HeaderMemberStat[];
  translation?: {
    readMore?: string;
    readLess?: string;
  };
  onCopy?: (input: string) => void;
};

type DescriptionProps = {
  fullDescription?: boolean;
};

export const HeaderMember: React.FC<HeaderMemberProps> = ({
  address,
  ens,
  profileUrl,
  explorerUrl,
  avatarUrl,
  explorerName,
  description,
  actions,
  stats = [],
  translation = {},
  onCopy,
}) => {
  const name = ens || shortenAddress(address);

  const labels = {...DEFAULT_TRANSLATIONS, ...translation};

  const [showAll, setShowAll] = useState(true);
  const [shouldClamp, setShouldClamp] = useState(false);

  const descriptionRef = useRef<HTMLParagraphElement>(null);

  const hasStats = !!stats.length;

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

  const credentialsDropdownItems = useMemo(() => {
    const result = [
      {
        component: (
          <CredentialsDropdownItem key={2} onClick={() => onCopy?.(address)}>
            {shortenAddress(address)}
            <StyledCopyIcon />
          </CredentialsDropdownItem>
        ),
      },
      {
        component: (
          <CredentialsDropdownItem
            key={3}
            onClick={() => onCopy?.(`https://${profileUrl}`)}
          >
            {shortenDaoUrl(profileUrl)}
            <StyledCopyIcon />
          </CredentialsDropdownItem>
        ),
      },
      {
        component: <Break key={4} />,
      },
      {
        component: (
          <CredentialsDropdownItem
            key={5}
            onClick={() => window.open(explorerUrl, '_blank')}
          >
            {explorerName}
            <IconLinkExternal className="text-neutral-400" />
          </CredentialsDropdownItem>
        ),
      },
    ];

    if (ens) {
      result.unshift({
        component: (
          <CredentialsDropdownItem key={1} onClick={() => onCopy?.(ens)}>
            {ens}
            <StyledCopyIcon />
          </CredentialsDropdownItem>
        ),
      });
    }

    return result;
  }, [address, profileUrl, explorerName, ens, onCopy, explorerUrl]);

  return (
    <div className="relative">
      <Card hasStats={hasStats}>
        <ContentWrapper>
          <Content>
            <Title>{name}</Title>

            <div className={description ? 'mt-3' : ''}>
              <Description ref={descriptionRef} {...{fullDescription: showAll}}>
                {description}
              </Description>
              {shouldClamp && (
                <Link
                  {...(showAll
                    ? {
                        label: labels.readLess,
                        iconRight: <IconChevronUp />,
                      }
                    : {
                        label: labels.readMore,
                        iconRight: <IconChevronDown />,
                      })}
                  className="ft-text-base"
                  onClick={() => setShowAll(prevState => !prevState)}
                />
              )}
            </div>

            <ActionsContainer>
              <Dropdown
                className="z-20 w-60"
                align="start"
                trigger={
                  <ButtonText
                    label={shortenAddress(address)}
                    iconRight={<IconChevronDown />}
                    mode="secondary"
                    className="border border-neutral-100"
                  />
                }
                sideOffset={8}
                listItems={credentialsDropdownItems}
              />

              {actions}
            </ActionsContainer>
          </Content>
          <AvatarContainer>
            <AvatarWallet size="large" src={avatarUrl || address} />
          </AvatarContainer>
        </ContentWrapper>
      </Card>

      {!!stats.length && (
        <StatsContainer total={4}>
          {stats.map((stat, statIdx) => (
            <StatItem key={`member-stat-${statIdx}`}>
              <StatHeader>
                <StatValue>{stat.value}</StatValue>
                {stat.helpText && <div>{stat.helpText}</div>}
              </StatHeader>
              <StatDescription>{stat.description}</StatDescription>
            </StatItem>
          ))}
        </StatsContainer>
      )}
    </div>
  );
};

const Card = styled.div.attrs<{hasStats: boolean}>(props => ({
  className: `w-full bg-neutral-0 md:rounded-xl p-4 md:px-12 ${
    props.hasStats ? 'md:pb-20' : 'md:pb-16'
  } md:pt-12 border border-neutral-100 space-y-6 relative`,
}))`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const ContentWrapper = styled.div.attrs({
  className: 'flex md:justify-between flex-col-reverse md:flex-row',
})``;

const Content = styled.div.attrs({
  className: 'col-span-10',
})``;

const AvatarContainer = styled.div.attrs({
  className: 'flex mb-3 md:mb-0 md:justify-end col-span-2',
})``;

const Title = styled.h1.attrs({
  className: 'ft-text-2xl font-semibold text-neutral-800',
})``;

const Description = styled.p.attrs({
  className: 'font-medium text-neutral-600 ft-text-lg',
})<DescriptionProps>`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${props =>
    props.fullDescription ? 'unset' : DEFAULT_LINES_SHOWN};
`;

const ActionsContainer = styled.div.attrs({
  className: 'flex justify-between items-center gap-4 mt-6',
})``;

const CredentialsDropdownItem = styled.div.attrs({
  className: `flex text-neutral-600 items-center justify-between gap-3 py-3 font-semibold ft-text-base hover:bg-primary-50 px-4 rounded-xl hover:text-primary-400`,
})``;

const Break = styled.hr.attrs({
  className: 'border-neutral-100',
})``;

const StyledCopyIcon = styled(IconCopy).attrs({
  className: 'text-neutral-400',
})``;

const StatsContainer = styled.div.attrs<{total: number}>(props => ({
  className: `relative grid grid-cols-2 shadow-neutral border-[0.5px] border-neutral-100 rounded-xl overflow-hidden mt-6 md:mt-0 m-auto w-full md:w-[fit-content] md:absolute md:-bottom-11 md:left-10 md:grid-cols-${props.total}`,
}))``;

const StatItem = styled.div.attrs({
  className:
    'flex flex-col gap-0.5 border-[0.5px] border-neutral-100 p-5 text-neutral-500 bg-neutral-0',
})``;

const StatHeader = styled.div.attrs({
  className: 'flex items-end gap-1',
})``;

const StatValue = styled.div.attrs({
  className: 'text-neutral-800 ft-text-xl',
})``;

const StatDescription = styled.div.attrs({
  className: 'ft-text-sm',
})``;
