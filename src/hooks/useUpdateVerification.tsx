import {useQueries} from '@tanstack/react-query';

import {useClient} from './useClient';

/**
 * Custom hook for update proposal verification.
 * @param daoAddress - The address of the DAO.
 * @param proposalId - The ID of the proposal.
 * @returns The result of the verification queries.
 */
export function useUpdateVerification(daoAddress: string, proposalId: string) {
  const {client} = useClient();

  const verificationQueries = [
    {
      queryKey: ['isPluginUpdateProposalValid', daoAddress],
      queryFn: () => client?.methods.isPluginUpdateProposalValid(proposalId),
      enabled: Boolean(daoAddress) && Boolean(proposalId),
    },
    {
      queryKey: ['isDaoUpdateProposalValid', daoAddress],
      queryFn: () => client?.methods.isDaoUpdateProposalValid(proposalId),
      enabled: Boolean(daoAddress) && Boolean(proposalId),
    },
  ];

  return useQueries({
    queries: verificationQueries.map(config => {
      return {
        ...config,
      };
    }),
  });
}
