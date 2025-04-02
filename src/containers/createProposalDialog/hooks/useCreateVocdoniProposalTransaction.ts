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
import {UseMutationResult} from '@tanstack/react-query';

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
}

export interface IUseCreateVocdoniProposalTransationResult {
  transaction?: ITransaction;
  createAccountStatus: UseMutationResult['status'];
  createElectionStatus: UseMutationResult['status'];
  isCreateTransactionLoading: boolean;
  retry: () => void;
}

export const useCreateVocdoniProposalTransaction = (
  params: IUseCreateVocdoniProposalTransactionParams
): IUseCreateVocdoniProposalTransationResult => {
  const {createProposalParams, initializeProcess, pluginType, pluginAddress} =
    params;

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

  const {
    data: electionResult,
    mutate: createVocdoniElection,
    status: createElectionStatus,
  } = useCreateVocdoniElection();

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
    reset: resetCreateAccount,
    status: createAccountStatus,
  } = useCreateAccount({
    onSuccess: () => handleCreateAccountSuccess(),
  });

  const {data: transaction, isInitialLoading: isCreateTransactionLoading} =
    useCreateGaslessProposalTransaction(
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
    if (initializeProcess && isGasless && createAccountStatus === 'idle') {
      createAccount({vocdoniClient});
    }
  }, [
    isGasless,
    initializeProcess,
    vocdoniClient,
    createAccount,
    createAccountStatus,
  ]);

  const retry = useCallback(() => {
    if (createAccountStatus === 'error') {
      resetCreateAccount();
      createAccount({vocdoniClient});
    } else if (createElectionStatus === 'error') {
      handleCreateAccountSuccess();
    }
  }, [
    resetCreateAccount,
    createAccountStatus,
    createElectionStatus,
    createAccount,
    vocdoniClient,
    handleCreateAccountSuccess,
  ]);

  return {
    transaction,
    createAccountStatus,
    createElectionStatus,
    isCreateTransactionLoading,
    retry,
  };
};
