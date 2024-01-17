import {
  ButtonIcon,
  ButtonText,
  Dropdown,
  IconCheckmark,
  IconChevronDown,
  IconFilter,
  IconSort,
  ListItemAction,
  // SearchInput,
  Spinner,
} from '@aragon/ods-old';
import React, {useReducer, useState} from 'react';
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
  SortByValue,
  quickFilters,
} from '../daoFilterModal/data';
import {Toggle, ToggleGroup} from '@aragon/ods';

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
  const {isConnected} = useWallet();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, dispatch] = useReducer(daoFiltersReducer, DEFAULT_FILTERS);

  const showFollowedDaos = filters.quickFilter === 'following' && isConnected;

  const {data: followedDaos, isLoading: followedDaosLoading} =
    useFollowedDaosInfiniteQuery(
      {
        pluginNames: filters.pluginNames,
        networks: filters.networks,
      },
      {enabled: showFollowedDaos}
    );

  const {
    data: newDaos,
    isLoading: daoListLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useDaos(
    {
      direction: OrderDirection.DESC,
      orderBy: filters.order,
      ...(filters.pluginNames?.length !== 0 && {
        pluginNames: filters.pluginNames,
      }),
      ...(filters.networks?.length !== 0 && {
        networks: filters.networks,
      }),
      // ...(filters.quickFilter === 'memberOf' && address
      //   ? {memberAddress: address.toLowerCase()}
      //   : {}),
    },
    {enabled: showFollowedDaos === false}
  );

  // Intermediate values
  const daoList = newDaos?.pages.flatMap(page => page.data);

  const followedDaoList = followedDaos?.pages.flatMap(page =>
    page.data.map(followedDaoToDao)
  );

  const filteredDaoList = showFollowedDaos ? followedDaoList : daoList;
  const isLoading = showFollowedDaos ? followedDaosLoading : daoListLoading;
  const totalCount =
    filters.quickFilter === 'following'
      ? followedDaos?.pages[0].total
      : newDaos?.pages[0].total;

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
        payload: value as SortByValue,
      });
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
            {/* <SearchInput
              placeholder={t('explore.inputPlaceholder.searchDAOs')}
              value={searchTerm}
              onChange={handleQueryChange}
            /> */}
            <ButtonIcon
              mode="secondary"
              size="large"
              icon={<IconFilter />}
              onClick={() => {
                setShowAdvancedFilters(true);
              }}
            />
            <Dropdown
              side="bottom"
              align="end"
              sideOffset={4}
              trigger={
                <ButtonIcon mode="secondary" size="large" icon={<IconSort />} />
              }
              listItems={[
                {
                  component: (
                    <ListItemAction
                      title={t('explore.sortBy.largestTreasury')}
                      bgWhite
                      {...(filters.order === 'tvl' && {
                        iconRight: <IconCheckmark />,
                        mode: 'selected',
                      })}
                    />
                  ),
                  callback: () => toggleOrderby('tvl'),
                },
                {
                  component: (
                    <ListItemAction
                      title={t('explore.sortBy.mostProposals')}
                      bgWhite
                      {...(filters.order === 'proposals' && {
                        iconRight: <IconCheckmark />,
                        mode: 'selected',
                      })}
                    />
                  ),
                  callback: () => toggleOrderby('proposals'),
                },
                {
                  component: (
                    <ListItemAction
                      title={t('explore.sortBy.largestCommunity')}
                      bgWhite
                      {...(filters.order === 'members' && {
                        iconRight: <IconCheckmark />,
                        mode: 'selected',
                      })}
                    />
                  ),
                  callback: () => toggleOrderby('members'),
                },
                {
                  component: (
                    <ListItemAction
                      title={t('explore.sortBy.recentlyCreated')}
                      bgWhite
                      {...(filters.order === 'createdAt' && {
                        iconRight: <IconCheckmark />,
                        mode: 'selected',
                      })}
                    />
                  ),
                  callback: () => toggleOrderby('createdAt'),
                },
              ]}
            />
          </ButtonGroupContainer>
        </FilterGroupContainer>
        <CardsWrapper>
          {filteredDaoList?.map(dao => <DaoCard key={dao.address} dao={dao} />)}
          {isLoading && <Spinner size="default" />}
        </CardsWrapper>
      </MainContainer>
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
      <DaoFilterModal
        isOpen={showAdvancedFilters}
        filters={filters}
        daoListLoading={isLoading}
        totalCount={totalCount}
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
  className: 'grid grid-cols-1 gap-3 xl:grid-cols-2 xl:gap-6',
})``;

const Title = styled.p.attrs({
  className: 'font-semibold ft-text-xl text-neutral-800',
})``;

const FilterGroupContainer = styled.div.attrs({
  className: 'flex justify-between space-x-3',
})``;

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex space-x-3',
})``;
