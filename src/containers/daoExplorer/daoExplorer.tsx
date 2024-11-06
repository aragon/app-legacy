import React, {useMemo, useReducer, useState} from 'react';
import {Spinner, Button, IconType, CardEmptyState, Dropdown} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {Address} from 'viem';

import {DaoCard} from 'components/daoCard';
import DaoFilterModal, {DEFAULT_FILTERS} from 'containers/daoFilterModal';
import {
  FilterActionTypes,
  daoFiltersReducer,
} from 'containers/daoFilterModal/reducer';
import {NavigationDao} from 'context/apolloClient';
import {useFollowedDaosInfiniteQuery} from 'hooks/useFollowedDaos';
import {useWallet} from 'hooks/useWallet';
import {IDao} from 'services/aragon-backend/domain/dao';
import {OrderDirection} from 'services/aragon-backend/domain/ordered-request';
import {useDaos} from 'services/aragon-backend/queries/use-daos';
import {getSupportedNetworkByChainId} from 'utils/constants';
import {
  QuickFilterValue,
  OrderByValue,
  quickFilters,
} from '../daoFilterModal/data';
import {Toggle, ToggleGroup} from '@aragon/ods';
import {useFeaturedDaos} from 'hooks/useFeaturedDaos';
import classNames from 'classnames';
import {useScreen} from '@aragon/ods-old';

const followedDaoToDao = (dao: NavigationDao): IDao => ({
  creatorAddress: '' as Address,
  daoAddress: dao.address as Address,
  ens: dao.ensDomain,
  network: getSupportedNetworkByChainId(dao.chain)!,
  name: dao.metadata.name,
  description: dao.metadata.description ?? '',
  logo: dao.metadata.avatar ?? '',
  createdAt: '',
  pluginName: dao.plugins[0].id,
});

export const DaoExplorer = () => {
  const {t} = useTranslation();
  const {isConnected, address, methods} = useWallet();

  const {isMobile} = useScreen();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [filters, dispatch] = useReducer(daoFiltersReducer, DEFAULT_FILTERS);

  const useFollowList = filters.quickFilter === 'following' && isConnected;

  const followedDaosResult = useFollowedDaosInfiniteQuery(
    {
      pluginNames: filters.pluginNames,
      networks: filters.networks,
    },
    {enabled: useFollowList}
  );

  const newDaosResult = useDaos(
    {
      take: 12,
      direction: OrderDirection.DESC,
      orderBy: filters.order,
      ...(filters.pluginNames?.length !== 0 && {
        pluginNames: filters.pluginNames,
      }),
      ...(filters.networks?.length !== 0 && {
        networks: filters.networks,
      }),
      ...(filters.quickFilter === 'memberOf' && address
        ? {memberAddress: address}
        : {}),
    },
    {enabled: useFollowList === false}
  );

  const newDaoList = newDaosResult.data?.pages.flatMap(page => page.data);

  const filtersCount = useMemo(() => {
    let count = 0;

    if (!filters) return '';

    // plugin Name filter
    if (filters.pluginNames?.length !== 0) count++;

    // network filter
    if (filters.networks?.length !== 0) count++;

    return count !== 0 ? count.toString() : '';
  }, [filters]);

  const followedDaoList = useMemo(
    () =>
      followedDaosResult.data?.pages
        .flatMap(page => page.data)
        .map(followedDaoToDao)
        .filter(dao => dao.network),
    [followedDaosResult]
  );

  const filteredDaoList = useFollowList ? followedDaoList : newDaoList;

  const {isLoading, hasNextPage, isFetchingNextPage, fetchNextPage} =
    useFollowList ? followedDaosResult : newDaosResult;

  const {data: featuredDaoList, isLoading: isLoadingFeaturedDaos} =
    useFeaturedDaos();

  const totalDaos = useFollowList
    ? followedDaosResult.data?.pages[0].total ?? 0
    : newDaosResult.data?.pages[0].total ?? 0;

  const toggleQuickFilters = (value?: string | string[]) => {
    if (value && !Array.isArray(value)) {
      dispatch({
        type: FilterActionTypes.SET_QUICK_FILTER,
        payload: value as QuickFilterValue,
      });
    }
  };

  const toggleOrderby = (value?: string) => {
    if (value)
      dispatch({
        type: FilterActionTypes.SET_ORDER,
        payload: value as OrderByValue,
      });
  };

  const totalDaosShown = filteredDaoList?.length ?? 0;

  const noDaosFound = isLoading === false && totalDaos === 0;

  const noFeaturedDaosFound =
    isLoadingFeaturedDaos === false &&
    featuredDaoList == null &&
    filters.quickFilter === 'featuredDaos';

  const handleClearFilters = () => {
    dispatch({type: FilterActionTypes.RESET, payload: DEFAULT_FILTERS});
  };

  const handleWalletButtonClick = () => {
    if (isConnected) {
      return;
    }

    methods.selectWallet().catch((err: Error) => {
      console.error(err);
    });
  };

  const showSortFilter = filters.quickFilter === 'allDaos';

  const filterGroupClassName = classNames('flex justify-between w-full', {
    'flex flex-col gap-y-3 md:flex-row md:justify-between': isConnected,
  });

  const toggleGroupClassName = classNames('flex flex-row w-full', {
    'grid w-full grid-cols-2 gap-1 text-center md:flex md:w-fit md:flex-row':
      isConnected,
  });

  const toggleClassName = classNames({
    'flex w-full justify-center md:w-fit': isConnected,
  });

  const buttonGroupContainerClassName = classNames('shrink-0 flex gap-x-3', {
    'flex md:w-fit': !isConnected && filters.quickFilter === 'featuredDaos',
    'flex gap-x-3 w-full md:w-fit justify-between':
      isConnected && filters.quickFilter !== 'featuredDaos',
  });

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <Container>
      <MainContainer>
        <div className={filterGroupClassName}>
          <ToggleGroup
            isMultiSelect={false}
            value={filters.quickFilter}
            onChange={toggleQuickFilters}
            className={toggleGroupClassName}
          >
            {quickFilters
              .filter(f => {
                if (
                  !isConnected &&
                  (f.value === 'memberOf' || f.value === 'following')
                ) {
                  return false;
                }
                return true;
              })
              .map(f => (
                <Toggle
                  key={f.value}
                  label={t(f.label)}
                  value={f.value}
                  className={toggleClassName}
                />
              ))}
          </ToggleGroup>
          <div className={buttonGroupContainerClassName}>
            {showSortFilter && (
              <div className="flex gap-x-1">
                <Button
                  variant={filtersCount !== '' ? 'secondary' : 'tertiary'}
                  size="md"
                  iconLeft={IconType.FILTER}
                  onClick={() => setShowAdvancedFilters(true)}
                >
                  {filtersCount}
                </Button>

                <Dropdown.Container
                  align="end"
                  open={activeDropdown}
                  onOpenChange={e => {
                    setActiveDropdown(e);
                  }}
                  customTrigger={
                    <Button
                      variant={activeDropdown ? 'secondary' : 'tertiary'}
                      size="md"
                      iconLeft={IconType.SORT_DESC}
                    />
                  }
                >
                  <Dropdown.Item
                    icon={
                      filters.order === 'tvl' ? IconType.CHECKMARK : undefined
                    }
                    selected={filters.order === 'tvl'}
                    onClick={() => toggleOrderby('tvl')}
                  >
                    {t('explore.sortBy.largestTreasury')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    icon={
                      filters.order === 'proposals'
                        ? IconType.CHECKMARK
                        : undefined
                    }
                    iconPosition="right"
                    selected={filters.order === 'proposals'}
                    onClick={() => toggleOrderby('proposals')}
                  >
                    {t('explore.sortBy.mostProposals')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    icon={
                      filters.order === 'members'
                        ? IconType.CHECKMARK
                        : undefined
                    }
                    iconPosition="right"
                    selected={filters.order === 'members'}
                    onClick={() => toggleOrderby('members')}
                  >
                    {t('explore.sortBy.largestCommunity')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    icon={
                      filters.order === 'createdAt'
                        ? IconType.CHECKMARK
                        : undefined
                    }
                    iconPosition="right"
                    selected={filters.order === 'createdAt'}
                    onClick={() => toggleOrderby('createdAt')}
                  >
                    {t('explore.sortBy.recentlyCreated')}
                  </Dropdown.Item>
                </Dropdown.Container>
              </div>
            )}
            {isMobile && !isConnected && filters.quickFilter === 'allDaos' ? (
              <Button
                size="md"
                href="/#/create"
                onClick={handleWalletButtonClick}
                iconLeft={IconType.PLUS}
              />
            ) : (
              <Button
                size="md"
                href="/#/create"
                onClick={handleWalletButtonClick}
                className="w-fit"
              >
                {t('cta.create.actionLabel')}
              </Button>
            )}
          </div>
        </div>
        {noDaosFound || noFeaturedDaosFound ? (
          <CardEmptyState
            objectIllustration={{object: 'MAGNIFYING_GLASS'}}
            heading={t('explore.emptyStateSearch.title')}
            description={t('explore.emptyStateSearch.description')}
            secondaryButton={{
              label: t('explore.emptyStateSearch.ctaLabel'),
              iconLeft: IconType.RELOAD,
              onClick: handleClearFilters,
              className: 'w-full',
            }}
          />
        ) : (
          <CardsWrapper>
            {filters.quickFilter === 'featuredDaos' ? (
              <>
                {featuredDaoList?.map(
                  (dao: IDao, index: React.Key | null | undefined) => (
                    <DaoCard key={index} dao={dao} />
                  )
                )}
                {isLoadingFeaturedDaos && (
                  <Spinner size="xl" variant="primary" />
                )}
              </>
            ) : (
              <>
                {filteredDaoList?.map(
                  (dao: IDao, index: React.Key | null | undefined) => (
                    <DaoCard key={index} dao={dao} />
                  )
                )}
                {isLoading && <Spinner size="xl" variant="primary" />}
              </>
            )}
          </CardsWrapper>
        )}
      </MainContainer>
      {totalDaos != null &&
        totalDaos > 0 &&
        totalDaosShown > 0 &&
        filters.quickFilter !== 'featuredDaos' && (
          <div className="flex items-center lg:gap-x-6">
            {hasNextPage && (
              <Button
                className="self-start"
                isLoading={isFetchingNextPage}
                iconRight={
                  !isFetchingNextPage ? IconType.CHEVRON_DOWN : undefined
                }
                variant="tertiary"
                size="md"
                onClick={() => fetchNextPage()}
              >
                {t('explore.explorer.showMore')}
              </Button>
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
        daoListLoading={isLoading}
        totalCount={totalDaos}
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

const CardsWrapper = styled.div.attrs({
  className: 'grid grid-cols-1 gap-3 md:grid-cols-2',
})``;
