import {useReactiveVar} from '@apollo/client';
import {DaoDetails} from '@aragon/sdk-client';
import {resolveIpfsCid} from '@aragon/sdk-common';
import {useEffect, useState} from 'react';

import {favoriteDaosVar, pendingDaoCreationVar} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {usePrivacyContext} from 'context/privacyContext';
import {
  AVATAR_IPFS_URL,
  CHAIN_METADATA,
  FAVORITE_DAOS_KEY,
} from 'utils/constants';
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
  const {client, context, network: clientNetwork} = useClient();

  const [data, setData] = useState<DaoDetails | null>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForSubgraph, setWaitingForSubgraph] = useState(false);
  const {network} = useNetwork();
  const cachedDaos = useReactiveVar(pendingDaoCreationVar);
  const favoritedDaos = useReactiveVar(favoriteDaosVar);
  const {preferences} = usePrivacyContext();

  useEffect(() => {
    // get the proper link to DAO avatar
    function getDaoWithResolvedAvatar(daoKey: string) {
      return client?.methods.getDao(daoKey).then(dao => {
        if (dao?.metadata?.avatar) {
          try {
            const logoCid = resolveIpfsCid(dao.metadata.avatar);
            dao.metadata.avatar = `${AVATAR_IPFS_URL}/${logoCid}`;
          } catch (err) {
            dao.metadata.avatar = undefined;
          }
        }

        return dao;
      });
    }

    async function getDaoMetadata() {
      try {
        // bail if client out of sync
        if (clientNetwork !== network) {
          console.log(
            `client out of sync client: ${context?.network} network: ${network}`
          );
          return;
        }

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
          const cacheKey = `${daoKey}_${network}`;
          // if there's no cached promise to fetch this dao,
          // create one and add it to the cache
          const dao = await (daoDetailsCache.get(cacheKey) ||
            daoDetailsCache.add(cacheKey, getDaoWithResolvedAvatar(daoKey)));

          if (dao) {
            setData(dao);

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
          } else {
            // no DAO with given address found on network
            setData(null);
          }

          // unless there is a pending DAO we are no longer waiting for subgraph
          setWaitingForSubgraph(false);
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
