import {useQueries} from '@tanstack/react-query';
import {useClient} from './useClient';
import {DaoAction} from '@aragon/sdk-client-common';

/**
 *  This method is a Mock validation function until the real SDK functions are ready
 * @param address dao address
 * @returns an arrea of queries the indicates the status of verifications
 */
export function useUpdateVerification(
  actions: DaoAction[],
  daoAddress: string
  // isPluginUpdateProposal?: boolean,
  // isOsUpdateProposal?: boolean
) {
  const {client} = useClient();

  const verificationQueries = [
    {
      queryKey: ['isPluginUpdateProposalValid', daoAddress],
      queryFn: () =>
        client?.methods.isPluginUpdateValid({
          daoAddress: daoAddress,
          actions,
        }),
      enabled: Boolean(daoAddress) && Boolean(actions),
    },
    {
      queryKey: ['isDaoUpdateProposalValid', daoAddress],
      queryFn: () =>
        client?.methods.isDaoUpdateValid({
          daoAddress: daoAddress,
          actions,
        }),
      enabled: Boolean(daoAddress) && Boolean(actions),
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
