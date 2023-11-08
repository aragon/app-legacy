import React from 'react';
import {useTranslation} from 'react-i18next';

import {GaslessProposalStepId} from '../../context/createGaslessProposal';
import {StepperLabels} from '../../components/StepperProgress';
import {StepStatus} from '../../hooks/useFunctionStepper';
import StepperModal, {
  BtnLabels,
  StepperModalProps,
} from '../../context/stepperModal';

export type OffChainProposalModalProps<X extends GaslessProposalStepId> = Omit<
  StepperModalProps<X>,
  'stepLabels' | 'buttonLabels'
>;

const GaslessProposalModal = <X extends GaslessProposalStepId>(
  props: OffChainProposalModalProps<X>
): JSX.Element => {
  const {t} = useTranslation();

  const btnLabel: BtnLabels = {
    [StepStatus.WAITING]: t('labels.submitProposal'),
    [StepStatus.LOADING]: undefined,
    [StepStatus.SUCCESS]: t('TransactionModal.goToProposal'),
    [StepStatus.ERROR]: t('modal.transaction.multisig.ctaLabel.tryAgain'),
  };

  const labels: StepperLabels<GaslessProposalStepId> = {
    REGISTER_VOCDONI_ACCOUNT: {
      title: t('modalTransaction.vocdoni.deploy.createOffchain'),
      helper: t('modalTransaction.vocdoni.deploy.signMessage'),
    },
    CREATE_VOCDONI_ELECTION: {
      title: t('modalTransaction.vocdoni.deploy.registerProposalOff'),
      helper: t('modalTransaction.vocdoni.deploy.signMessage'),
    },
    CREATE_ONCHAIN_PROPOSAL: {
      title: t('modalTransaction.vocdoni.deploy.registerProposalOn'),
      helper: t('modalTransaction.vocdoni.deploy.signTransaction'),
    },
    PROPOSAL_IS_READY: {
      title: t('modalTransaction.vocdoni.deploy.proposalRready'),
    },
  };

  return (
    <StepperModal
      title={t('TransactionModal.createProposal')}
      buttonLabels={btnLabel}
      stepLabels={labels}
      {...props}
    />
  );
};

export default GaslessProposalModal;
