import {useQueryClient} from '@tanstack/react-query';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useIsUpdateProposal} from 'hooks/useIsUpdateProposal';
import {useSendTransaction} from 'hooks/useSendTransaction';
import {useParams} from 'react-router-dom';
import {aragonSdkQueryKeys} from 'services/aragon-sdk/query-keys';
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
  const {process, transaction} = params;

  const {network} = useNetwork();
  const {api: provider} = useProviders();
  const queryClient = useQueryClient();
  const {id: proposalId} = useParams();

  const {data: daoDetails} = useDaoDetailsQuery();
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
      queryClient.invalidateQueries(['daoDetails', daoAddressOrEns, network]);
    }

    if (isProtocolUpdate && daoDetails) {
      queryClient.invalidateQueries(
        aragonSdkQueryKeys.protocolVersion(daoDetails?.address)
      );
    }
  };

  const sendTransactionResults = useSendTransaction({
    logContext: {stack: [process], data: {proposalId}},
    transaction,
    onSuccess: handleExecuteProposalSuccess,
  });

  return sendTransactionResults;
};
