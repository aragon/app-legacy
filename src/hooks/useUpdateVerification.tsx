import {useQueries} from '@tanstack/react-query';

import {useClient} from './useClient';

/**
 * Custom hook for updating verification.
 *
 * @param proposalId - The ID of the proposal.
 * @returns The result of the verification queries.
 */
export function useUpdateVerification(
  proposalId: string,
  isPluginUpdate?: boolean,
  isOSUpdate?: boolean
) {
  const {client} = useClient();

  const verificationQueries = [
    {
      queryKey: ['isPluginUpdateProposalValid', proposalId],
      queryFn: () => client?.methods.isPluginUpdateProposalValid(proposalId),
      enabled: Boolean(proposalId) && isPluginUpdate,
    },
    {
      queryKey: ['isDaoUpdateProposalValid', proposalId],
      queryFn: () => client?.methods.isDaoUpdateProposalValid(proposalId),
      enabled: Boolean(proposalId) && isOSUpdate,
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
