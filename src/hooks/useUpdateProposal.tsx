import {useQuery} from '@tanstack/react-query';
import {DaoAction} from '@aragon/sdk-client-common';
import {useClient} from './useClient';

/**
 *  This method is a Mock query of update proposal-related things until the real SDK functions are ready
 * @param proposalId dao proposal id
 * @returns queries the indicates the update proposal identity
 */
export function useUpdateProposal(
  proposalId: string | undefined,
  proposalActions: DaoAction[]
) {
  const {client} = useClient();

  const aragonVerifiedUpdateProposalCheck = useQuery({
    queryKey: ['aragonVerifiedUpdateProposalCheck', proposalId],
    queryFn: () => {
      return (
        client?.methods.isDaoUpdate(proposalActions) ||
        client?.methods.isPluginUpdate(proposalActions)
      );
    },
    enabled: Boolean(proposalId),
  });

  const isAragonVerifiedUpdateProposal =
    !aragonVerifiedUpdateProposalCheck.isLoading &&
    aragonVerifiedUpdateProposalCheck.data;

  return {
    aragonVerifiedUpdateProposalCheck,
    isAragonVerifiedUpdateProposal,
  };
}
