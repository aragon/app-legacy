import {useSendTransaction} from 'hooks/useSendTransaction';
import {ITransaction} from 'services/transactions/domain/transaction';
import {useNetwork} from 'context/network';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {voteStorage} from 'utils/localStorage';
import {CHAIN_METADATA} from 'utils/constants';
import {useParams} from 'react-router-dom';
import {constants} from 'ethers';
import {
  MultisigProposal,
  TokenVotingProposal,
  VoteValues,
} from '@aragon/sdk-client';
import {useQueryClient} from '@tanstack/react-query';
import {
  AragonSdkQueryItem,
  aragonSdkQueryKeys,
} from 'services/aragon-sdk/query-keys';
import {usePastVotingPower} from 'services/aragon-sdk/queries/use-past-voting-power';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';
import {ProposalStatus} from '@aragon/sdk-client-common';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';

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
   * Proposal to vote for.
   */
  proposal: MultisigProposal | TokenVotingProposal | GaslessVotingProposal;
  /**
   * Defines if the vote should be replaced.
   */
  replacingVote?: boolean;
  /**
   * Vote to be sent.
   */
  vote?: VoteValues;
  /**
   * Callback called on vote/approve submitted.
   */
  setVoteOrApprovalSubmitted: (value: boolean) => void;
}

export const useSendVoteOrApprovalTransaction = (
  params: IUseSendVoteOrApprovalTransaction
) => {
  const {
    process,
    transaction,
    replacingVote,
    vote,
    proposal,
    setVoteOrApprovalSubmitted,
  } = params;
  const {network} = useNetwork();
  const {address} = useWallet();
  const queryClient = useQueryClient();

  const {id: proposalId = ''} = useParams();

  const {data: daoDetails} = useDaoDetailsQuery();
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const {data: daoToken} = useDaoToken(pluginAddress);

  const shouldFetchPastVotingPower =
    address != null &&
    daoToken != null &&
    proposal != null &&
    proposal.status === ProposalStatus.ACTIVE;

  const {data: votingPower = constants.Zero} = usePastVotingPower(
    {
      address: address as string,
      tokenAddress: daoToken?.address as string,
      blockNumber: proposal?.creationBlockNumber as number,
      network,
    },
    {
      enabled: shouldFetchPastVotingPower,
    }
  );

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
