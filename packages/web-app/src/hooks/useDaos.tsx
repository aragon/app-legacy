import {useReactiveVar} from '@apollo/client';
import {DaoListItem, DaoSortBy, SortDirection} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';
import {resolveIpfsCid} from '@aragon/sdk-common';

import {ExploreFilter} from 'containers/daoExplorer';
import {favoriteDaosVar} from 'context/apolloClient';
import {HookData} from 'utils/types';
import {useClient} from './useClient';
import {SupportedChainID} from 'utils/constants';

// TODO: At some point, DaoListItem is supposed to get the chainId
// please revert to DaoListItem instead of this when that happens
type AugmentedDaoListItem = DaoListItem & {
  chain?: SupportedChainID;
};

/**
 * This hook returns a list of daos. The data returned for each dao contains
 * information about the dao such as metadata, plugins installed on the dao,
 * address, etc.
 *
 * The hook takes a single argument that determines the criteria for which DAOs
 * will be returned. This can be either popular or newest DAOs, or DAOs that a
 * user has favourited.
 *
 * @param useCase filter criteria that should be applied when fetching daos
 * @param count number of DAOs to fetch at once.
 * @returns A list of Daos and their respective infos (metadata, plugins, etc.)
 */
export function useDaos(
  useCase: ExploreFilter,
  count: number
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

        if (useCase === 'favourite') {
          setData(favoriteDaoCache as AugmentedDaoListItem[]);
        } else {
          const sortParam =
            useCase === 'popular' ? DaoSortBy.POPULARITY : DaoSortBy.CREATED_AT;

          const daoDetails =
            (await client?.methods.getDaos({
              sortBy: sortParam,
              direction: SortDirection.DESC,
              limit: count,
            })) || [];

          daoDetails.map(dao => {
            if (dao.metadata.avatar) {
              try {
                const logoCid = resolveIpfsCid(dao.metadata.avatar);
                dao.metadata.avatar = `https://ipfs.io/ipfs/${logoCid}`;
              } catch (err) {
                dao.metadata.avatar = undefined;
              }
            }
          });
          setData(daoDetails);
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
  }, [client?.methods, useCase, count]);

  return {data, isLoading, error};
}
