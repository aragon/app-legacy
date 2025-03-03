import {VoteProposalParams} from '@aragon/sdk-client';
import {ProposalStatus} from '@aragon/sdk-client-common';
import {
  GaslessVotingClient,
  GaslessVotingProposal,
} from '@vocdoni/gasless-voting';
import {
  useClient,
  useClient as useVocdoniClient,
} from '@vocdoni/react-providers';
import {ErrElectionFinished, Vote} from '@vocdoni/sdk';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDaoDetailsQuery} from '../hooks/useDaoDetails';
import {
  StepStatus,
  StepsMap,
  useFunctionStepper,
} from '../hooks/useFunctionStepper';
import {
  PluginTypes,
  isGaslessVotingClient,
  usePluginClient,
} from '../hooks/usePluginClient';
import {useWallet} from '../hooks/useWallet';
import {isGaslessProposal} from '../utils/proposals';
import {DetailedProposal} from '../utils/types';
import {useTranslation} from 'react-i18next';

export enum GaslessVotingStepId {
  CREATE_VOTE_ID = 'CREATE_VOTE_ID',
  PUBLISH_VOTE = 'PUBLISH_VOTE',
}

export type GaslessVotingSteps = StepsMap<GaslessVotingStepId>;

const useGaslessVoting = () => {
  const {t} = useTranslation();
  const {client: vocdoniClient} = useVocdoniClient();
  const {data: daoDetails} = useDaoDetailsQuery();

  const pluginType = daoDetails?.plugins[0].id as PluginTypes;
  const pluginClient = usePluginClient(pluginType);

  const getElectionId = useCallback(
    async (proposalId: string) => {
      if (
        !daoDetails ||
        !pluginClient ||
        !isGaslessVotingClient(pluginClient)
      ) {
        return '';
      }

      const proposal = await pluginClient.methods.getProposal(
        proposalId,
        daoDetails.ensDomain,
        daoDetails.address
      );

      return proposal?.vochainProposalId ?? '';
    },
    [daoDetails, pluginClient]
  );

  const {steps, doStep, globalState, resetStates} = useFunctionStepper({
    initialSteps: {
      CREATE_VOTE_ID: {
        status: StepStatus.WAITING,
      },
      PUBLISH_VOTE: {
        status: StepStatus.WAITING,
      },
    } as GaslessVotingSteps,
  });

  const submitVote = useCallback(
    async (vote: VoteProposalParams, electionId: string) => {
      const vocVote = new Vote([vote.vote - 1]); // See values on the enum, using vocdoni starts on 0

      vocdoniClient.setElectionId(electionId);

      try {
        return await vocdoniClient.submitVote(vocVote);
      } catch (e) {
        if (e instanceof ErrElectionFinished) {
          throw new Error('The election has finished');
        } else if (
          e instanceof Object &&
          'message' in e &&
          typeof e.message === 'string' &&
          e.message.includes('User rejected the request.')
        ) {
          steps.PUBLISH_VOTE.status = StepStatus.ERROR;
          steps.PUBLISH_VOTE.errorMessage = t(
            'transactionDialog.error.rejected'
          );
          throw new Error(t('transactionDialog.error.rejected'));
        }
        throw e;
      }
    },
    [steps.PUBLISH_VOTE, t, vocdoniClient]
  );

  const vote = useCallback(
    async (vote: VoteProposalParams) => {
      if (globalState === StepStatus.ERROR) {
        // If global status is error, reset the stepper states
        resetStates();
      }

      // 1. Retrieve the election id
      const electionId = await doStep(
        GaslessVotingStepId.CREATE_VOTE_ID,
        async () => {
          const electionId = await getElectionId(vote.proposalId);
          if (!electionId) {
            throw Error(
              'Proposal id has not any associated vocdoni electionId'
            );
          }
          return electionId;
        }
      );

      // 2. Submit vote
      await doStep(GaslessVotingStepId.PUBLISH_VOTE, async () => {
        await submitVote(vote, electionId);
      });
    },
    [doStep, getElectionId, globalState, resetStates, submitVote]
  );

  return {vote, getElectionId, steps, globalState};
};

/**
 * Wrapper for client.hasAlreadyVoted().
 *
 * Used to call asynchronously the has already vote function and store it on a react state.
 */
export const useGaslessHasAlreadyVote = ({
  proposal,
}: {
  proposal: DetailedProposal | undefined | null;
}) => {
  const [hasAlreadyVote, setHasAlreadyVote] = useState(false);
  const {client, signer} = useClient();
  const {address} = useWallet();

  useEffect(() => {
    if (
      client &&
      proposal &&
      isGaslessProposal(proposal) &&
      proposal.vochainProposalId
    ) {
      (async () => {
        if (proposal.voters && proposal.voters.some(vote => vote === address)) {
          setHasAlreadyVote(true);
          return;
        }
        const hasAlreadyVote: boolean = !!(await client.hasAlreadyVoted({
          wallet: signer,
          electionId: proposal.vochainProposalId,
        }));
        setHasAlreadyVote(hasAlreadyVote);
      })();
    }
  }, [address, client, proposal, signer]);

  return {hasAlreadyVote};
};

export const useGaslessCommitteeVotes = (
  pluginAddress: string,
  pluginType: PluginTypes,
  proposal: GaslessVotingProposal
) => {
  const [canApprove, setCanApprove] = useState(false);
  const client = usePluginClient(pluginType);
  const {address} = useWallet();

  const isExecutionPeriod = proposal.status === ProposalStatus.SUCCEEDED;

  const isApprovalPeriod = (proposal => {
    if (
      !proposal ||
      (proposal.status !== ProposalStatus.ACTIVE && !isExecutionPeriod)
    )
      return false;
    return (
      (proposal.endDate.valueOf() < new Date().valueOf() &&
        proposal.tallyEndDate.valueOf() > new Date().valueOf() &&
        proposal?.canBeApproved) ??
      false
    );
  })(proposal);

  const isUserApproved = useMemo(() => {
    return proposal.approvers?.some(
      approver => approver.toLowerCase() === address?.toLowerCase()
    );
  }, [address, proposal.approvers]);

  const isProposalApproved = (proposal => {
    if (!proposal) return false;
    return proposal.settings.minTallyApprovals <= proposal.approvers.length;
  })(proposal);

  const canBeExecuted = (proposal => {
    if (!client || !proposal || proposal.executed) return false;
    return isExecutionPeriod && isProposalApproved && isApprovalPeriod;
  })(proposal);

  const executed = proposal.executed;

  const notBegan = proposal.endDate.valueOf() > new Date().valueOf();

  const executableWithNextApproval =
    proposal.status === ProposalStatus.ACTIVE &&
    proposal.actions.length > 0 &&
    proposal.settings.minTallyApprovals > 1 &&
    proposal.settings.minTallyApprovals - 1 === proposal.approvers.length;

  useEffect(() => {
    const checkCanVote = async () => {
      const canApprove =
        (await (client as GaslessVotingClient)?.methods.isMultisigMember(
          pluginAddress,
          address!
        )) || false;
      setCanApprove(canApprove);
    };

    if (!address || !client || !isGaslessVotingClient(client)) {
      return;
    }

    if (isUserApproved || !isApprovalPeriod) {
      setCanApprove(false);
      return;
    }

    checkCanVote();
  }, [address, client, isApprovalPeriod, pluginAddress, isUserApproved]);

  return {
    isApprovalPeriod,
    canApprove,
    isUserApproved,
    isProposalApproved,
    canBeExecuted,
    executableWithNextApproval,
    executed,
    notBegan,
  };
};

export default useGaslessVoting;
