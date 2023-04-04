import {DaoSortBy} from '@aragon/sdk-client';
import {
  ButtonGroup,
  ButtonText,
  IconChevronDown,
  Option,
  Spinner,
} from '@aragon/ui-components';
import {UseInfiniteQueryResult} from '@tanstack/react-query';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {DaoCard} from 'components/daoCard';
import {useFavoritedDaosInfiniteQuery} from 'hooks/useFavoritedDaos';
import {
  AugmentedDaoListItem,
  ExploreFilter,
  EXPLORE_FILTER,
  useDaosInfiniteQuery,
} from 'hooks/useDaos';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {getSupportedNetworkByChainId, SupportedChainID} from 'utils/constants';
import {toDisplayEns} from 'utils/library';
import {Dashboard} from 'utils/paths';

export function isExploreFilter(
  filterValue: string
): filterValue is ExploreFilter {
  return EXPLORE_FILTER.some(ef => ef === filterValue);
}

export const DaoExplorer = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {isConnected} = useWallet();

  const [filterValue, setFilterValue] = useState<ExploreFilter>('favorite');

  // conditional api queries
  const fetchFavorited = filterValue === 'favorite';
  const favoritedApi = useFavoritedDaosInfiniteQuery(fetchFavorited);
  const daosApi = useDaosInfiniteQuery(fetchFavorited === false, {
    sortBy: toDaoSortBy(filterValue),
  });

  // resulting api response
  const exploreDaosApi = useMemo(
    () =>
      (fetchFavorited ? favoritedApi : daosApi) as UseInfiniteQueryResult<
        AugmentedDaoListItem,
        unknown
      >,
    [daosApi, favoritedApi, fetchFavorited]
  );

  // whether the connected wallet has favorited DAOS
  const loggedInAndHasFavoritedDaos =
    isConnected && (favoritedApi.data?.pages || []).length > 0;

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleFilterChange = (filterValue: string) => {
    if (isExploreFilter(filterValue)) {
      setFilterValue(filterValue);
    } else throw Error(`${filterValue} is not an acceptable filter value`);
  };

  const handleDaoClicked = (dao: string, chain: SupportedChainID) => {
    navigate(
      generatePath(Dashboard, {
        network: getSupportedNetworkByChainId(chain),
        dao,
      })
    );
  };

  /*************************************************
   *                      Effects                  *
   *************************************************/
  useEffect(() => {
    if (
      favoritedApi.status === 'success' &&
      loggedInAndHasFavoritedDaos === false
    ) {
      setFilterValue('newest');
    }
  }, [favoritedApi.status, loggedInAndHasFavoritedDaos]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <Container>
      <MainContainer>
        <HeaderWrapper>
          <Title>{t('explore.explorer.title')}</Title>
          {loggedInAndHasFavoritedDaos && (
            <ButtonGroupContainer>
              <ButtonGroup
                defaultValue={filterValue}
                onChange={handleFilterChange}
                bgWhite={false}
              >
                <Option label={t('explore.explorer.myDaos')} value="favorite" />

                {/* <Option label={t('explore.explorer.popular')} value="popular" /> */}
                <Option label={t('explore.explorer.newest')} value="newest" />
              </ButtonGroup>
            </ButtonGroupContainer>
          )}
        </HeaderWrapper>
        <CardsWrapper>
          {exploreDaosApi.isLoading ? (
            <Spinner size="default" />
          ) : (
            exploreDaosApi.data?.pages?.map(dao => (
              <DaoCard
                key={dao.address}
                name={dao.metadata.name}
                ensName={toDisplayEns(dao.ensDomain)}
                logo={dao.metadata.avatar}
                description={dao.metadata.description}
                chainId={dao.chain}
                onClick={() =>
                  handleDaoClicked(
                    toDisplayEns(dao.ensDomain) || dao.address,
                    dao.chain
                  )
                }
                daoType={
                  (dao?.plugins?.[0]?.id as PluginTypes) ===
                  'token-voting.plugin.dao.eth'
                    ? 'token-based'
                    : 'wallet-based'
                }
              />
            ))
          )}
        </CardsWrapper>
      </MainContainer>
      {exploreDaosApi.hasNextPage && (
        <div>
          <ButtonText
            label={t('explore.explorer.showMore')}
            iconRight={
              exploreDaosApi.isFetching && exploreDaosApi.isFetchingNextPage ? (
                <Spinner size="xs" />
              ) : (
                <IconChevronDown />
              )
            }
            bgWhite
            mode="ghost"
            onClick={() => exploreDaosApi.fetchNextPage()}
          />
        </div>
      )}
    </Container>
  );
};

/**
 * Map explore filter to SDK DAO sort by
 * @param filter selected DAO category
 * @returns the equivalent of the SDK enum
 */
function toDaoSortBy(filter: ExploreFilter) {
  switch (filter) {
    case 'popular':
      return DaoSortBy.POPULARITY;
    case 'newest':
      return DaoSortBy.CREATED_AT;
    default:
      return DaoSortBy.CREATED_AT;
  }
}

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex',
})``;

const MainContainer = styled.div.attrs({
  className: 'flex flex-col space-y-2 desktop:space-y-3',
})``;
const Container = styled.div.attrs({
  className: 'flex flex-col space-y-1.5',
})``;
const HeaderWrapper = styled.div.attrs({
  className:
    'flex flex-col space-y-2 desktop:flex-row desktop:space-y-0 desktop:justify-between',
})``;
const CardsWrapper = styled.div.attrs({
  className: 'grid grid-cols-1 gap-1.5 desktop:grid-cols-2 desktop:gap-3',
})``;
const Title = styled.p.attrs({
  className: 'font-bold ft-text-xl text-ui-800',
})``;
