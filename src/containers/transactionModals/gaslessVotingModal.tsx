import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import StepperModal, {BtnLabels} from '../../context/stepperModal';
import {StepStatus} from '../../hooks/useFunctionStepper';
import useGaslessVoting, {
  GaslessVotingStepId,
} from '../../context/useGaslessVoting';
import {StepperLabels} from '../../components/StepperProgress';
import {VoteProposalParams, VoteValues} from '@aragon/sdk-client';
import {useWallet} from '../../hooks/useWallet';

type GaslessVotingModalProps = {
  vote: VoteProposalParams | undefined;
  showVoteModal: boolean;
  setShowVoteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setVoteSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  onVoteSubmitted: (
    proposalId: string,
    vote: VoteValues,
    isApproval?: boolean
  ) => Promise<void>;
};

const GaslessVotingModal: React.FC<GaslessVotingModalProps> = ({
  vote,
  showVoteModal,
  setShowVoteModal,
  setVoteSubmitted,
  onVoteSubmitted,
}): // props: OffChainVotingModalProps<X>
JSX.Element => {
  const {t} = useTranslation();
  const {isConnected} = useWallet();

  const {
    vote: submitGaslessVote,
    steps: gaslessSteps,
    globalState: gaslessGlobalState,
  } = useGaslessVoting();

  const btnLabel: BtnLabels = {
    [StepStatus.WAITING]: t('gaslessVoting.stepperBtn.confirmVote'),
    [StepStatus.LOADING]: undefined,
    [StepStatus.SUCCESS]: t('gaslessVoting.stepperBtn.seeYourVote'),
    [StepStatus.ERROR]: t('gaslessVoting.stepperBtn.tryAgain'),
  };

  const labels: StepperLabels<GaslessVotingStepId> = {
    [GaslessVotingStepId.CREATE_VOTE_ID]: {
      title: t('gaslessVoting.createVoteId.title'),
      helper: t('gaslessVoting.createVoteId.helper'),
    },
    [GaslessVotingStepId.PUBLISH_VOTE]: {
      title: t('gaslessVoting.publishVote.title'),
      helper: t('gaslessVoting.publishVote.helper'),
    },
  };

  const handleCloseVoteModal = useCallback(() => {
    switch (gaslessGlobalState) {
      case StepStatus.LOADING:
        break;
      case StepStatus.SUCCESS:
        setShowVoteModal(false);
        break;
      default: {
        setShowVoteModal(false);
      }
    }
  }, [gaslessGlobalState, setShowVoteModal]);

  const handleVoteExecution = useCallback(async () => {
    if (gaslessGlobalState === StepStatus.SUCCESS) {
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

      await submitGaslessVote(vote);

      await onVoteSubmitted(vote.proposalId, vote.vote, false);
    }
  }, [
    handleCloseVoteModal,
    isConnected,
    gaslessGlobalState,
    onVoteSubmitted,
    setVoteSubmitted,
    submitGaslessVote,
    vote,
  ]);

  return (
    <StepperModal
      buttonLabels={btnLabel}
      stepLabels={labels}
      steps={gaslessSteps}
      globalState={gaslessGlobalState}
      isOpen={showVoteModal}
      onClose={handleCloseVoteModal}
      callback={handleVoteExecution}
      closeOnDrag={gaslessGlobalState !== StepStatus.LOADING}
      maxFee={BigInt(0)}
      averageFee={BigInt(0)}
      gasEstimationError={undefined}
      tokenPrice={0}
      title={t('gaslessVoting.title')}
    />
  );
};

export default GaslessVotingModal;
