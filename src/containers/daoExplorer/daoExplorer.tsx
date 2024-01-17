import {ButtonText, IconChevronDown, Spinner} from '@aragon/ods-old';
import React, {useMemo, useReducer, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {Address} from 'viem';

import {DaoCard} from 'components/daoCard';
import DaoFilterModal, {DEFAULT_FILTERS} from 'containers/daoFilterModal';
import {daoFiltersReducer} from 'containers/daoFilterModal/reducer';
import {NavigationDao} from 'context/apolloClient';
import {useFollowedDaosInfiniteQuery} from 'hooks/useFollowedDaos';
import {useWallet} from 'hooks/useWallet';
import {IDao} from 'services/aragon-backend/domain/dao';
import {OrderDirection} from 'services/aragon-backend/domain/ordered-request';
import {useDaos} from 'services/aragon-backend/queries/use-daos';
import {getSupportedNetworkByChainId} from 'utils/constants';

const followedDaoToDao = (dao: NavigationDao): IDao => ({
  address: dao.address as Address,
  ens: dao.ensDomain,
  network: getSupportedNetworkByChainId(dao.chain)!,
  name: dao.metadata.name,
  description: dao.metadata.description ?? '',
  logo: dao.metadata.avatar ?? '',
  createdAt: '',
  governanceId: dao.plugins[0].id,
});

export const DaoExplorer = () => {
  const {t} = useTranslation();
  const {isConnected, address} = useWallet();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, dispatch] = useReducer(daoFiltersReducer, DEFAULT_FILTERS);

  const useFollowList = filters.quickFilter === 'following' && isConnected;
  const memberAddress =
    filters.quickFilter === 'memberOf' && address ? address : undefined;

  const followedDaosResult = useFollowedDaosInfiniteQuery(
    {
      governanceIds: filters.governanceIds,
      networks: filters.networks,
    },
    {enabled: useFollowList}
  );

  const newDaosResult = useDaos(
    {
      direction: OrderDirection.DESC,
      orderBy: 'CREATED_AT' as const,
      governanceIds: filters.governanceIds,
      networks: filters.networks,
      memberAddress,
    },
    {enabled: !useFollowList}
  );

  const newDaoList = newDaosResult.data?.pages.flatMap(page => page.data);
  const followedDaoList = useMemo(
    () =>
      followedDaosResult.data?.pages.flatMap(page =>
        page.data.map(followedDaoToDao)
      ) ?? [],
    [followedDaosResult.data]
  );

  const filteredDaoList = useFollowList ? followedDaoList : newDaoList;
  const {isLoading, hasNextPage, isFetchingNextPage, fetchNextPage} =
    useFollowList ? followedDaosResult : newDaosResult;

  const totalDaosShown = filteredDaoList?.length ?? 0;
  const totalDaos =
    (useFollowList
      ? followedDaosResult.data?.pages[0].total
      : newDaosResult.data?.pages[0].total) ?? 0;

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <Container>
      <MainContainer>
        <HeaderWrapper>
          <Title>{t('explore.explorer.title')}</Title>

          {/* PLEASE REMOVE ME: @Sepehr */}
          <button
            onClick={() => {
              setShowAdvancedFilters(true);
            }}
          >
            SHOW ADVANCE FILTERS
          </button>
        </HeaderWrapper>
        <CardsWrapper>
          {filteredDaoList?.map(dao => <DaoCard key={dao.address} dao={dao} />)}
          {isLoading && <Spinner size="default" />}
        </CardsWrapper>
      </MainContainer>
      {totalDaos > 0 && totalDaosShown > 0 && (
        <div className="flex items-center lg:gap-x-6">
          {hasNextPage && (
            <ButtonText
              label={t('explore.explorer.showMore')}
              className="self-start"
              iconRight={
                isFetchingNextPage ? <Spinner size="xs" /> : <IconChevronDown />
              }
              bgWhite={true}
              mode="ghost"
              onClick={() => fetchNextPage()}
            />
          )}
          <span className="ml-auto font-semibold text-neutral-800 ft-text-base lg:ml-0">
            {t('explore.pagination.label.amountOf DAOs', {
              amount: totalDaosShown,
              total: totalDaos,
            })}
          </span>
        </div>
      )}
      <DaoFilterModal
        isOpen={showAdvancedFilters}
        filters={filters}
        onFilterChange={dispatch}
        onClose={() => {
          setShowAdvancedFilters(false);
        }}
      />
    </Container>
  );
};

const MainContainer = styled.div.attrs({
  className: 'flex flex-col space-y-4 xl:space-y-6',
})``;
const Container = styled.div.attrs({
  className: 'flex flex-col space-y-3',
})``;
const HeaderWrapper = styled.div.attrs({
  className:
    'flex flex-col space-y-4 xl:flex-row xl:space-y-0 xl:justify-between',
})``;
const CardsWrapper = styled.div.attrs({
  className: 'grid grid-cols-1 gap-3 xl:grid-cols-2 xl:gap-6',
})``;
const Title = styled.p.attrs({
  className: 'font-semibold ft-text-xl text-neutral-800',
})``;
