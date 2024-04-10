import {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {NavigationDao} from 'context/apolloClient';
import {useCallback} from 'react';
import {
  FollowedDaosResultWithTotal,
  addFollowedDaoToCache,
  getFollowedDaoFromCache,
  getFollowedDaosFromCache,
  removeFollowedDaoFromCache,
  updateFollowedDaoInCache,
} from 'services/cache';
import {
  CHAIN_METADATA,
  SupportedNetworks,
  getSupportedNetworkByChainId,
} from 'utils/constants';

const DEFAULT_QUERY_PARAMS = {
  skip: 0,
  limit: 20,
};

/**
 * This hook retrieves a list of cached DAOs with optional pagination.
 * @param skip The number of DAOs to skip before starting to fetch the result set.
 * (defaults to 0)
 * @param limit The maximum number of DAOs to return. Fetches all available DAOs by default.
 * @returns result object containing an array of NavigationDao objects with added avatar information.
 */
export const useFollowedDaosQuery = (
  skip = 0
): UseQueryResult<NavigationDao[]> => {
  return useQuery<NavigationDao[]>({
    queryKey: ['followedDaos'],
    queryFn: useCallback(() => getFollowedDaosFromCache({skip}), [skip]),
    refetchOnWindowFocus: false,
  });
};

type IFetchFollowedDaosParams = {
  pluginNames?: string[];
  networks?: SupportedNetworks[];
  limit?: number;
  skip?: number;
};

type IFetchInfiniteFollowedDaosResult = FollowedDaosResultWithTotal;

const useFollowedDaosInfiniteQueryKey = (
  params: IFetchFollowedDaosParams
): QueryKey => {
  return ['infiniteFollowedDaos', params];
};

export const useFollowedDaosInfiniteQuery = (
  params: IFetchFollowedDaosParams,
  options: Omit<
    UseInfiniteQueryOptions<IFetchInfiniteFollowedDaosResult>,
    'queryKey' | 'initialPageParam' | 'getNextPageParam' | 'select'
  >
) => {
  const {limit = DEFAULT_QUERY_PARAMS.limit, pluginNames, networks} = params;

  // Cast plugin repo names to plugin ids
  const pluginIds = pluginNames?.map((pluginName: string) => {
    switch (pluginName) {
      case 'token-voting-repo':
        return 'token-voting.plugin.dao.eth';
      case 'multisig-repo':
        return 'multisig.plugin.dao.eth';
      default:
        return 'multisig.plugin.dao.eth';
    }
  });

  return useInfiniteQuery({
    queryKey: useFollowedDaosInfiniteQueryKey(params),
    queryFn: async ({pageParam = 0}) => {
      const result = await getFollowedDaosFromCache({
        skip: pageParam as number,
        limit,
        includeTotal: true,
        pluginNames: pluginIds,
        networks,
      });

      return result;
    },
    getNextPageParam: (
      lastPage: IFetchInfiniteFollowedDaosResult,
      allPages: IFetchInfiniteFollowedDaosResult[]
    ) => {
      const totalFetched = allPages.reduce(
        (total, page) => total + page.data.length,
        0
      );
      return totalFetched < lastPage.data.length ? totalFetched : undefined;
    },
    select: augmentCachedDaos,
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * Fetch a followed DAO from the cache
 * @param daoAddress address of the followed DAO
 * @param network network of the followed DAO
 * @returns followed DAO with given address and network if available
 */
export const useFollowedDaoQuery = (
  daoAddress: string | undefined,
  network: SupportedNetworks
) => {
  const chain = CHAIN_METADATA[network].id;

  return useQuery({
    queryKey: ['followedDao', daoAddress, network],
    queryFn: () => getFollowedDaoFromCache(daoAddress, chain),
    enabled: !!daoAddress && !!network,
  });
};

/**
 * Update a followed DAO in in the cache
 */
export const useUpdateFollowedDaoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {dao: NavigationDao}) =>
      updateFollowedDaoInCache(variables.dao),

    onSuccess: (_, variables) => {
      const network = getSupportedNetworkByChainId(variables.dao.chain);

      queryClient.invalidateQueries({
        queryKey: ['followedDaos'],
      });
      queryClient.invalidateQueries({
        queryKey: ['infiniteFollowedDaos'],
      });
      queryClient.invalidateQueries({
        queryKey: ['followedDao', variables.dao.address, network],
      });
    },
  });
};

interface IFollowDaoMutationParams {
  onMutate?: () => void;
  onError?: () => void;
  onSuccess?: () => void;
}

/**
 * Add a followed DAO to the cache
 * @param onSuccess callback to run once DAO has been added to the cache
 */
export const useAddFollowedDaoMutation = (
  params?: IFollowDaoMutationParams
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {dao: NavigationDao}) =>
      addFollowedDaoToCache(variables.dao),

    onMutate: async (variables: {dao: NavigationDao}) => {
      // Snapshot the current value for rollback purposes
      const previousDaos = queryClient.getQueryData<NavigationDao[]>([
        'followedDaos',
      ]);

      // Optimistically update the cache
      queryClient.setQueryData<NavigationDao[]>(['followedDaos'], oldDaos => {
        if (oldDaos) {
          return [...oldDaos, variables.dao];
        }
        return [variables.dao];
      });

      // call the user-provided callback
      params?.onMutate?.();

      // Return the previousDaos to rollback in case of an error
      return {previousDaos};
    },

    onError: (_error, _variables, context) => {
      // Rollback to the previous state if the mutation fails
      queryClient.setQueryData(['followedDaos'], context?.previousDaos);
      params?.onError?.();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['followedDaos'],
      });
      queryClient.invalidateQueries({
        queryKey: ['infiniteFollowedDaos'],
      });
      params?.onSuccess?.();
    },
  });
};

/**
 * Remove a followed DAO from the cache
 * @param onSuccess callback to run once followed DAO has been removed successfully
 */
export const useRemoveFollowedDaoMutation = (
  params?: IFollowDaoMutationParams
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {dao: NavigationDao}) =>
      removeFollowedDaoFromCache(variables.dao),

    onMutate: async (variables: {dao: NavigationDao}) => {
      // Snapshot the current value for rollback purposes
      const previousDaos = queryClient.getQueryData<NavigationDao[]>([
        'followedDaos',
      ]);

      // Optimistically update the cache
      queryClient.setQueryData<NavigationDao[]>(['followedDaos'], oldDaos => {
        return oldDaos?.filter(dao => dao.address !== variables.dao.address);
      });

      params?.onMutate?.();

      // Return the previousDaos to rollback in case of an error
      return {previousDaos};
    },

    onError: (_error, _variables, context) => {
      // Rollback to the previous state if the mutation fails
      queryClient.setQueryData(['followedDaos'], context?.previousDaos);
      params?.onError?.();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['followedDaos'],
      });
      queryClient.invalidateQueries({
        queryKey: ['infiniteFollowedDaos'],
      });
      params?.onSuccess?.();
    },
  });
};

// /**
//  * Augment DAOs by resolving the IPFS CID for each DAO's avatar.
//  * @param data raw fetched data for the cached DAOs.
//  * @returns list of DAOs augmented with the resolved IPFS CID avatars
//  */
function augmentCachedDaos(
  data: InfiniteData<IFetchInfiniteFollowedDaosResult>
): InfiniteData<IFetchInfiniteFollowedDaosResult> {
  return {
    pageParams: data.pageParams,
    pages: data.pages.map(page => ({
      data: addAvatarToDaos(page.data),
      total: page.total,
    })),
  };
}

// /**
//  * Add resolved IPFS CID for each DAO's avatar to the metadata.
//  * @param daos array of `NavigationDao` objects representing the DAOs to be processed.
//  * @returns array of augmented NavigationDao objects with resolved avatar IPFS CIDs.
//  */
function addAvatarToDaos<T extends NavigationDao>(daos: T[]): T[] {
  return daos.map(dao => {
    const {metadata} = dao;
    return {
      ...dao,
      metadata: {
        ...metadata,
        avatar: metadata.avatar,
      },
    } as T;
  });
}
