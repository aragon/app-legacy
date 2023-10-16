import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import StepperModal, {BtnLabels} from '../../context/stepperModal';
import {StepStatus} from '../../hooks/useFunctionStepper';
import useOffchainVoting, {
  OffchainVotingStepId,
} from '../../context/useOffchainVoting';
import {StepperLabels} from '../../components/StepperProgress';
import {VoteProposalParams, VoteValues} from '@aragon/sdk-client';
import {useWallet} from '../../hooks/useWallet';
import {ProposalId} from '../../utils/types';
const OffchainVotingModal = ({
  vote,
  showVoteModal,
  setShowVoteModal,
  setVoteSubmitted,
  onVoteSubmitted,
}: {
  vote: VoteProposalParams | undefined;
  showVoteModal: boolean;
  setShowVoteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setVoteSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  onVoteSubmitted: (proposalId: ProposalId, vote: VoteValues) => Promise<void>;
}): // props: OffChainVotingModalProps<X>
JSX.Element => {
  const {t} = useTranslation();
  const {address, isConnected} = useWallet();

  const {
    vote: submitOffchainVote,
    steps: offchainSteps,
    globalState: offchainGlobalState,
  } = useOffchainVoting();

  const btnLabel: BtnLabels = {
    [StepStatus.WAITING]: t('offChainVoting.stepperBtn.confirmVote'),
    [StepStatus.LOADING]: undefined,
    [StepStatus.SUCCESS]: t('offChainVoting.stepperBtn.seeYourVote'),
    [StepStatus.ERROR]: t('offChainVoting.stepperBtn.tryAgain'),
  };

  const labels: StepperLabels<OffchainVotingStepId> = {
    [OffchainVotingStepId.CREATE_VOTE_ID]: {
      title: t('offChainVoting.createVoteId.title'),
      helper: t('offChainVoting.createVoteId.helper'),
    },
    [OffchainVotingStepId.PUBLISH_VOTE]: {
      title: t('offChainVoting.publishVote.title'),
      helper: t('offChainVoting.publishVote.helper'),
    },
  };

  const handleCloseVoteModal = useCallback(() => {
    switch (offchainGlobalState) {
      case StepStatus.LOADING:
        break;
      case StepStatus.SUCCESS:
        setShowVoteModal(false);
        break;
      default: {
        setShowVoteModal(false);
      }
    }
  }, [offchainGlobalState, setShowVoteModal]);

  const handleVoteExecution = useCallback(async () => {
    if (offchainGlobalState === StepStatus.SUCCESS) {
      handleCloseVoteModal();
      return;
    }
    if (!isConnected) {
      open('wallet');
      return;
    }

    if (vote) {
      // clear up previous submission state
      setVoteSubmitted(false);

      // todo(kon): simple way of voting, use providers better
      // It retrieves from local storage the vocdoni election id. Won't be this on the final implementation
      // Not showing errors neither
      await submitOffchainVote(vote);

      await onVoteSubmitted(new ProposalId(vote.proposalId), vote.vote);
    }
  }, [
    handleCloseVoteModal,
    isConnected,
    offchainGlobalState,
    onVoteSubmitted,
    setVoteSubmitted,
    submitOffchainVote,
    vote,
  ]);

  return (
    <StepperModal
      buttonLabels={btnLabel}
      stepLabels={labels}
      steps={offchainSteps}
      globalState={offchainGlobalState}
      isOpen={showVoteModal}
      onClose={handleCloseVoteModal}
      callback={handleVoteExecution}
      closeOnDrag={offchainGlobalState !== StepStatus.LOADING}
      // todo(kon): implementent free cost gas component
      maxFee={BigInt(0)}
      averageFee={BigInt(0)}
      gasEstimationError={undefined}
      tokenPrice={0}
      title={t('offChainVoting.title')}
    />
  );
};

export default OffchainVotingModal;
