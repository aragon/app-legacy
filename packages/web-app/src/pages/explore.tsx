// TODO: Remove when statistics are available
/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import styled from 'styled-components';

import {GridLayout} from 'components/layout';
import ActiveProposalsExplore from 'containers/activeProposalsExplore';
import Carousel from 'containers/carousel';
import {DaoExplorer} from 'containers/daoExplorer';
import Hero from 'containers/hero';
import {i18n} from '../../i18n.config';

const Explore: React.FC = () => {
  return (
    <>
      <Hero />
      <GridLayout>
        <ContentWrapper>
          <Carousel />
          {/* Uncomment when statistics are available */}
          {/* <StatisticsContainer>
            {statistics.map((s: Stats) => (
              <Statistic key={s.statKey}>
                <StatisticValue>{s.statValue}</StatisticValue>
                <StatisticKey>{s.statKey}</StatisticKey>
              </Statistic>
            ))}
          </StatisticsContainer> */}
          <DaoExplorer />
          <ActiveProposalsExplore />
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
    'bg-ui-0 grid grid-rows-2 grid-flow-col gap-2 py-2 px-3  rounded-xl desktop:flex desktop:justify-between desktop:px-10 desktop:py-3 text-center',
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
    statKey: i18n.t('explore.statistics.daosCreated'),
    statValue: '5,126',
  },
  {
    statKey: i18n.t('explore.statistics.aragonMembers'),
    statValue: '65,372',
  },
  {
    statKey: i18n.t('explore.statistics.activeProposals'),
    statValue: '1,531',
  },
  {
    statKey: i18n.t('explore.statistics.securedByAragon'),
    statValue: '$19M+',
  },
];

export default Explore;
