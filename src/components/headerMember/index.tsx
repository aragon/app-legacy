import React, {useMemo, ReactNode} from 'react';
import {styled} from 'styled-components';
import {AvatarWallet, shortenAddress, shortenDaoUrl} from '@aragon/ods-old';
import {Button, IconType, Dropdown} from '@aragon/ods';

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
  avatarUrl?: string | null;
  ens?: string;
  actions?: ReactNode;
  stats?: HeaderMemberStat[];
  onCopy?: (input: string) => void;
};

export const HeaderMember: React.FC<HeaderMemberProps> = ({
  address,
  ens,
  profileUrl,
  explorerUrl,
  avatarUrl,
  explorerName,
  actions,
  stats = [],
  onCopy,
}) => {
  const name = ens || shortenAddress(address);

  const credentialsDropdownItems = useMemo(() => {
    const result = [
      <Dropdown.Item
        key={2}
        onClick={() => onCopy?.(address)}
        icon={IconType.COPY}
      >
        {shortenAddress(address)}
      </Dropdown.Item>,
      <Dropdown.Item
        key={3}
        onClick={() => onCopy?.(`https://${profileUrl}`)}
        icon={IconType.COPY}
      >
        {shortenDaoUrl(profileUrl)}
      </Dropdown.Item>,
      <Break key={4} />,
      <Dropdown.Item
        key={5}
        onClick={() => window.open(explorerUrl, '_blank')}
        icon={IconType.LINK_EXTERNAL}
      >
        {explorerName}
      </Dropdown.Item>,
    ];

    if (ens) {
      result.unshift(
        <Dropdown.Item
          key={1}
          onClick={() => onCopy?.(ens)}
          icon={IconType.COPY}
        >
          {ens}
        </Dropdown.Item>
      );
    }

    return result;
  }, [address, ens, explorerName, explorerUrl, onCopy, profileUrl]);

  return (
    <div className="relative">
      <Card totalStats={stats.length}>
        <ContentWrapper>
          <Content>
            <Title>{name}</Title>

            <ActionsContainer>
              <Dropdown.Container
                align="start"
                customTrigger={
                  <Button
                    iconRight={IconType.CHEVRON_DOWN}
                    variant="tertiary"
                    size="md"
                    className="border border-neutral-100"
                  >
                    {shortenAddress(address)}
                  </Button>
                }
              >
                {credentialsDropdownItems}
              </Dropdown.Container>

              {actions}
            </ActionsContainer>
          </Content>
          <AvatarContainer>
            <AvatarWallet size="large" src={avatarUrl || address} />
          </AvatarContainer>
        </ContentWrapper>
      </Card>

      {!!stats.length && (
        <StatsContainer total={stats.length}>
          {stats.map((stat, statIdx) => (
            <StatItem key={`member-stat-${statIdx}`} total={stats.length}>
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

const Card = styled.div.attrs<{totalStats: number}>(props => ({
  className: `w-full bg-neutral-0 md:rounded-xl px-4 pt-4 ${
    props.totalStats > 2 ? 'pb-28' : props.totalStats > 0 ? 'pb-16' : 'pb-4'
  } md:px-12 ${
    props.totalStats > 0 ? 'md:pb-20' : 'md:pb-16'
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

const ActionsContainer = styled.div.attrs({
  className: 'flex justify-between items-center gap-4 mt-6',
})``;

const Break = styled.hr.attrs({
  className: 'border-neutral-100',
})``;

const StatsContainer = styled.div.attrs<{total: number}>({
  className: `relative grid shadow-neutral border-[0.5px] border-neutral-100 rounded-xl overflow-hidden m-auto w-full md:left-10 md:m-0`,
})`
  grid-template-columns: repeat(${props => props.total}, 1fr);
  transform: translateY(-50%);
  width: fit-content;

  @media screen and (max-width: 786px) {
    width: calc(100% - 32px);
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div.attrs<{total: number}>({
  className:
    'flex flex-col gap-0.5 border-[0.5px] border-neutral-100 p-5 text-neutral-500 bg-neutral-0',
})`
  @media screen and (max-width: 786px) {
    &:last-child {
      ${props => (props.total % 2 !== 0 ? 'grid-column-start: 1;' : '')}
      ${props => (props.total % 2 !== 0 ? 'grid-column-end: 3;' : '')}
    }
  }
`;

const StatHeader = styled.div.attrs({
  className: 'flex items-end gap-1',
})``;

const StatValue = styled.div.attrs({
  className: 'text-neutral-800 ft-text-xl',
})``;

const StatDescription = styled.div.attrs({
  className: 'ft-text-sm',
})``;
