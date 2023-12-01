import {useQueries} from '@tanstack/react-query';

import {useClient} from './useClient';

/**
 * Custom hook to check if a proposal is an update proposal.
 * @param proposalId - The ID of the proposal.
 * @returns An array of queries to check if the proposal is an update proposal.
 */
export function useIsUpdateProposal(proposalId: string) {
  const {client} = useClient();

  const verificationQueries = [
    {
      queryKey: ['isPluginUpdateProposal', proposalId],
      queryFn: () => client?.methods.isPluginUpdateProposal(proposalId),
      enabled: Boolean(proposalId),
    },
    {
      queryKey: ['isDaoUpdateProposal', proposalId],
      queryFn: () => client?.methods.isDaoUpdateProposal(proposalId),
      enabled: Boolean(proposalId),
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
