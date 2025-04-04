import {useQueryClient} from '@tanstack/react-query';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useIsUpdateProposal} from 'hooks/useIsUpdateProposal';
import {PluginTypes} from 'hooks/usePluginClient';
import {useSendTransaction} from 'hooks/useSendTransaction';
import {useParams} from 'react-router-dom';
import {
  AragonSdkQueryItem,
  aragonSdkQueryKeys,
} from 'services/aragon-sdk/query-keys';
import {ITransaction} from 'services/transactions/domain/transaction';
import {CHAIN_METADATA} from 'utils/constants';
import {toDisplayEns} from 'utils/library';
import {executionStorage} from 'utils/localStorage';
import {TransactionReceipt} from 'viem';

export interface IUseSendExecuteProposalTransactionParams {
  /**
   * Process name for logging.
   */
  process: string;
  /**
   * CreateDao transaction to be sent.
   */
  transaction?: ITransaction;
}

export const useSendExecuteProposalTransaction = (
  params: IUseSendExecuteProposalTransactionParams
) => {
  const {transaction} = params;

  const {network} = useNetwork();
  const {api: provider} = useProviders();
  const queryClient = useQueryClient();
  const {id: proposalId} = useParams();

  const {data: daoDetails} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins[0].id as PluginTypes;
  const daoAddressOrEns =
    toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address;

  const [{data: isPluginUpdate}, {data: isProtocolUpdate}] =
    useIsUpdateProposal(proposalId ?? '');

  const handleExecuteProposalSuccess = async (
    txReceipt: TransactionReceipt
  ) => {
    // get current block number
    const executionBlockNumber = await provider.getBlockNumber();

    // details to be cached
    const executionDetails = {
      executionBlockNumber,
      executionDate: new Date(),
      executionTxHash: txReceipt.blockHash,
    };

    // add execution detail to local storage
    executionStorage.addExecutionDetail(
      CHAIN_METADATA[network].id,
      proposalId!.toString(),
      executionDetails
    );

    if (isPluginUpdate) {
      queryClient.invalidateQueries({
        queryKey: ['daoDetails', daoAddressOrEns, network],
      });
    }

    if (isProtocolUpdate && daoDetails) {
      queryClient.invalidateQueries({
        queryKey: aragonSdkQueryKeys.protocolVersion(daoDetails?.address),
      });
    }

    const allProposalsQuery = [AragonSdkQueryItem.PROPOSALS];
    const currentProposal = aragonSdkQueryKeys.proposal({
      id: proposalId!,
      pluginType,
    });

    queryClient.invalidateQueries({queryKey: allProposalsQuery});
    queryClient.invalidateQueries({queryKey: currentProposal});
  };

  const sendTransactionResults = useSendTransaction({
    transaction,
    onSuccess: handleExecuteProposalSuccess,
  });

  return sendTransactionResults;
};
