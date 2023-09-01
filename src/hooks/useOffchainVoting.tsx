import {useClient as useVocdoniClient} from 'hooks/useVocdoniSdk';
import {useCallback} from 'react';
import {VoteProposalParams} from '@aragon/sdk-client';
import {Vote} from '@vocdoni/sdk';

const useOffchainVoting = () => {
  const {client: vocdoniClient} = useVocdoniClient();

  const submitVote = useCallback(
    async (vocdoniElectionId: string, vote: VoteProposalParams) => {
      const vocVote = new Vote([vote.vote - 1]); // See values on the enum, using vocdoni starts on 0
      // todo(kon): use election provider instead of set manually the election id
      await vocdoniClient.setElectionId(vocdoniElectionId);
      await vocdoniClient.submitVote(vocVote);
    },
    [vocdoniClient]
  );
  return {submitVote};
};

export default useOffchainVoting;
