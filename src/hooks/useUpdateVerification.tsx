import {useQueries} from '@tanstack/react-query';

import {useClient} from './useClient';

/**
 *  This method is a Mock validation function until the real SDK functions are ready
 * @param address dao address
 * @returns an area of queries the indicates the status of verifications
 */
export function useUpdateVerification(daoAddress: string, proposalId?: string) {
  const {client} = useClient();

  const verificationQueries = [
    {
      queryKey: ['isPluginUpdateProposalValid', daoAddress],
      queryFn: () =>
        client?.methods.isPluginUpdateProposal(proposalId as string),
      enabled: Boolean(daoAddress) && Boolean(proposalId),
    },
    {
      queryKey: ['isDaoUpdateProposalValid', daoAddress],
      queryFn: () =>
        client?.methods.isDaoUpdateProposalValid(proposalId as string),
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
