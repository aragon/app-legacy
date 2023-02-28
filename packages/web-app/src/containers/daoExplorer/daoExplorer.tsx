import {
  ButtonGroup,
  ButtonText,
  IconChevronDown,
  Option,
  Spinner,
} from '@aragon/ui-components';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {DaoCard} from 'components/daoCard';
import {useDaos} from 'hooks/useDaos';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA, getSupportedNetworkByChainId} from 'utils/constants';
import {Dashboard} from 'utils/paths';
import {useReactiveVar} from '@apollo/client';
import {favoriteDaosVar} from 'context/apolloClient';
import {useNetwork} from 'context/network';

const EXPLORE_FILTER = ['favorite', 'newest', 'popular'] as const;

export type ExploreFilter = typeof EXPLORE_FILTER[number];

export function isExploreFilter(
  filterValue: string
): filterValue is ExploreFilter {
  return EXPLORE_FILTER.some(ef => ef === filterValue);
}

const PAGE_SIZE = 4;

export const DaoExplorer = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {address} = useWallet();
  const {network} = useNetwork();

  const favoritedDaos = useReactiveVar(favoriteDaosVar);
  const loggedInAndHasFavoritedDaos =
    address !== null && favoritedDaos.length > 0;

  const [filterValue, setFilterValue] = useState<ExploreFilter>(() =>
    loggedInAndHasFavoritedDaos ? 'favorite' : 'newest'
  );
  const filterRef = useRef(filterValue);

  const [skip, setSkip] = useState(0);
  const {data, isLoading} = useDaos(filterValue, PAGE_SIZE, skip);
  const [displayedDaos, setDisplayedDaos] = useState(data);

  useEffect(() => {
    if (data) {
      if (filterRef.current !== filterValue) {
        setDisplayedDaos(data);
        filterRef.current = filterValue;
      } else setDisplayedDaos(prev => [...prev, ...data]);
    }

    // NOTE: somewhere up the chain, changing login state is creating new instance
    // of the data from useDaos hook. Patching by doing proper data comparison
    // using JSON.stringify. Proper investigation needs to be done
    // [FF - 01/16/2023]

    // intentionally removing filterValue from the dependencies
    // because the update to the ref needs to happen after data
    // has changed only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data[0])]);

  const filterWasChanged = filterRef.current !== filterValue;

  const handleShowMoreClick = () => {
    if (!isLoading) setSkip(prev => prev + PAGE_SIZE);
  };

  const handleFilterChange = (filterValue: string) => {
    if (isExploreFilter(filterValue)) {
      setFilterValue(filterValue);
      setSkip(0);
    } else throw Error(`${filterValue} is not an acceptable filter value`);
    return;
  };

  return (
    <Container>
      <MainContainer>
        <HeaderWrapper>
          <Title>{t('explore.explorer.title')}</Title>
          {loggedInAndHasFavoritedDaos && (
            <ButtonGroupContainer>
              <ButtonGroup
                defaultValue={filterValue}
                onChange={v => handleFilterChange(v)}
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
          {filterWasChanged && isLoading ? (
            <Spinner size="default" />
          ) : (
            displayedDaos.map((dao, index) => (
              <DaoCard
                name={dao.metadata.name}
                logo={dao.metadata.avatar}
                description={dao.metadata.description}
                chainId={dao.chain || CHAIN_METADATA[network].id} // Default to Goerli
                daoType={
                  (dao?.plugins?.[0]?.id as PluginTypes) ===
                  'token-voting.plugin.dao.eth'
                    ? 'token-based'
                    : 'wallet-based'
                }
                key={index}
                onClick={() =>
                  navigate(
                    generatePath(Dashboard, {
                      network: getSupportedNetworkByChainId(
                        dao.chain || CHAIN_METADATA[network].id
                      ),
                      dao: dao.address,
                    })
                  )
                }
              />
            ))
          )}
        </CardsWrapper>
      </MainContainer>
      {data.length >= PAGE_SIZE && !filterWasChanged && (
        <div>
          <ButtonText
            label={t('explore.explorer.showMore')}
            iconRight={isLoading ? <Spinner size="xs" /> : <IconChevronDown />}
            bgWhite
            mode="ghost"
            onClick={handleShowMoreClick}
          />
        </div>
      )}
    </Container>
  );
};

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
