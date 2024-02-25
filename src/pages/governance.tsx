import React, {useState} from 'react';
import {ButtonGroup, IllustrationHuman, Option} from '@aragon/ods-old';
import {Button, Icon, IconType} from '@aragon/ods';
import {ProposalStatus} from '@aragon/sdk-client-common';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import ProposalList from 'components/proposalList';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import PageEmptyState from 'containers/pageEmptyState';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {trackEvent} from 'services/analytics';
import {useProposals} from 'services/aragon-sdk/queries/use-proposals';
import {featureFlags} from 'utils/featureFlags';
import {htmlIn} from 'utils/htmlIn';
import {toDisplayEns} from 'utils/library';
import {useNetwork} from 'context/network';
import {NewProposal} from 'utils/paths';
import {ProposalTypes} from 'utils/types';

export const Governance: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {isMobile} = useScreen();
  const {open} = useGlobalModalContext();
  const {network} = useNetwork();

  const [filter, setFilter] = useState<ProposalStatus | 'All'>('All');

  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins[0].id as PluginTypes | undefined;
  const pluginAddress = daoDetails?.plugins[0].instanceAddress;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetched,
    isLoading: proposalsLoading,
  } = useProposals({
    daoAddressOrEns: daoDetails?.address,
    pluginType,
    pluginAddress: pluginAddress ?? '',
    status: filter !== 'All' ? filter : undefined,
  });

  const noProposals =
    isFetched && data?.pages[0].length === 0 && filter === 'All';

  const isTokenBasedDao = pluginType === 'token-voting.plugin.dao.eth';
  const enableDelegation =
    isTokenBasedDao &&
    featureFlags.getValue('VITE_FEATURE_FLAG_DELEGATION') === 'true';

  /*************************************************
   *             Callbacks & Handlers              *
   *************************************************/
  const handleNewProposalClick = () => {
    trackEvent('governance_newProposalBtn_clicked', {
      dao_address: daoDetails?.address as string,
    });
    navigate(
      generatePath(NewProposal, {
        type: ProposalTypes.Default,
        network,
        dao: toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address,
      })
    );
  };

  const handleShowMoreClick = () => {
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  // NOTE: only thing that relies on this loading state
  // is whether the delegate button is shown
  if (daoDetailsLoading) {
    return <Loading />;
  }

  // Empty State
  if (noProposals) {
    return (
      <PageEmptyState
        title={t('governance.emptyState.title')}
        subtitle={htmlIn(t)('governance.emptyState.subtitle')}
        Illustration={
          <IllustrationHuman
            {...{
              body: 'voting',
              expression: 'smile',
              hair: 'middle',
              accessory: 'earrings_rhombus',
              sunglass: 'big_rounded',
            }}
            {...(isMobile
              ? {height: 165, width: 295}
              : {height: 225, width: 400})}
          />
        }
        primaryButton={{
          label: t('newProposal.title'),
          onClick: handleNewProposalClick,
        }}
        secondaryButton={
          enableDelegation
            ? {
                label: t('governance.actionSecondary'),
                onClick: () => open('delegateVoting'),
              }
            : undefined
        }
      />
    );
  }

  return (
    <PageWrapper
      title={'Proposals'}
      primaryBtnProps={{
        label: t('governance.action'),
        iconLeft: <Icon icon={IconType.PLUS} />,
        onClick: handleNewProposalClick,
      }}
      secondaryBtnProps={
        enableDelegation
          ? {
              label: t('governance.actionSecondary'),
              onClick: () => open('delegateVoting'),
            }
          : undefined
      }
    >
      <ButtonGroupContainer>
        <ButtonGroup
          bgWhite
          defaultValue={filter}
          onChange={(selected: string) => {
            setFilter(selected as ProposalStatus | 'All');
          }}
        >
          <Option value="All" label="All" />
          <Option value="Pending" label="Pending" />
          <Option value="Active" label="Active" />
          <Option value="Succeeded" label="Succeeded" />
          <Option value="Executed" label="Executed" />
          <Option value="Defeated" label="Defeated" />
        </ButtonGroup>
      </ButtonGroupContainer>
      <ListWrapper>
        <ProposalList
          daoAddressOrEns={
            toDisplayEns(daoDetails?.ensDomain) ||
            (daoDetails?.address as string)
          }
          proposals={data?.pages.flat() ?? []}
          pluginAddress={pluginAddress as string}
          pluginType={pluginType as PluginTypes}
          isLoading={proposalsLoading}
        />
      </ListWrapper>

      {hasNextPage && (
        <div className="mt-6">
          <Button
            isLoading={isFetchingNextPage}
            iconRight={isFetchingNextPage ? undefined : IconType.CHEVRON_DOWN}
            variant="tertiary"
            size="md"
            onClick={handleShowMoreClick}
          >
            {t('explore.explorer.showMore')}
          </Button>
        </div>
      )}
    </PageWrapper>
  );
};

export const Container = styled.div.attrs({
  className: 'col-span-full xl:col-start-3 xl:col-end-11',
})``;

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex overflow-auto mt-6 xl:mt-16',
})`
  scrollbar-width: none;

  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
`;

const ListWrapper = styled.div.attrs({
  className: 'mt-6',
})``;
