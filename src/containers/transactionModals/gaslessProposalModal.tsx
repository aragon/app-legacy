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
    [StepStatus.WAITING]: t('gaslessProposalCreation.publishProposal'),
    [StepStatus.LOADING]: undefined,
    [StepStatus.SUCCESS]: t('gaslessProposalCreation.gotoProposal'),
    [StepStatus.ERROR]: t('gaslessProposalCreation.tryAgain'),
  };

  const labels: StepperLabels<GaslessProposalStepId> = {
    REGISTER_VOCDONI_ACCOUNT: {
      title: t('gaslessProposalCreation.createVocdoniAccount.title'),
      helper: t('gaslessProposalCreation.createVocdoniAccount.helper'),
    },
    CREATE_VOCDONI_ELECTION: {
      title: t('gaslessProposalCreation.createVocdoniElection.title'),
      helper: t('gaslessProposalCreation.createVocdoniElection.helper'),
    },
    CREATE_ONCHAIN_PROPOSAL: {
      title: t('gaslessProposalCreation.createOnChainProposal.title'),
      helper: t('gaslessProposalCreation.createOnChainProposal.helper'),
    },
    PROPOSAL_IS_READY: {
      title: t('gaslessProposalCreation.proposalReady.title'),
    },
  };

  return (
    <StepperModal buttonLabels={btnLabel} stepLabels={labels} {...props} />
  );
};

export default GaslessProposalModal;
