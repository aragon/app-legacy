import {useClient as useVocdoniClient} from '@vocdoni/react-providers';
import {useCallback} from 'react';
import {VoteProposalParams} from '@aragon/sdk-client';
import {Vote} from '@vocdoni/sdk';
import {
  OffchainPluginLocalStorageKeys,
  OffchainPluginLocalStorageTypes,
} from './useVocdoniSdk';

const useOffchainVoting = () => {
  const {client: vocdoniClient} = useVocdoniClient();

  // todo(kon): move this into local storage provdier if needed
  const getElectionId = useCallback((proposalId: string) => {
    const proposalIds = localStorage.getItem(
      OffchainPluginLocalStorageKeys.PROPOSAL_TO_ELECTION
    );
    if (proposalIds !== null) {
      const parsed = JSON.parse(
        proposalIds
      ) as OffchainPluginLocalStorageTypes[OffchainPluginLocalStorageKeys.PROPOSAL_TO_ELECTION];
      if (proposalId in parsed) {
        return parsed[proposalId].electionId;
      }
    }
    return '';
  }, []);

  const submitVote = useCallback(
    async (vote: VoteProposalParams) => {
      console.log('DEBUG', 'Trying to get election id for', vote.proposalId);
      const electionId = getElectionId(vote.proposalId);
      if (!electionId) {
        throw Error('Proposal id has not any associated vocdoni electionId');
      }

      const vocVote = new Vote([vote.vote - 1]); // See values on the enum, using vocdoni starts on 0
      console.log('DEBUG', 'ElectionId and vote', electionId, vocVote);

      // todo(kon): use election provider instead of set manually the election id
      await vocdoniClient.setElectionId(electionId);
      console.log('DEBUG', 'Submitting the vote');
      await vocdoniClient.submitVote(vocVote);
      console.log('DEBUG', 'Vote submitted');
    },
    [vocdoniClient]
  );
  return {submitVote};
};

export default useOffchainVoting;
