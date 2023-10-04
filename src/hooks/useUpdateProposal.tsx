import {useQuery} from '@tanstack/react-query';

/**
 *  This method is a Mock query of update proposal-related things until the real SDK functions are ready
 * @param proposalId dao proposal id
 * @returns queries the indicates the update proposal identity
 */
export function useUpdateProposal(proposalId: string | undefined) {
  // FIXME: remove this function and use the real SDK function
  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  const updateProposalCheck = useQuery({
    queryKey: ['updateProposalCheck', proposalId],
    queryFn: () =>
      new Promise(resolve => {
        setTimeout(() => resolve(Boolean(getRandomInt(2))));
      }),
    enabled: Boolean(proposalId),
  });

  const aragonVerifiedUpdateProposalCheck = useQuery({
    queryKey: ['aragonVerifiedUpdateProposalCheck', proposalId],
    queryFn: () =>
      new Promise(resolve => {
        setTimeout(() => resolve(Boolean(getRandomInt(2))));
      }),
    enabled: Boolean(proposalId),
  });

  const isAragonVerifiedUpdateProposal =
    !aragonVerifiedUpdateProposalCheck.isLoading &&
    aragonVerifiedUpdateProposalCheck.data;

  return {
    updateProposalCheck,
    aragonVerifiedUpdateProposalCheck,
    isAragonVerifiedUpdateProposal,
  };
}
