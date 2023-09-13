import {useClient as useVocdoniClient} from '@vocdoni/react-providers';
import {useCallback} from 'react';
import {VoteProposalParams} from '@aragon/sdk-client';
import {Vote} from '@vocdoni/sdk';
import {
  OffchainPluginLocalStorageKeys,
  OffchainPluginLocalStorageTypes,
} from '../hooks/useVocdoniSdk';
import {
  StepsMap,
  StepStatus,
  useFunctionStepper,
} from '../hooks/useFunctionStepper';

// todo(kon): move this block somewhere else
export enum OffchainVotingStepId {
  CREATE_VOTE_ID = 'CREATE_VOTE_ID',
  PUBLISH_VOTE = 'PUBLISH_VOTE',
}

export type OffchainVotingSteps = StepsMap<OffchainVotingStepId>;

// todo(kon): end to move this block somewhere else

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

  const {steps, updateStepStatus, doStep, globalState} = useFunctionStepper({
    initialSteps: {
      CREATE_VOTE_ID: {
        status: StepStatus.WAITING,
      },
      PUBLISH_VOTE: {
        status: StepStatus.WAITING,
      },
    } as OffchainVotingSteps,
  });

  const submitVote = useCallback(
    async (vote: VoteProposalParams, electionId: string) => {
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

  const vote = useCallback(
    async (vote: VoteProposalParams) => {
      console.log('DEBUG', 'Trying to get election id for', vote.proposalId);

      // todo(kon): this step should be removed when min-sdk implemented
      // 1. Retrieve the election id
      const electionId = await doStep(
        OffchainVotingStepId.CREATE_VOTE_ID,
        async () => {
          const electionId = getElectionId(vote.proposalId);
          if (!electionId) {
            throw Error(
              'Proposal id has not any associated vocdoni electionId'
            );
          }
          return electionId;
        }
      );
      console.log('DEBUG', 'ElectionId found', electionId);

      // 2. Sumbit vote
      await doStep(OffchainVotingStepId.PUBLISH_VOTE, async () => {
        await submitVote(vote, electionId);
      });
    },
    [doStep, getElectionId, submitVote]
  );

  return {vote, getElectionId, steps, globalState};
};

export default useOffchainVoting;
