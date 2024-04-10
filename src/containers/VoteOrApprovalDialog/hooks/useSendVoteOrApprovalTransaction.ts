import {useSendTransaction} from 'hooks/useSendTransaction';
import {ITransaction} from 'services/transactions/domain/transaction';
import {TransactionReceipt} from 'viem';

import {CreateDaoFormData} from 'utils/types';
import {useFormContext} from 'react-hook-form';
import {useNetwork} from 'context/network';
import {PluginTypes} from 'hooks/usePluginClient';
import {useProposalTransactionContext} from 'context/proposalTransaction';

export type ApproveMultisigProposalParams = {
  proposalId: string;
  tryExecution: boolean;
};

export interface IUseSendVoteOrApprovalTransaction {
  /**
   * Process name for logging.
   */
  process: string;
  /**
   * CreateDao transaction to be sent.
   */
  transaction?: ITransaction;
  /**
   * IPFS id of the DAO metadata.
   */
  PluginType?: PluginTypes;
}

export const useSendVoteOrApprovalTransaction = (
  params: IUseSendVoteOrApprovalTransaction
) => {
  const {process, transaction, PluginType} = params;

  const {network} = useNetwork();

  const {getValues} = useFormContext<CreateDaoFormData>();
  const formValues = getValues();
  const {onApprovalSuccess, approvalParams, voteParams} =
    useProposalTransactionContext();

  const handleVoteOrApprovalSuccess = (txReceipt: TransactionReceipt) => {
    switch (PluginType) {
      case 'token-voting.plugin.dao.eth': {
        onApprovalSuccess(
          approvalParams.proposalId,
          approvalParams.tryExecution,
          txReceipt.transactionHash
        );
        break;
      }
      case 'multisig.plugin.dao.eth': {
        onApprovalSuccess(
          VoteOrApprovalParams.proposalId,
          VoteOrApprovalParams.tryExecution,
          txReceipt.transactionHash
        );
        break;
      }
      default: {
        break;
      }
    }

    const {daoAddress, pluginAddresses} =
      createDaoUtils.getDaoAddressesFromReceipt(txReceipt)!;
    const metadata = createDaoUtils.formValuesToDaoMetadata(
      formValues,
      metadataCid
    );

    const {ensSubdomain = '', plugins = []} = createDaoParams!;

    if (votingType === 'gasless' && membership === 'token') {
      createToken(
        pluginAddresses[0],
        !isCustomToken ? tokenAddress?.address : undefined
      );
    }
  };

  const sendTransactionResults = useSendTransaction({
    logContext: {stack: [process], data: formValues},
    transaction,
    onSuccess: handleVoteOrApprovalSuccess,
  });

  return sendTransactionResults;
};
