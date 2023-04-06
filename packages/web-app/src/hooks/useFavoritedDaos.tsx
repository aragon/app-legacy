import {IDaoQueryParams} from '@aragon/sdk-client';
import {
  InfiniteData,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {NavigationDao} from 'context/apolloClient';
import {useCallback} from 'react';
import {
  addFavoriteDaoToCache,
  getFavoritedDaoFromCache,
  getFavoritedDaosFromCache,
  removeFavoriteDaoFromCache,
  updateFavoritedDaoInCache,
} from 'services/cache';
import {
  CHAIN_METADATA,
  SupportedNetworks,
  getSupportedNetworkByChainId,
} from 'utils/constants';
import {resolveDaoAvatarIpfsCid} from 'utils/library';

const DEFAULT_QUERY_PARAMS = {
  skip: 0,
  limit: 4,
};

/**
 * This hook retrieves a list of cached DAOs with optional pagination.
 * @param skip The number of DAOs to skip before starting to fetch the result set.
 * (defaults to 0)
 * @param limit The maximum number of DAOs to return. Fetches all available DAOs by default.
 * @returns result object containing an array of NavigationDao objects with added avatar information.
 */
export const useFavoritedDaosQuery = (
  skip = 0
): UseQueryResult<NavigationDao[]> => {
  return useQuery<NavigationDao[]>({
    queryKey: ['favoriteDaos'],
    queryFn: useCallback(() => getFavoritedDaosFromCache({skip}), [skip]),
    select: addAvatarToDaos,
    refetchOnWindowFocus: false,
  });
};

/**
 * This hook manages the pagination of cached DAOs.
 * @param enabled boolean value that indicates whether the query should be enabled or not
 * @param options.limit maximum number of DAOs to be fetched per page.
 * @returns an infinite query object that can be used to fetch and
 * display the cached DAOs.
 */
export const useFavoritedDaosInfiniteQuery = (
  enabled = true,
  {
    limit = DEFAULT_QUERY_PARAMS.limit,
  }: Partial<Pick<IDaoQueryParams, 'limit'>> = {}
) => {
  return useInfiniteQuery({
    queryKey: ['infiniteFavoriteDaos'],

    queryFn: useCallback(
      ({pageParam = 0}) =>
        getFavoritedDaosFromCache({
          skip: limit * pageParam,
          limit,
        }),
      [limit]
    ),

    getNextPageParam: (
      lastPage: NavigationDao[],
      allPages: NavigationDao[][]
    ) => (lastPage.length === limit ? allPages.length : undefined),

    select: augmentCachedDaos,
    enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetch a favorite DAO from the cache
 * @param daoAddress address of the favorited DAO
 * @param network network of the favorited DAO
 * @returns favorited DAO with given address and network if available
 */
export const useFavoritedDaoQuery = (
  daoAddress: string | undefined,
  network: SupportedNetworks
) => {
  const chain = CHAIN_METADATA[network].id;

  return useQuery({
    queryKey: ['favoritedDao', daoAddress, network],
    queryFn: () => getFavoritedDaoFromCache(daoAddress, chain),
    enabled: !!daoAddress && !!network,
  });
};

/**
 * Update a favorited DAO in in the cache
 */
export const useUpdateFavoritedDaoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {dao: NavigationDao}) =>
      updateFavoritedDaoInCache(variables.dao),

    onSuccess: (_, variables) => {
      const network = getSupportedNetworkByChainId(variables.dao.chain);

      queryClient.invalidateQueries(['favoriteDaos']);
      queryClient.invalidateQueries(['infiniteFavoriteDaos']);
      queryClient.invalidateQueries([
        'favoritedDao',
        variables.dao.address,
        network,
      ]);
    },
  });
};

/**
 * Add a favorited DAO to the cache
 * @param onSuccess callback to run once DAO has been added to the cache
 */
export const useAddFavoriteDaoMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {dao: NavigationDao}) =>
      addFavoriteDaoToCache(variables.dao),

    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries(['favoriteDaos']);
      queryClient.invalidateQueries(['infiniteFavoriteDaos']);
    },
  });
};

/**
 * Remove a favorited DAO from the cache
 * @param onSuccess callback to run once favorited DAO has been removed successfully
 */
export const useRemoveFavoriteDaoMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {dao: NavigationDao}) =>
      removeFavoriteDaoFromCache(variables.dao),

    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries(['favoriteDaos']);
      queryClient.invalidateQueries(['infiniteFavoriteDaos']);
    },
  });
};

/**
 * Augment DAOs by resolving the IPFS CID for each DAO's avatar.
 * @param data raw fetched data for the cached DAOs.
 * @returns list of DAOs augmented with the resolved IPFS CID avatars
 */
function augmentCachedDaos(data: InfiniteData<NavigationDao[]>) {
  return {
    pageParams: data.pageParams,
    pages: data.pages.flatMap(page => addAvatarToDaos(page)),
  };
}

/**
 * Add resolved IPFS CID for each DAO's avatar to the metadata.
 * @param daos array of `NavigationDao` objects representing the DAOs to be processed.
 * @returns array of augmented NavigationDao objects with resolved avatar IPFS CIDs.
 */
function addAvatarToDaos<T extends NavigationDao>(daos: T[]): T[] {
  return daos.map(dao => {
    const {metadata} = dao;
    return {
      ...dao,
      metadata: {...metadata, avatar: resolveDaoAvatarIpfsCid(metadata.avatar)},
    } as T;
  });
}
