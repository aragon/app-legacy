import {useClient} from 'hooks/useClient';
import {useCreateMultisigProposalTransaction} from 'services/transactions/queries/useCreateMultisigProposalTransaction';
import {
  IBuildCreateMultisigProposalTransactionParams,
  IBuildCreateTokenVotingProposalTransactionParams,
} from 'services/transactions/transactionsService.api';
import {ICreateProposalParams} from '../utils/createProposalUtils';
import {PluginTypes} from 'hooks/usePluginClient';
import {useCreateTokenVotingProposalTransaction} from 'services/transactions/queries/useCreateTokenVotingProposalTransaction';
import {GaslessProposalCreationParams} from 'utils/types';

export interface IUseCreateProposalTransactionParams {
  /**
   * Parameters to create a proposal transaction.
   */
  createProposalParams?: ICreateProposalParams | GaslessProposalCreationParams;
  /**
   * Governance plugin type.
   */
  pluginType?: PluginTypes;
}

export const useCreateProposalTransaction = (
  params: IUseCreateProposalTransactionParams
) => {
  const {createProposalParams, pluginType} = params;

  const {client} = useClient();

  const isMultisig = pluginType === 'multisig.plugin.dao.eth';
  const isTokenVoting = pluginType === 'token-voting.plugin.dao.eth';

  const {
    data: multisigTransaction,
    isInitialLoading: isMultisigTransactionLoading,
  } = useCreateMultisigProposalTransaction(
    {
      ...createProposalParams,
      client,
    } as IBuildCreateMultisigProposalTransactionParams,
    {
      enabled: isMultisig && createProposalParams != null && client != null,
    }
  );

  const {
    data: tokenVotingTransaction,
    isInitialLoading: isTokenVotingTransactionLoading,
  } = useCreateTokenVotingProposalTransaction(
    {
      ...createProposalParams,
      client,
    } as IBuildCreateTokenVotingProposalTransactionParams,
    {
      enabled: isTokenVoting && createProposalParams != null && client != null,
    }
  );

  return {
    transaction: multisigTransaction ?? tokenVotingTransaction,
    isLoading: isMultisigTransactionLoading || isTokenVotingTransactionLoading,
  };
};
