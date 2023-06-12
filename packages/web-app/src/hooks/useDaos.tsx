import {
  Client,
  DaoListItem,
  DaoSortBy,
  IDaoQueryParams,
  SortDirection,
} from '@aragon/sdk-client';
import {InfiniteData, useInfiniteQuery} from '@tanstack/react-query';

import {
  CHAIN_METADATA,
  SupportedChainID,
  getSupportedNetworkByChainId,
} from 'utils/constants';
import {resolveDaoAvatarIpfsCid} from 'utils/library';
import {useClient} from './useClient';

export const EXPLORE_FILTER = ['favorite', 'newest', 'popular'] as const;
export type ExploreFilter = typeof EXPLORE_FILTER[number];

export type AugmentedDaoListItem = DaoListItem & {
  chain: SupportedChainID;
};

const DEFAULT_QUERY_PARAMS = {
  sortBy: DaoSortBy.CREATED_AT,
  direction: SortDirection.DESC,
  skip: 0,
  limit: 4,
};

/**
 * Fetch a list of DAOs
 * @param client SDK common client. Can be undefined if the client is not available.
 * @param options query parameters for fetching the DAOs
 * @returns list of DAOs based on given params
 */
async function fetchDaos(client: Client | undefined, options: IDaoQueryParams) {
  return client
    ? client.methods.getDaos(options)
    : Promise.reject(new Error('Client not defined'));
}

/**
 * This hook returns a list of daos. The data returned for each dao contains
 * information about the dao such as metadata, plugins installed on the dao,
 * address, etc.
 *
 * The DAO criteria can be either popular or newest DAOs, or DAOs that a user has favorited.
 * @param filter criteria that should be applied when fetching dao
 * @param options.limit The maximum number of DAOs to return. Fetches 4 DAOs by default.
 * @param options.direction sort direction
 * @returns A list of daos and their respective infos (metadata, plugins, etc.)
 */
export const useDaosInfiniteQuery = (
  enabled = true,
  {
    sortBy = DEFAULT_QUERY_PARAMS.sortBy,
    direction = DEFAULT_QUERY_PARAMS.direction,
    limit = DEFAULT_QUERY_PARAMS.limit,
  }: Partial<Pick<IDaoQueryParams, 'direction' | 'limit' | 'sortBy'>> = {}
) => {
  const {client, network: clientNetwork} = useClient();

  return useInfiniteQuery({
    // notice the use of `clientNetwork` instead of `network` from network context
    // To avoid a case of network mismatch, always go with the client network.
    // When it has caught up to final value of url/context network, that final query
    // will become the last & latest "fresh" one
    queryKey: ['infiniteDaos', sortBy, clientNetwork],

    queryFn: ({pageParam = 0}) => {
      const skip = limit * pageParam;
      return fetchDaos(client, {skip, limit, direction, sortBy});
    },

    // calculate next page value
    getNextPageParam: (lastPage: DaoListItem[], allPages: DaoListItem[][]) =>
      lastPage.length === limit ? allPages.length : undefined,

    // transform and select final value
    select: (data: InfiniteData<DaoListItem[]>) =>
      // `clientNetwork` will always have a value because `network`
      // is set to ethereum by default
      toAugmentedDaoListItem(data, CHAIN_METADATA[clientNetwork!].id),

    enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * Function that augments an array of `DaoListItem` by adding
 * the avatar IPFS CID and the chainID
 * @param data array of `DaoListItem`
 * @param chain chain id
 * @returns augmented DAO with avatar link and proper chain
 */
// TODO: ideally chain id comes from the SDK; remove when available
function toAugmentedDaoListItem(
  data: InfiniteData<DaoListItem[]>,
  chain: SupportedChainID
) {
  return {
    pageParams: data.pageParams,
    pages: data.pages.flatMap(page =>
      page.map(dao => {
        const chainId = (dao as AugmentedDaoListItem).chain || chain;
        return {
          ...dao,
          metadata: {
            ...dao.metadata,
            avatar: resolveDaoAvatarIpfsCid(
              getSupportedNetworkByChainId(chainId) || 'unsupported',
              dao.metadata.avatar
            ),
          },
          chain: chainId,
        } as AugmentedDaoListItem;
      })
    ),
  };
}
