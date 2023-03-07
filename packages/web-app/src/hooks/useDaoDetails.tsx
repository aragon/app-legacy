import {useReactiveVar} from '@apollo/client';
import {DaoDetails} from '@aragon/sdk-client';
import {resolveIpfsCid} from '@aragon/sdk-common';
import {useEffect, useState} from 'react';

import {favoriteDaosVar, pendingDaoCreationVar} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {usePrivacyContext} from 'context/privacyContext';
import {CHAIN_METADATA, FAVORITE_DAOS_KEY} from 'utils/constants';
import {customJSONReplacer, mapDetailedDaoToFavoritedDao} from 'utils/library';
import {HookData} from 'utils/types';
import {useClient} from './useClient';
import {ExpiringPromiseCache} from 'utils/expiringPromiseCache';

const daoDetailsCache = new ExpiringPromiseCache<DaoDetails | null>(10000);

/**
 * Get dao metadata
 * Note: Please rename to useDaoMetadata once the other hook as been deprecated
 * @param daoId dao ens name or address
 * @returns dao metadata for given address
 */
export function useDaoDetails(
  daoId: string
): HookData<DaoDetails | undefined | null> & {waitingForSubgraph: boolean} {
  const {client} = useClient();

  const [data, setData] = useState<DaoDetails | null>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForSubgraph, setWaitingForSubgraph] = useState(false);
  const {network} = useNetwork();
  const cachedDaos = useReactiveVar(pendingDaoCreationVar);
  const favoritedDaos = useReactiveVar(favoriteDaosVar);
  const {preferences} = usePrivacyContext();

  useEffect(() => {
    async function getDaoMetadata() {
      try {
        setIsLoading(true);

        if (cachedDaos?.[network]?.[daoId.toLowerCase()]) {
          const pendingDAO = cachedDaos?.[network]?.[daoId.toLowerCase()];
          if (pendingDAO) {
            setData({
              address: daoId,
              ensDomain: pendingDAO.daoCreationParams.ensSubdomain,
              metadata: pendingDAO.daoMetadata,
              plugins: [],
              creationDate: new Date(),
            });
          }
          setWaitingForSubgraph(true);
        } else {
          const daoKey = daoId.toLowerCase();
          // if there's no cached promise to fetch this dao,
          // create one and add it to the cache
          const dao = await (daoDetailsCache.get(daoKey) ||
            daoDetailsCache.add(daoKey, client?.methods.getDao(daoKey)));

          if (dao) {
            if (dao.metadata.avatar) {
              try {
                const logoCid = resolveIpfsCid(dao.metadata.avatar);
                dao.metadata.avatar = `https://ipfs.eth.aragon.network/ipfs/${logoCid}`;
              } catch (err) {
                dao.metadata.avatar = undefined;
              }
            }
            setData(dao);
            setWaitingForSubgraph(false);

            // check if current DAO is in the favorites cache
            const indexOfCurrentDaoInFavorites = favoritedDaos.findIndex(
              d =>
                d.address === dao.address &&
                d.chain === CHAIN_METADATA[network].id
            );

            // map currently fetched DAO to cached DAO type
            const currentDaoAsFavoritedDao = mapDetailedDaoToFavoritedDao(
              dao,
              network
            );

            if (
              // currently fetched dao is favorited
              indexOfCurrentDaoInFavorites !== -1 &&
              // the DAO data is different (post update metadata proposal execution)
              JSON.stringify(favoritedDaos[indexOfCurrentDaoInFavorites]) !==
                JSON.stringify(currentDaoAsFavoritedDao)
            ) {
              // update reactive cache with new DAO data
              const newFavoriteCache = [...favoritedDaos];
              newFavoriteCache[indexOfCurrentDaoInFavorites] = {
                ...currentDaoAsFavoritedDao,
              };

              favoriteDaosVar(newFavoriteCache);

              // update local storage
              if (preferences?.functional) {
                localStorage.setItem(
                  FAVORITE_DAOS_KEY,
                  JSON.stringify(newFavoriteCache, customJSONReplacer)
                );
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (daoId) getDaoMetadata();

    // intentionally keeping favoritedDaos out because this effect need not be
    // rerun even if that variable changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cachedDaos, client?.methods, daoId, network, preferences?.functional]);

  return {data, error, isLoading, waitingForSubgraph};
}
