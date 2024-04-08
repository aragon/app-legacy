import {useClient} from 'hooks/useClient';
import {IBuildCreateGaslessProposalTransactionParams} from 'services/transactions/transactionsService.api';
import {GaslessPluginName, PluginTypes} from 'hooks/usePluginClient';
import {useCreateGaslessProposalTransaction} from 'services/transactions/queries/useCreateGaslessProposalTransaction';
import {useCreateAccount} from 'services/vocdoni-census3/mutations/use-create-account';
import {useCallback, useEffect} from 'react';
import {useClient as useVocdoniClient} from '@vocdoni/react-providers';
import {useCreateVocdoniElection} from 'services/vocdoni-census3/mutations/use-create-vocdoni-election';
import {useCensus3Client, useCensus3CreateToken} from 'hooks/useCensus3';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from 'context/network';
import {useDaoToken} from 'hooks/useDaoToken';
import {
  CreateProposalFormData,
  GaslessProposalCreationParams,
} from 'utils/types';
import {useFormContext} from 'react-hook-form';
import {createProposalUtils} from '../utils';
import {ITransaction} from 'services/transactions/domain/transaction';
import {ILoggerErrorContext, logger} from 'services/logger';

export interface IUseCreateVocdoniProposalTransactionParams {
  /**
   * Parameters to create a proposal transaction.
   */
  createProposalParams?: GaslessProposalCreationParams;
  /**
   * Governance plugin type.
   */
  pluginType?: PluginTypes;
  /**
   * Address of the governance plugin.
   */
  pluginAddress?: string;
  /**
   * Initialize the transaction creation when set to true.
   */
  initializeProcess?: boolean;
  /**
   * Log context used to log eventual errors.
   */
  logContext?: Omit<ILoggerErrorContext, 'step'>;
}

export interface IUseCreateVocdoniProposalTransationResult {
  transaction?: ITransaction;
  isCreateAccountLoading?: boolean;
  isCreateAccountSuccess?: boolean;
  isCreateAccountError?: boolean;
  isCreateElectionLoading?: boolean;
  isCreateElectionSuccess?: boolean;
  isCreateElectionError?: boolean;
  isCreateTransactionLoading?: boolean;
  retry: () => void;
}

enum CreateVocdoniProposalStep {
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  CREATE_OFFCHAIN_ELECTION = 'CREATE_OFFCHAIN_ELECTION',
  CREATE_ONCHAIN_TRANSACTION = 'CREATE_ONCHAIN_TRANSACTION',
}

export const useCreateVocdoniProposalTransaction = (
  params: IUseCreateVocdoniProposalTransactionParams
): IUseCreateVocdoniProposalTransationResult => {
  const {
    createProposalParams,
    initializeProcess,
    pluginType,
    pluginAddress,
    logContext,
  } = params;

  const {client} = useClient();
  const {network} = useNetwork();
  const {client: vocdoniClient} = useVocdoniClient();
  const census3 = useCensus3Client();

  const {getValues} = useFormContext();
  const formValues = getValues() as CreateProposalFormData;

  const {data: daoToken} = useDaoToken(pluginAddress);

  const chainId = CHAIN_METADATA[network].id;
  const {createToken} = useCensus3CreateToken({chainId, pluginType});

  const isGasless = pluginType === GaslessPluginName;

  const handleCreateProposalError = useCallback(
    (step: CreateVocdoniProposalStep) => (error: unknown) => {
      if (logContext) {
        const {stack, data} = logContext;
        logger.error(error, {stack, step, data});
      }
    },
    [logContext]
  );

  const {
    data: electionResult,
    mutate: createVocdoniElection,
    isLoading: isCreateElectionLoading,
    isSuccess: isCreateElectionSuccess,
    isError: isCreateElectionError,
  } = useCreateVocdoniElection({
    onError: handleCreateProposalError(
      CreateVocdoniProposalStep.CREATE_OFFCHAIN_ELECTION
    ),
  });

  const handleCreateAccountSuccess = useCallback(() => {
    if (
      pluginAddress == null ||
      daoToken == null ||
      createProposalParams == null
    ) {
      return;
    }

    const metadata =
      createProposalUtils.formValuesToProposalMetadata(formValues);

    createVocdoniElection({
      census3,
      createToken,
      pluginAddress,
      chainId,
      vocdoniClient,
      data: createProposalParams,
      metadata,
      tokenAddress: daoToken?.address,
    });
  }, [
    census3,
    chainId,
    createProposalParams,
    createToken,
    createVocdoniElection,
    daoToken,
    formValues,
    pluginAddress,
    vocdoniClient,
  ]);

  const {
    mutate: createAccount,
    isLoading: isCreateAccountLoading,
    isError: isCreateAccountError,
    isSuccess: isCreateAccountSuccess,
    reset: resetCreateAccount,
  } = useCreateAccount({
    onSuccess: () => handleCreateAccountSuccess(),
    onError: handleCreateProposalError(
      CreateVocdoniProposalStep.CREATE_ACCOUNT
    ),
  });

  const {
    data: transaction,
    isInitialLoading: isCreateTransactionLoading,
    error: createTransactionError,
  } = useCreateGaslessProposalTransaction(
    {
      ...createProposalParams,
      tokenCensus: electionResult?.tokenCensus,
      electionId: electionResult?.electionId,
      client,
    } as IBuildCreateGaslessProposalTransactionParams,
    {
      enabled:
        isGasless &&
        createProposalParams != null &&
        client != null &&
        electionResult != null,
    }
  );

  useEffect(() => {
    if (createTransactionError != null) {
      handleCreateProposalError(
        CreateVocdoniProposalStep.CREATE_ONCHAIN_TRANSACTION
      )(createTransactionError);
    }
  }, [createTransactionError, handleCreateProposalError]);

  useEffect(() => {
    if (
      initializeProcess &&
      isGasless &&
      !isCreateAccountLoading &&
      !isCreateAccountError &&
      !isCreateAccountSuccess
    ) {
      createAccount({vocdoniClient});
    }
  }, [
    isGasless,
    initializeProcess,
    vocdoniClient,
    createAccount,
    isCreateAccountError,
    isCreateAccountLoading,
    isCreateAccountSuccess,
  ]);

  const retry = useCallback(() => {
    if (isCreateAccountError) {
      resetCreateAccount();
      createAccount({vocdoniClient});
    } else if (isCreateElectionError) {
      handleCreateAccountSuccess();
    }
  }, [
    resetCreateAccount,
    isCreateAccountError,
    isCreateElectionError,
    createAccount,
    vocdoniClient,
    handleCreateAccountSuccess,
  ]);

  return {
    transaction,
    isCreateAccountLoading,
    isCreateAccountSuccess,
    isCreateAccountError,
    isCreateElectionLoading,
    isCreateElectionSuccess,
    isCreateElectionError,
    isCreateTransactionLoading,
    retry,
  };
};
