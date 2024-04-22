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
import {useQueryClient} from '@tanstack/react-query';
import {
  AragonSdkQueryItem,
  aragonSdkQueryKeys,
} from 'services/aragon-sdk/query-keys';

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
  pluginType?: PluginTypes;
  /**
   * VoteParams
   */
  votingPower?: BigNumber;
  replacingVote?: boolean;
  vote?: VoteValues;
  setVoteOrApprovalSubmitted: (value: boolean) => void;
}

export const useSendVoteOrApprovalTransaction = (
  params: IUseSendVoteOrApprovalTransaction
) => {
  const {
    process,
    transaction,
    pluginType,
    votingPower,
    replacingVote,
    vote,
    setVoteOrApprovalSubmitted,
  } = params;
  const {network} = useNetwork();
  const {address} = useWallet();
  const queryClient = useQueryClient();

  const {id: urlId} = useParams();
  const proposalId = new ProposalId(urlId!).export();

  const handleVoteOrApprovalSuccess = () => {
    setVoteOrApprovalSubmitted(true);

    switch (pluginType) {
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
      case 'vocdoni-gasless-voting-poc-vanilla-erc20.plugin.dao.eth': {
        break;
      }
      default: {
        break;
      }
    }

    const allProposalsQuery = [AragonSdkQueryItem.PROPOSALS];
    const currentProposal = aragonSdkQueryKeys.proposal({
      id: proposalId,
      pluginType,
    });

    queryClient.invalidateQueries({
      queryKey: allProposalsQuery,
    });
    queryClient.invalidateQueries({
      queryKey: currentProposal,
    });
  };

  const sendTransactionResults = useSendTransaction({
    logContext: {stack: [process]},
    transaction,
    onSuccess: handleVoteOrApprovalSuccess,
  });

  return sendTransactionResults;
};
