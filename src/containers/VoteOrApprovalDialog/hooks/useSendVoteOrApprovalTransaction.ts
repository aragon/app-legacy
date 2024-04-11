import {useSendTransaction} from 'hooks/useSendTransaction';
import {ITransaction} from 'services/transactions/domain/transaction';

import {ProposalId} from 'utils/types';
import {useNetwork} from 'context/network';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {voteStorage} from 'utils/localStorage';
import {CHAIN_METADATA} from 'utils/constants';
import {useParams} from 'react-router-dom';
import {BigNumber} from 'ethers';
import {VoteValues} from '@aragon/sdk-client';

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
   * Vote transaction to be sent.
   */
  transaction?: ITransaction;
  /**
   * The type of plugin installed.
   */
  PluginType?: PluginTypes;
  /**
   * VoteParams
   */
  votingPower?: BigNumber;
  replacingVote?: boolean;
  vote?: VoteValues;
}

export const useSendVoteOrApprovalTransaction = (
  params: IUseSendVoteOrApprovalTransaction
) => {
  const {process, transaction, PluginType, votingPower, replacingVote, vote} =
    params;
  const {network} = useNetwork();
  const {address} = useWallet();

  const {id: urlId} = useParams();
  const proposalId = new ProposalId(urlId!).export();

  const handleVoteOrApprovalSuccess = () => {
    switch (PluginType) {
      case 'token-voting.plugin.dao.eth': {
        // cache token-voting vote
        if (address != null && votingPower && vote) {
          // fetch token user balance, ie vote weight
          try {
            const voteToPersist = {
              address: address.toLowerCase(),
              vote: vote,
              weight: votingPower.toBigInt(),
              voteReplaced: !!replacingVote,
            };

            // store in local storage
            voteStorage.addVote(
              CHAIN_METADATA[network].id,
              proposalId.toString(),
              voteToPersist
            );
          } catch (error) {
            console.error(error);
          }
        }
        break;
      }
      case 'multisig.plugin.dao.eth': {
        if (address) {
          voteStorage.addVote(
            CHAIN_METADATA[network].id,
            proposalId,
            address.toLowerCase()
          );
        }
        break;
      }
      default: {
        break;
      }
    }
  };

  const sendTransactionResults = useSendTransaction({
    logContext: {stack: [process]},
    transaction,
    onSuccess: handleVoteOrApprovalSuccess,
  });

  return sendTransactionResults;
};
