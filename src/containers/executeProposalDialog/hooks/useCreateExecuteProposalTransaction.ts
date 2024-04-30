import {Client} from '@aragon/sdk-client';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {GaslessPluginName, PluginTypes} from 'hooks/usePluginClient';
import {useParams} from 'react-router-dom';
import {useCreateExecuteGaslessProposalTransaction} from 'services/transactions/queries/useCreateExecuteGaslessProposalTransaction';
import {useCreateExecuteMultisigProposalTransaction} from 'services/transactions/queries/useCreateExecuteMultisigProposalTransaction';
import {useCreateExecuteTokenVotingProposalTransaction} from 'services/transactions/queries/useCreateExecuteTokenVotingProposalTransaction';

export interface IUseCreateExecuteTransactionProposalParams {
  /**
   * Disables the create transaction hook when set to false.
   */
  enabled?: boolean;
}

export const useCreateExecuteTransactionProposal = (
  params: IUseCreateExecuteTransactionProposalParams
) => {
  const {enabled} = params;
  const {id: proposalId} = useParams();

  const {client} = useClient();

  const {data: daoDetails} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins[0].id as PluginTypes;

  const enableHook = enabled !== false && client != null && proposalId != null;

  const {data: multisigTransaction, isLoading: isMultisigTransactionLoading} =
    useCreateExecuteMultisigProposalTransaction(
      {
        client: client as Client,
        proposalId: proposalId as string,
      },
      {
        enabled: enableHook && pluginType === 'multisig.plugin.dao.eth',
      }
    );

  const {
    data: tokenVotingTransaction,
    isLoading: isTokenVotingTransactionLoading,
  } = useCreateExecuteTokenVotingProposalTransaction(
    {
      client: client as Client,
      proposalId: proposalId as string,
    },
    {
      enabled: enableHook && pluginType === 'token-voting.plugin.dao.eth',
    }
  );

  const {data: gaslessTransaction, isLoading: isGaslessTransactionLoading} =
    useCreateExecuteGaslessProposalTransaction(
      {
        client: client as Client,
        proposalId: proposalId as string,
      },
      {
        enabled: enableHook && pluginType === GaslessPluginName,
      }
    );

  return {
    transaction:
      multisigTransaction ?? tokenVotingTransaction ?? gaslessTransaction,
    isLoading:
      isMultisigTransactionLoading ||
      isTokenVotingTransactionLoading ||
      isGaslessTransactionLoading,
  };
};
