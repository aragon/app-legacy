import {DaoDetails} from '@aragon/sdk-client';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {PendingDao} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {
  addPendingDaoToCache,
  getPendingDaoFromCache,
  removePendingDaoFromCache,
} from 'services/cache';
import {SupportedNetworks} from 'utils/constants';

/**
 * Get pending DAO upon creation
 * @param daoAddress address of the pending DAO
 * @returns a DAO that has not been indexed by the subgraph
 */
export const usePendingDao = (daoAddress: string | undefined) => {
  const {network, networkUrlSegment} = useNetwork();

  return useQuery<DaoDetails | null>({
    queryKey: ['pendingDao', daoAddress, network],
    queryFn: () => getPendingDaoFromCache(network, daoAddress),
    enabled: !!daoAddress && network === networkUrlSegment,
  });
};

/**
 * Adds a newly created DAO to the list of pending DAOs
 */
export const useAddPendingDaoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      daoAddress: string;
      network: SupportedNetworks;
      daoDetails: PendingDao;
    }) =>
      addPendingDaoToCache(
        variables.daoAddress,
        variables.network,
        variables.daoDetails
      ),

    onMutate: async variables => {
      const pendingDaoQueryKey = [
        'pendingDao',
        variables.daoAddress,
        variables.network,
      ];

      // cancel all calls to get pending DAO
      await queryClient.cancelQueries({
        queryKey: pendingDaoQueryKey,
      });

      // get the previous pending DAO query result
      const previousPendingDao = queryClient.getQueryData(pendingDaoQueryKey);

      // build the next result based on the mutation
      const newPendingDao = {
        address: variables.daoAddress,
        ensDomain: variables.daoDetails.ensSubdomain,
        metadata: variables.daoDetails.metadata,
        plugins: [],
        creationDate: variables.daoDetails.creationDate,
      } as DaoDetails;

      // set new pending DAO as query result
      queryClient.setQueryData(pendingDaoQueryKey, newPendingDao);

      // return old result in case we have to roll back the optimistic update
      return {previousPendingDao};
    },

    onError: (
      _error,
      variables,
      context: {previousPendingDao: unknown} | undefined
    ) => {
      const pendingDaoQueryKey = [
        'pendingDao',
        variables.daoAddress,
        variables.network,
      ];

      // roll back optimistic update if there is an error
      queryClient.setQueryData(pendingDaoQueryKey, context?.previousPendingDao);
    },

    onSettled: (_data, _error, variables) => {
      const pendingDaoQueryKey = [
        'pendingDao',
        variables.daoAddress,
        variables.network,
      ];
      queryClient.invalidateQueries({queryKey: pendingDaoQueryKey});
    },
  });
};

/**
 * Remove a pending DAO from the cache
 * @param onSuccess callback function to run once mutation has been
 * performed successfully
 * @returns mutation api for removing a pending DAO from the cache
 */
export const useRemovePendingDaoMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      network: SupportedNetworks;
      daoAddress: string | undefined;
    }) => removePendingDaoFromCache(variables.network, variables.daoAddress),

    onSuccess: (_, variables) => {
      onSuccess?.();
      queryClient.invalidateQueries([
        'pendingDao',
        variables.daoAddress,
        variables.network,
      ]);
    },
  });
};
