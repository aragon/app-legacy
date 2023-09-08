import React from 'react';
import {useTranslation} from 'react-i18next';

import {useNetwork} from 'context/network';
import {OffchainProposalStepId} from '../../context/createOffchainProposal';
import {StepperLabels} from '../../components/StepperProgress';
import {GenericKeyEnum, StepStatus} from '../../hooks/useFunctionStepper';
import StepperModal, {
  BtnLabels,
  StepperModalProps,
} from '../../context/stepperModal';

export type OffChainProposalModalProps<X extends OffchainProposalStepId> = Omit<
  StepperModalProps<X>,
  'stepLabels' | 'buttonLabels'
>;

const OffchainProposalModal = <X extends OffchainProposalStepId>(
  props: OffChainProposalModalProps<X>
): JSX.Element => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const btnLabel: BtnLabels = {
    [StepStatus.WAITING]: t('offChainProposalCreation.publishProposal'),
    [StepStatus.LOADING]: undefined,
    [StepStatus.SUCCESS]: t('offChainProposalCreation.gotoProposal'),
    [StepStatus.ERROR]: t('offChainProposalCreation.tryAgain'),
  };

  const labels: StepperLabels<OffchainProposalStepId> = {
    REGISTER_VOCDONI_ACCOUNT: {
      title: t('offChainProposalCreation.createVocdoniAccount.title'),
      helper: t('offChainProposalCreation.createVocdoniAccount.helper'),
    },
    CREATE_VOCDONI_ELECTION: {
      title: t('offChainProposalCreation.createVocdoniElection.title'),
      helper: t('offChainProposalCreation.createVocdoniElection.helper'),
    },
    CREATE_ONCHAIN_PROPOSAL: {
      title: t('offChainProposalCreation.createOnChainProposal.title'),
      helper: t('offChainProposalCreation.createOnChainProposal.helper'),
    },
    PROPOSAL_IS_READY: {
      title: t('offChainProposalCreation.proposalReady.title'),
    },
  };

  return (
    <StepperModal buttonLabels={btnLabel} stepLabels={labels} {...props} />
  );
};

export default OffchainProposalModal;
