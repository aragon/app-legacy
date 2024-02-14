import React, {useMemo, useReducer, useState} from 'react';
import {Dropdown} from '@aragon/ods-old';
import {Spinner, Button, Icon, IconType} from '@aragon/ods';
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
import {StateEmpty} from 'components/stateEmpty';

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
  const {isConnected, address} = useWallet();

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
      direction: OrderDirection.DESC,
      orderBy: filters.order,
      ...(filters.pluginNames?.length !== 0 && {
        pluginNames: filters.pluginNames,
      }),
      ...(filters.networks?.length !== 0 && {
        networks: filters.networks?.map(network => {
          // TODO: Remove this Goerli based network conditions
          if (network === 'arbitrum-goerli') {
            return 'arbitrumGoerli';
          } else if (network === 'base-goerli') {
            return 'baseGoerli';
          }
          return network;
        }),
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

    if (filters.quickFilter !== DEFAULT_FILTERS.quickFilter) count++;

    // plugin Name filter
    if (filters.pluginNames?.length !== 0) count++;

    // network filter
    if (filters.networks?.length !== 0) count++;

    return count !== 0 ? count.toString() : '';
  }, [filters]);

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

  const totalDaos =
    (useFollowList
      ? followedDaosResult.data?.pages[0].total
      : newDaosResult.data?.pages[0].total) ?? 0;

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

  const handleClearFilters = () => {
    dispatch({type: FilterActionTypes.RESET, payload: DEFAULT_FILTERS});
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <Container>
      <MainContainer>
        <Title>{t('explore.explorer.title')}</Title>
        <FilterGroupContainer>
          <ToggleGroup
            isMultiSelect={false}
            value={filters.quickFilter}
            onChange={toggleQuickFilters}
          >
            {quickFilters.map(f => {
              return (
                <Toggle
                  key={f.value}
                  label={t(f.label)}
                  value={f.value}
                  disabled={
                    (f.value === 'memberOf' || f.value === 'following') &&
                    !isConnected
                  }
                />
              );
            })}
          </ToggleGroup>
          <ButtonGroupContainer>
            <Button
              variant={filtersCount !== '' ? 'secondary' : 'tertiary'}
              size="md"
              responsiveSize={{lg: 'lg'}}
              iconLeft={IconType.FILTER}
              onClick={() => setShowAdvancedFilters(true)}
            >
              {filtersCount}
            </Button>
            {filters.quickFilter !== 'following' && (
              <Dropdown
                side="bottom"
                align="end"
                sideOffset={4}
                trigger={
                  <Button
                    variant={activeDropdown ? 'secondary' : 'tertiary'}
                    size="md"
                    responsiveSize={{lg: 'lg'}}
                    iconLeft={IconType.SORT}
                  />
                }
                onOpenChange={e => {
                  setActiveDropdown(e);
                }}
                listItems={[
                  {
                    component: (
                      <CredentialsDropdownItem
                        isActive={filters.order === 'tvl'}
                      >
                        {t('explore.sortBy.largestTreasury')}
                        {filters.order === 'tvl' && (
                          <Icon icon={IconType.CHECKMARK} />
                        )}
                      </CredentialsDropdownItem>
                    ),
                    callback: () => toggleOrderby('tvl'),
                  },
                  {
                    component: (
                      <CredentialsDropdownItem
                        isActive={filters.order === 'proposals'}
                      >
                        {t('explore.sortBy.mostProposals')}
                        {filters.order === 'proposals' && (
                          <Icon icon={IconType.CHECKMARK} />
                        )}
                      </CredentialsDropdownItem>
                    ),
                    callback: () => toggleOrderby('proposals'),
                  },
                  {
                    component: (
                      <CredentialsDropdownItem
                        isActive={filters.order === 'members'}
                      >
                        {t('explore.sortBy.largestCommunity')}
                        {filters.order === 'members' && (
                          <Icon icon={IconType.CHECKMARK} />
                        )}
                      </CredentialsDropdownItem>
                    ),
                    callback: () => toggleOrderby('members'),
                  },
                  {
                    component: (
                      <CredentialsDropdownItem
                        isActive={filters.order === 'createdAt'}
                      >
                        {t('explore.sortBy.recentlyCreated')}
                        {filters.order === 'createdAt' && (
                          <Icon icon={IconType.CHECKMARK} />
                        )}
                      </CredentialsDropdownItem>
                    ),
                    callback: () => toggleOrderby('createdAt'),
                  },
                ]}
              />
            )}
          </ButtonGroupContainer>
        </FilterGroupContainer>
        {noDaosFound ? (
          <StateEmpty
            type="Object"
            mode="card"
            object="magnifying_glass"
            title={t('explore.emptyStateSearch.title')}
            description={t('explore.emptyStateSearch.description')}
            contentWrapperClassName="lg:w-[560px]"
            secondaryButton={{
              label: t('explore.emptyStateSearch.ctaLabel'),
              iconLeft: IconType.RELOAD,
              onClick: handleClearFilters,
              className: 'w-full',
            }}
          />
        ) : (
          <CardsWrapper>
            {filteredDaoList?.map((dao, index) => (
              <DaoCard key={index} dao={dao} />
            ))}
            {isLoading && <Spinner size="xl" variant="primary" />}
          </CardsWrapper>
        )}
      </MainContainer>
      {totalDaos > 0 && totalDaosShown > 0 && (
        <div className="flex items-center lg:gap-x-6">
          {hasNextPage && (
            <Button
              className="self-start"
              state={isFetchingNextPage ? 'loading' : undefined}
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

type CredentialsDropdownItemPropType = {
  isActive: boolean;
};

const MainContainer = styled.div.attrs({
  className: 'flex flex-col space-y-4 xl:space-y-6',
})``;
const Container = styled.div.attrs({
  className: 'flex flex-col space-y-3',
})``;

const CardsWrapper = styled.div.attrs({
  className: 'grid grid-cols-1 gap-3 xl:grid-cols-2 xl:gap-6',
})``;

const Title = styled.p.attrs({
  className: 'font-semibold ft-text-xl text-neutral-800',
})``;

const FilterGroupContainer = styled.div.attrs({
  className: 'flex justify-between space-x-3',
})``;

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex space-x-3 items-start',
})``;

const CredentialsDropdownItem = styled.div.attrs<CredentialsDropdownItemPropType>(
  ({isActive}) => ({
    className: `flex text-neutral-600 items-center justify-between gap-3 py-3 font-semibold ft-text-base hover:bg-primary-50 px-4 rounded-xl hover:text-primary-400 ${
      isActive ? 'text-primary-400 bg-primary-50 cursor-auto' : 'cursor-pointer'
    }`,
  })
)``;
