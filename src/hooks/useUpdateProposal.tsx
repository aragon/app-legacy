import {useQuery} from '@tanstack/react-query';
import {ProposalListItem, DetailedProposal} from 'utils/types';

/**
 *  This method is a Mock query of update proposal-related things until the real SDK functions are ready
 * @param proposal dao proposal entity
 * @returns queries the indicates the update proposal identity
 */
export function useUpdateProposal(
  proposal?: ProposalListItem | DetailedProposal
) {
  // FIXME: remove this function and use the real SDK function
  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  const updateProposalCheck = useQuery({
    queryKey: ['updateProposalCheck', proposal],
    queryFn: () =>
      new Promise(resolve => {
        setTimeout(() => resolve(Boolean(getRandomInt(2))));
      }),
    enabled: Boolean(proposal),
  });

  const aragonVerifiedUpdateProposalCheck = useQuery({
    queryKey: ['aragonVerifiedUpdateProposalCheck', proposal],
    queryFn: () =>
      new Promise(resolve => {
        setTimeout(() => resolve(Boolean(getRandomInt(2))));
      }),
    enabled: Boolean(proposal),
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
