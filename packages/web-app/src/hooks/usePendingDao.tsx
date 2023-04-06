import {DaoDetails} from '@aragon/sdk-client';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {useNetwork} from 'context/network';
import {
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
