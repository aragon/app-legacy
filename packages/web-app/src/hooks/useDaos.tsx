import {useReactiveVar} from '@apollo/client';
import {DaoListItem, DaoSortBy, SortDirection} from '@aragon/sdk-client';
import {resolveIpfsCid} from '@aragon/sdk-common';
import {useEffect, useState} from 'react';

import {ExploreFilter} from 'containers/daoExplorer';
import {favoriteDaosVar} from 'context/apolloClient';
import {SupportedChainID} from 'utils/constants';
import {HookData} from 'utils/types';
import {useClient} from './useClient';

// TODO: At some point, DaoListItem is supposed to get the chainId
// please revert to DaoListItem instead of this when that happens
export type AugmentedDaoListItem = DaoListItem & {
  chain?: SupportedChainID;
};

/**
 * This hook returns a list of daos. The data returned for each dao contains
 * information about the dao such as metadata, plugins installed on the dao,
 * address, etc.
 *
 * The hook takes a few arguments that determine the number of DAOs and the criteria
 * for which DAOs will be returned. Additionally, a sort direction as well as a parameter
 * indicating how many DAOs to skip are accepted in order to provide full query flexibility.
 * The DAO criteria can be either popular or newest DAOs, or DAOs that a user has favorited.
 *
 * @param useCase filter criteria that should be applied when fetching daos
 * @param limit number of DAOs to fetch at once.
 * @param skip number of DAOs to skip when fetching.
 * @param direction sort direction Ascending or Descending
 * @returns A list of Daos and their respective infos (metadata, plugins, etc.)
 */
export function useDaos(
  useCase: ExploreFilter,
  limit = 10,
  skip = 0,
  direction: SortDirection = SortDirection.DESC
): HookData<AugmentedDaoListItem[]> {
  const favoriteDaoCache = useReactiveVar(favoriteDaosVar);
  const [data, setData] = useState<AugmentedDaoListItem[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(true);

  const {client} = useClient();

  useEffect(() => {
    async function fetchDaos() {
      try {
        setIsLoading(true);

        if (useCase === 'favorite') {
          // return favorited daos from cache
          setData(
            favoriteDaoCache.slice(skip, skip + limit) as AugmentedDaoListItem[]
          );
        } else {
          const sortBy =
            useCase === 'popular' ? DaoSortBy.POPULARITY : DaoSortBy.CREATED_AT;

          const daos =
            (await client?.methods.getDaos({
              sortBy,
              direction,
              skip,
              limit,
            })) || [];

          daos.forEach(dao => {
            if (dao.metadata.avatar) {
              try {
                const logoCid = resolveIpfsCid(dao.metadata.avatar);
                dao.metadata.avatar = `https://ipfs.io/ipfs/${logoCid}`;
              } catch (err) {
                dao.metadata.avatar = undefined;
              }
            }
            if (dao.plugins.length < 1) {
              console.log(
                `WARNING: DAO with zero plugins ignored ens: ${dao.ensDomain} address: ${dao.address}`
              );
            }
          });
          setData(daos);
        }
      } catch (error) {
        console.error(error);
        setError(error as Error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDaos();

    // intentionally leaving out favoriteDaoCache so that this doesn't
    // get re-run when items are removed from the cache
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.methods, direction, limit, skip, useCase]);

  return {data, isLoading, error};
}
