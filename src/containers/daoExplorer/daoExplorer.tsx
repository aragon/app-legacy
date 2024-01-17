import {
  ButtonGroup,
  ButtonText,
  IconChevronDown,
  Spinner,
  Option,
} from '@aragon/ods-old';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {DaoCard} from 'components/daoCard';
import {useDaos} from 'services/aragon-backend/queries/use-daos';
import {OrderDirection} from 'services/aragon-backend/domain/ordered-request';
import {useFollowedDaosInfiniteQuery} from 'hooks/useFollowedDaos';
import {getSupportedNetworkByChainId} from 'utils/constants';
import {Address} from 'viem';
import {useWallet} from 'hooks/useWallet';
import {NavigationDao} from 'context/apolloClient';
import {IDao} from 'services/aragon-backend/domain/dao';

type DaoFilter = 'favorite' | 'all';

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

  const [filter, setFilter] = useState<DaoFilter>('favorite');

  const followedDaosResult = useFollowedDaosInfiniteQuery();

  const newDaosResult = useDaos({
    direction: OrderDirection.DESC,
    orderBy: 'CREATED_AT' as const,
  });

  const newDaoList = newDaosResult.data?.pages.flatMap(page => page.data);

  const followedDaoList = useMemo(
    () => followedDaosResult.data?.pages.flatMap(followedDaoToDao) ?? [],
    [followedDaosResult.data]
  );

  const useFollowList = filter === 'favorite' && isConnected;
  const filteredDaoList = useFollowList ? followedDaoList : newDaoList;

  const {isLoading, hasNextPage, isFetchingNextPage, fetchNextPage} =
    useFollowList ? followedDaosResult : newDaosResult;

  const displayFilters = isConnected && followedDaoList.length > 0;

  useEffect(() => {
    if (
      followedDaosResult.status === 'success' &&
      followedDaoList.length === 0
    ) {
      setFilter('all');
    }
  }, [followedDaosResult.status, followedDaoList]);

  return (
    <Container>
      <MainContainer>
        <HeaderWrapper>
          <Title>{t('explore.explorer.title')}</Title>
          {displayFilters && (
            <ButtonGroupContainer>
              <ButtonGroup
                defaultValue={filter}
                onChange={(value: string) => setFilter(value as DaoFilter)}
                bgWhite={false}
              >
                <Option label={t('explore.explorer.myDaos')} value="favorite" />
                <Option label={t('explore.explorer.newest')} value="all" />
              </ButtonGroup>
            </ButtonGroupContainer>
          )}
        </HeaderWrapper>
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
    </Container>
  );
};

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex',
})``;

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
