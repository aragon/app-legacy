import React from 'react';
import {IUseCreateVocdoniProposalTransationResult} from './hooks/useCreateVocdoniProposalTransaction';
import {StepperLabels, StepperModalProgress} from 'components/stepperProgress';
import {StepStatus, StepsMap} from 'hooks/useFunctionStepper';
import {TFunction} from 'i18next';
import {useTranslation} from 'react-i18next';
import {Button} from '@aragon/ods';

export interface ICreateProposalDialogGaslessStepsProps {
  /**
   * Name of the process to log eventual errors.
   */
  process: string;
  /**
   * Displays the custom step button as loading when set to true.
   */
  createTransactionResult: IUseCreateVocdoniProposalTransationResult;
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

const hookResultsToSteps = (
  result: IUseCreateVocdoniProposalTransationResult
): StepsMap<GaslessProposalStepId> => {
  const {LOADING, SUCCESS, WAITING, ERROR} = StepStatus;
  const {
    isCreateAccountLoading,
    isCreateAccountSuccess,
    isCreateAccountError,
    isCreateElectionLoading,
    isCreateElectionSuccess,
    isCreateElectionError,
    isCreateTransactionLoading,
    transaction,
  } = result;

  return {
    REGISTER_VOCDONI_ACCOUNT: {
      status: isCreateAccountLoading
        ? LOADING
        : isCreateAccountSuccess
        ? SUCCESS
        : isCreateAccountError
        ? ERROR
        : WAITING,
    },
    CREATE_VOCDONI_ELECTION: {
      status: isCreateElectionLoading
        ? LOADING
        : isCreateElectionSuccess
        ? SUCCESS
        : isCreateElectionError
        ? ERROR
        : WAITING,
    },
    CREATE_ONCHAIN_PROPOSAL: {
      status: isCreateTransactionLoading
        ? LOADING
        : transaction != null
        ? SUCCESS
        : WAITING,
    },
  };
};

export const CreateProposalDialogGaslessSteps: React.FC<
  ICreateProposalDialogGaslessStepsProps
> = props => {
  const {createTransactionResult} = props;
  const {isCreateAccountError, isCreateElectionError, retry} =
    createTransactionResult;

  const {t} = useTranslation();

  const steps = hookResultsToSteps(createTransactionResult);
  const stepLabels = getStepLabels(t);

  const isError = isCreateAccountError || isCreateElectionError;

  return (
    <>
      <StepperModalProgress steps={steps} labels={stepLabels} />
      {isError && (
        <Button onClick={retry} className="self-stretch">
          {t('transactionDialog.button.retry')}
        </Button>
      )}
    </>
  );
};
