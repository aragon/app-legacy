import {Client} from '@aragon/sdk-client';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import {useParams} from 'react-router-dom';
import {useCreateExecuteMultisigProposalTransaction} from 'services/transactions/queries/useCreateExecuteMultisigProposalTransaction';
import {useCreateExecuteTokenVotingProposalTransaction} from 'services/transactions/queries/useCreateExecuteTokenVotingProposalTransaction';

export const useCreateExecuteTransactionProposal = () => {
  const {id: proposalId} = useParams();

  const {client} = useClient();

  const {data: daoDetails} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins[0].id as PluginTypes;

  const {data: multisigTransaction, isLoading: isMultisigTransactionLoading} =
    useCreateExecuteMultisigProposalTransaction(
      {
        client: client as Client,
        proposalId: proposalId as string,
      },
      {
        enabled:
          client != null &&
          proposalId != null &&
          pluginType === 'multisig.plugin.dao.eth',
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
      enabled:
        client != null &&
        proposalId != null &&
        pluginType === 'token-voting.plugin.dao.eth',
    }
  );

  return {
    transaction: multisigTransaction ?? tokenVotingTransaction,
    isLoading: isMultisigTransactionLoading || isTokenVotingTransactionLoading,
  };
};
