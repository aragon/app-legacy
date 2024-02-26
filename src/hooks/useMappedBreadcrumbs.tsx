import React, {useMemo} from 'react';
import {IconType, Tag, ITagProps} from '@aragon/ods';
import {ProposalStatus} from '@aragon/sdk-client-common';
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
  tag?: React.FunctionComponentElement<ITagProps>;
  icon: IconType;
};

type ProposalStatusColorMap = {
  [key in ProposalStatus]: ITagProps['variant'];
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
  if (path.includes('dashboard')) return IconType.APP_DASHBOARD;
  if (path.includes('community')) return IconType.APP_MEMBERS;
  if (path.includes('finance')) return IconType.APP_ASSETS;
  if (path.includes('settings')) return IconType.SETTINGS;
  else return IconType.APP_PROPOSALS;
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
        variant={colorScheme}
      />
    );
  }

  return {breadcrumbs, icon, tag};
}
