import {useQueries} from '@tanstack/react-query';
import {useClient} from './useClient';
import {ProposalId} from 'utils/types';

/**
 *  This method is a Mock validation function until the real SDK functions are ready
 * @param address dao address
 * @returns an arrea of queries the indicates the status of verifications
 */
export function useUpdateVerification(
  proposalId: ProposalId | string,
  isPluginUpdateProposal?: boolean,
  isOsUpdateProposal?: boolean
) {
  const {client} = useClient();

  const verificationQueries = [
    {
      queryKey: ['isPluginUpdateProposalValid', proposalId],
      queryFn: () => client?.methods.isPluginUpdateValid(proposalId as string),
      enabled: Boolean(proposalId) && isPluginUpdateProposal,
      retry: false,
    },
    {
      queryKey: ['isDaoUpdateProposalValid', proposalId],
      queryFn: () =>
        client?.methods.isDaoUpdateValid({
          proposalId: proposalId as string,
        }),
      enabled: Boolean(proposalId) && isOsUpdateProposal,
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
