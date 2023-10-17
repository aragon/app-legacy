import {
  useClient,
  useClient as useVocdoniClient,
} from '@vocdoni/react-providers';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {VoteProposalParams} from '@aragon/sdk-client';
import {Vote} from '@vocdoni/sdk';
import {
  StepsMap,
  StepStatus,
  useFunctionStepper,
} from '../hooks/useFunctionStepper';
import {
  GaslessVotingProposal,
  OffchainVotingClient,
} from '@vocdoni/offchain-voting';
import {DetailedProposal, ProposalId} from '../utils/types';
import {isGaslessProposal} from '../utils/proposals';
import {GaselessPluginName, usePluginClient} from '../hooks/usePluginClient';
import {useWallet} from '../hooks/useWallet';
import {useDaoDetailsQuery} from '../hooks/useDaoDetails';
import {ProposalStatus} from '@aragon/sdk-client-common';

// todo(kon): move this block somewhere else
export enum OffchainVotingStepId {
  CREATE_VOTE_ID = 'CREATE_VOTE_ID',
  PUBLISH_VOTE = 'PUBLISH_VOTE',
}

export type OffchainVotingSteps = StepsMap<OffchainVotingStepId>;

// todo(kon): end to move this block somewhere else

const useOffchainVoting = () => {
  const {client: vocdoniClient} = useVocdoniClient();
  const pluginClient = usePluginClient(
    GaselessPluginName
  ) as OffchainVotingClient;
  const {data: daoDetails} = useDaoDetailsQuery();

  const getElectionId = useCallback(
    async (proposalId: string) => {
      if (daoDetails === undefined) return '';
      const {proposal: id} = new ProposalId(
        proposalId
      ).stripPlgnAdrFromProposalId();

      const proposal = await pluginClient.methods.getProposal(
        daoDetails!.ensDomain,
        daoDetails!.address,
        daoDetails!.plugins[0].instanceAddress,
        id
      );

      return proposal?.vochainProposalId || '';
    },
    [daoDetails, pluginClient]
  );

  const {steps, updateStepStatus, doStep, globalState, resetStates} =
    useFunctionStepper({
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
      await vocdoniClient.setElectionId(electionId);
      console.log('DEBUG', 'Submitting the vote');
      const voteId = await vocdoniClient.submitVote(vocVote);
      console.log('DEBUG', 'Vote submitted');
      return voteId;
    },
    [vocdoniClient]
  );

  const vote = useCallback(
    async (vote: VoteProposalParams) => {
      console.log('DEBUG', 'Trying to get election id for', vote.proposalId);

      if (globalState === StepStatus.ERROR) {
        // If global status is error, reset the stepper states
        resetStates();
      }

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
        await submitVote(vote, electionId!);
      });
    },
    [doStep, getElectionId, submitVote]
  );

  return {vote, getElectionId, steps, globalState};
};

/**
 * Wrapper for client.hasAlreadyVoted().
 *
 * Used to call asynchronously the has already vote function and store it on a react state.
 */
export const useOffchainHasAlreadyVote = ({
  proposal,
}: {
  proposal: DetailedProposal | undefined;
}) => {
  const [hasAlreadyVote, setHasAlreadyVote] = useState(false);
  const {client} = useClient();

  useEffect(() => {
    const checkAlreadyVote = async () => {
      setHasAlreadyVote(
        !!(await client.hasAlreadyVoted(
          (proposal as GaslessVotingProposal)!.vochainProposalId!
        ))
      );
    };
    if (
      client &&
      proposal &&
      isGaslessProposal(proposal) &&
      proposal?.vochainProposalId
    )
      checkAlreadyVote();
  }, [client, proposal]);

  return {hasAlreadyVote};
};

export const useGaslessCommiteVotes = (
  pluginAddress: string,
  proposal: GaslessVotingProposal
) => {
  const [canApprove, setCanApprove] = useState(false);
  const client = usePluginClient(GaselessPluginName) as OffchainVotingClient;
  const {address} = useWallet();

  const isApprovalPeriod = useMemo(() => {
    if (!proposal) return false;
    return (
      proposal.endDate.valueOf() < new Date().valueOf() &&
      proposal.expirationDate.valueOf() > new Date().valueOf()
    );
  }, [proposal]);

  const proposalCanBeApproved =
    isApprovalPeriod && proposal.status === ProposalStatus.SUCCEEDED;

  const approved = useMemo(() => {
    return proposal.approvers?.some(approver => approver === address);
  }, [address, proposal.approvers]);

  const isApproved = useMemo(() => {
    if (!proposal) return false;
    return proposal.settings.minTallyApprovals <= proposal.approvers.length;
  }, [proposal]);

  const canBeExecuted = useMemo(() => {
    if (!client || !proposal) return false;
    return isApproved && proposalCanBeApproved;
  }, [client, isApproved, proposal, proposalCanBeApproved]);

  const nextVoteWillApprove =
    proposal.approvers.length + 1 === proposal.settings.minTallyApprovals;

  const executed = proposal.executed;

  const notBegan = proposal.endDate.valueOf() > new Date().valueOf();

  useEffect(() => {
    const checkCanVote = async () => {
      const canApprove =
        (await client?.methods.isCommitteeMember(pluginAddress, address!)) ||
        false;
      setCanApprove(canApprove);
    };
    if (address && client) {
      approved || !isApprovalPeriod || !proposalCanBeApproved
        ? setCanApprove(false)
        : checkCanVote();
    }
  }, [
    address,
    client,
    isApprovalPeriod,
    pluginAddress,
    proposalCanBeApproved,
    approved,
  ]);

  return {
    isApprovalPeriod,
    canApprove,
    approved,
    isApproved,
    canBeExecuted,
    nextVoteWillApprove,
    proposalCanBeApproved,
    executed,
    notBegan,
  };
};

export default useOffchainVoting;
