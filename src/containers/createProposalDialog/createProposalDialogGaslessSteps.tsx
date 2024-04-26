import React from 'react';
import {IUseCreateVocdoniProposalTransationResult} from './hooks/useCreateVocdoniProposalTransaction';
import {StepperLabels, StepperModalProgress} from 'components/stepperProgress';
import {StepStatus, StepsMap} from 'hooks/useFunctionStepper';
import {TFunction} from 'i18next';
import {useTranslation} from 'react-i18next';
import {Button} from '@aragon/ods';
import {UseMutationResult} from '@tanstack/react-query';
import {IUseSendTransactionResult} from 'hooks/useSendTransaction';

export interface ICreateProposalDialogGaslessStepsProps {
  /**
   * Name of the process to log eventual errors.
   */
  process: string;
  /**
   * Displays the custom step button as loading when set to true.
   */
  createTransactionResult: IUseCreateVocdoniProposalTransationResult;
  /**
   * Result of the sendTransaction hook
   */
  sendTransactionResults: IUseSendTransactionResult;
}

export enum GaslessProposalStepId {
  REGISTER_VOCDONI_ACCOUNT = 'REGISTER_VOCDONI_ACCOUNT',
  CREATE_VOCDONI_ELECTION = 'CREATE_VOCDONI_ELECTION',
  CREATE_ONCHAIN_PROPOSAL = 'CREATE_ONCHAIN_PROPOSAL',
}

const getStepLabels = (t: TFunction): StepperLabels<GaslessProposalStepId> => ({
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
});

const queryStatusToStepStatus: Record<UseMutationResult['status'], StepStatus> =
  {
    error: StepStatus.ERROR,
    idle: StepStatus.WAITING,
    pending: StepStatus.LOADING,
    success: StepStatus.SUCCESS,
  };

const hookResultsToSteps = (
  result: IUseCreateVocdoniProposalTransationResult,
  sendTxResult: IUseSendTransactionResult
): StepsMap<GaslessProposalStepId> => {
  const {createAccountStatus, createElectionStatus} = result;

  const {isSuccess, isSendTransactionLoading, isWaitTransactionLoading} =
    sendTxResult;

  return {
    REGISTER_VOCDONI_ACCOUNT: {
      status: queryStatusToStepStatus[createAccountStatus],
    },
    CREATE_VOCDONI_ELECTION: {
      status: queryStatusToStepStatus[createElectionStatus],
    },
    CREATE_ONCHAIN_PROPOSAL: {
      status:
        isSendTransactionLoading || isWaitTransactionLoading
          ? StepStatus.LOADING
          : isSuccess
          ? StepStatus.SUCCESS
          : StepStatus.WAITING,
    },
  };
};

export const CreateProposalDialogGaslessSteps: React.FC<
  ICreateProposalDialogGaslessStepsProps
> = props => {
  const {createTransactionResult, sendTransactionResults} = props;
  const {createAccountStatus, createElectionStatus, retry} =
    createTransactionResult;

  const {t} = useTranslation();

  const steps = hookResultsToSteps(
    createTransactionResult,
    sendTransactionResults
  );
  const stepLabels = getStepLabels(t);

  const isError =
    createAccountStatus === 'error' || createElectionStatus === 'error';

  return (
    <>
      <StepperModalProgress
        steps={steps}
        labels={stepLabels}
        className="self-stretch"
      />
      {isError && (
        <Button onClick={retry} className="self-stretch">
          {t('transactionDialog.button.retry')}
        </Button>
      )}
    </>
  );
};
