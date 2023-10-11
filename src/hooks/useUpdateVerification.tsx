import {useQueries} from '@tanstack/react-query';
import {useClient} from './useClient';
import {ProposalId} from 'utils/types';

/**
 *  This method is a Mock validation function until the real SDK functions are ready
 * @param address dao address
 * @returns an arrea of queries the indicates the status of verifications
 */
export function useUpdateVerification(proposalId: ProposalId) {
  const {client} = useClient();

  const verificationQueries = [
    {
      queryKey: ['isPluginUpdateProposalValid', proposalId],
      queryFn: () => client?.methods.isPluginUpdateProposalValid(proposalId),
      enabled: Boolean(proposalId),
      retry: false,
    },
    {
      queryKey: ['isDaoUpdateProposalValid', proposalId],
      queryFn: () =>
        client?.methods.isDaoUpdateProposalValid({
          proposalId,
        }),
      enabled: Boolean(proposalId),
      retry: false,
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
