import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {useNetwork} from 'context/network';
import {
  addVerifiedSmartContract,
  getVerifiedSmartContracts,
} from 'services/cache';
import {
  CHAIN_METADATA,
  SupportedNetworks,
  VERIFIED_CONTRACTS_KEY,
} from 'utils/constants';
import {SmartContract} from 'utils/types';

type ContractSelector<T> = (contracts: SmartContract[]) => T;

/**
 * A custom React hook that returns a list of verified smart contracts for a given DAO.
 *
 * @template T type of the smart contracts, default is SmartContract[].
 * @param daoAddress DAO address for which to fetch smart contracts
 * @param select optional selector function to transform the result.
 * @returns query result object with the data and status.
 */
export function useDaoVerifiedContractsQuery<T = SmartContract[]>(
  // TODO: remove the hardcoded DAO when SCC can actually get dao address
  daoAddress: string | undefined = '0xad6fc78da51c944595682784d346ca8bf98c37c6',
  select?: ContractSelector<T>
): UseQueryResult<T> {
  const {network} = useNetwork();
  const daoChain = CHAIN_METADATA[network].id;

  return useQuery({
    queryKey: [VERIFIED_CONTRACTS_KEY, daoAddress, network],
    queryFn: () => getVerifiedSmartContracts(daoAddress, daoChain),
    select,
    enabled: !!network && !!daoChain,
    refetchOnWindowFocus: false,
  });
}

/**
 * MutationVariables type represents the input variables
 * for the useAddVerifiedSmartContract hook.
 */
type MutationVariables = {
  contract: SmartContract;
  daoAddress: string;
  network: SupportedNetworks;
};

type MutationContext = {
  previousContracts: SmartContract[] | undefined;
};

/**
 * useAddVerifiedContractMutation is a custom hook for adding a verified smart contract
 * to the list of "cached" verified smart contracts.
 *
 * This hook optimistically updates the cache with the new smart contract before
 * actually adding it, providing a more responsive user experience.
 *
 * @returns a mutation result object with fields for the current mutation state.
 */
export const useAddVerifiedContractMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({contract, daoAddress, network}: MutationVariables) =>
      addVerifiedSmartContract(
        contract,
        daoAddress,
        CHAIN_METADATA[network].id
      ),

    onMutate: async ({
      daoAddress,
      network,
      contract,
    }): Promise<MutationContext> => {
      // query invalidated by current mutation
      const invalidatedQuery = [VERIFIED_CONTRACTS_KEY, daoAddress, network];

      await queryClient.cancelQueries(invalidatedQuery);

      // get data before mutation; note the empty array since we are going to
      // augment it with
      const previousContracts =
        queryClient.getQueryData<SmartContract[]>(invalidatedQuery);

      // optimistically update the result of the invalidated query
      const updatedContracts = [...(previousContracts ?? []), contract];
      queryClient.setQueryData(invalidatedQuery, updatedContracts);

      return {previousContracts};
    },

    onError: (
      error,
      {daoAddress, network},
      context: MutationContext | undefined
    ) => {
      // revert the data to pre mutation state
      if (context?.previousContracts) {
        const invalidatedQuery = [VERIFIED_CONTRACTS_KEY, daoAddress, network];
        queryClient.setQueryData(invalidatedQuery, context.previousContracts);
      }
      console.error('Error adding the smart contract:', error);
    },

    onSettled: (_data, _error, {daoAddress, network}) => {
      // invalidate query affected by mutation
      const invalidatedQuery = [VERIFIED_CONTRACTS_KEY, daoAddress, network];
      queryClient.invalidateQueries(invalidatedQuery);
    },
  });
};
