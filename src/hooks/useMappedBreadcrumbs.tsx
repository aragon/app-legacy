import {
  IconCommunity,
  IconDashboard,
  IconFinance,
  IconGovernance,
  IconSettings,
  Tag,
  TagColorScheme,
  TagProps,
} from '@aragon/ods-old';
import {ProposalStatus} from '@aragon/sdk-client-common';
import React, {useMemo} from 'react';
import {useMatch} from 'react-router-dom';
import useBreadcrumbs, {BreadcrumbData} from 'use-react-router-breadcrumbs';

import {useTranslation} from 'react-i18next';
import * as Paths from 'utils/paths';
import {useCache} from './useCache';

type MappedBreadcrumbs = {
  breadcrumbs: {
    path: string;
    label: string;
  }[];
  tag?: React.FunctionComponentElement<TagProps>;
  icon: JSX.Element;
};

type ProposalStatusColorMap = {
  [key in ProposalStatus]: TagColorScheme;
};

const proposalStatusColorMap: ProposalStatusColorMap = {
  [ProposalStatus.ACTIVE]: 'info',
  [ProposalStatus.PENDING]: 'neutral',
  [ProposalStatus.SUCCEEDED]: 'success',
  [ProposalStatus.EXECUTED]: 'success',
  [ProposalStatus.DEFEATED]: 'critical',
};

const routes = Object.values(Paths).map(path => {
  if (path === Paths.Proposal) {
    return {path, breadcrumb: 'Proposal'};
  }
  return {path};
});

function basePathIcons(path: string) {
  if (path.includes('dashboard')) return <IconDashboard />;
  if (path.includes('community')) return <IconCommunity />;
  if (path.includes('finance')) return <IconFinance />;
  if (path.includes('settings')) return <IconSettings />;
  else return <IconGovernance />;
}

export function useMappedBreadcrumbs(): MappedBreadcrumbs {
  const {t} = useTranslation();
  const {get, cache} = useCache();

  // TODO this is temporary solution to update status in navigation bar
  // This useCache should be removed in future
  const proposalStatus: ProposalStatus = useMemo(
    () => get('proposalStatus'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [get, cache]
  );

  const breadcrumbs = useBreadcrumbs(routes, {
    excludePaths: [
      Paths.Dashboard,
      Paths.NotFound,
      '/daos/:network/:dao/governance/proposals',
      '/daos/:network/:dao/',
      '/daos/:network/',
      '/daos/',
      '/',
    ],
  }).map((item: BreadcrumbData<string>) => {
    return {
      path: item.match.pathname,
      label: item.breadcrumb as string,
    };
  });

  const icon = breadcrumbs[0]
    ? basePathIcons(breadcrumbs[0].path)
    : basePathIcons('governance');

  const isProposalDetail = useMatch(Paths.Proposal) !== null;

  let tag;
  if (isProposalDetail && proposalStatus) {
    const colorScheme =
      proposalStatus === t('votingTerminal.status.approved')
        ? proposalStatusColorMap.Succeeded
        : proposalStatusColorMap[proposalStatus];
    tag = (
      <Tag
        label={proposalStatus}
        className="capitalize"
        colorScheme={colorScheme}
      />
    );
  }

  return {breadcrumbs, icon, tag};
}
