import {ActionListItem, IconExpand} from '@aragon/ui-components';
import React from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {GridLayout} from 'components/layout';
import {TemporarySection} from 'components/temporary';
import ActiveProposalsExplore from 'containers/activeProposalsExplore';
import Carousel from 'containers/carousel';
import {DaoExplorer} from 'containers/daoExplorer';
import Hero from 'containers/hero';
import {Dashboard} from 'utils/paths';

const Explore: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Hero />
      <GridLayout>
        <ContentWrapper>
          <Carousel />
          <StatisticsContainer>
            {statistics.map((s: Stats) => (
              <Statistic key={s.statKey}>
                <StatisticValue>{s.statValue}</StatisticValue>
                <StatisticKey>{s.statKey}</StatisticKey>
              </Statistic>
            ))}
          </StatisticsContainer>
          <DaoExplorer />
          <ActiveProposalsExplore />
          <div className="h-20" />
          <TemporarySection purpose="It allows you to navigate to a mock dao to test daos URLs.">
            <ActionListItem
              title={'ERC20Voting DAO'}
              subtitle={'Rinkeby Testnet'}
              icon={<IconExpand />}
              background={'white'}
              onClick={() => {
                navigate(
                  generatePath(Dashboard, {
                    network: 'rinkeby',
                    dao: '0x663ac3c648548eb8ccd292b41a8ff829631c846d',
                  })
                );
              }}
            />
            <ActionListItem
              title={'WhiteListVoting DAO'}
              subtitle={'Rinkeby Testnet'}
              icon={<IconExpand />}
              background={'white'}
              onClick={() => {
                navigate(
                  generatePath(Dashboard, {
                    network: 'rinkeby',
                    dao: '0xb2af1aab06a01dd3e4c4f420f91bda89efe15531',
                  })
                );
              }}
            />

            <ActionListItem
              title={'Non-existing dao: 0x1234'}
              subtitle={'Rinkeby testnet'}
              icon={<IconExpand />}
              background={'white'}
              onClick={() =>
                navigate(
                  generatePath(Dashboard, {network: 'rinkeby', dao: '0x1234'})
                )
              }
            />
          </TemporarySection>
        </ContentWrapper>
      </GridLayout>
    </>
  );
};

/* STYLES =================================================================== */

const ContentWrapper = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-2 desktop:col-end-12 space-y-5 desktop:space-y-9 mb-5 desktop:mb-10 pb-5',
})``;

const StatisticsContainer = styled.div.attrs({
  className:
    'bg-ui-0 grid grid-rows-2 grid-flow-col gap-y-2 py-2 px-3  rounded-xl desktop:flex desktop:justify-between desktop:px-10 desktop:py-3 ',
})``;

const Statistic = styled.div.attrs({
  className: 'flex flex-col items-center space-y-0.5',
})``;

const StatisticValue = styled.p.attrs({
  className: 'text-primary-500 font-bold ft-text-2xl',
})``;

const StatisticKey = styled.p.attrs({
  className: 'text-ui-800 ft-text-base',
})``;

/* MOCK DATA ================================================================ */

type Stats = {
  statKey: string;
  statValue: string;
};
const statistics: Stats[] = [
  {
    statKey: 'DAOs Created',
    statValue: '5,126',
  },
  {
    statKey: 'Members in PbA',
    statValue: '65,372',
  },
  {
    statKey: 'Active Proposals',
    statValue: '1,531',
  },
  {
    statKey: 'in Treasury',
    statValue: '$19M+',
  },
];

export default Explore;
