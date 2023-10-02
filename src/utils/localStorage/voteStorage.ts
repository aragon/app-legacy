import {TokenVotingProposalVote} from '@aragon/sdk-client';

import {SupportedChainID} from 'utils/constants';
import {StorageUtils} from './abstractStorage';

/**
 * Type definition for cached vote data in local storage.
 * Each proposal ID is mapped to its corresponding votes.
 */
type VoteCache = {
  [proposalId: string]: {votes: Array<TokenVotingProposalVote | string>};
};

/**
 * VoteStorage class provides methods for storing, retrieving, and
 * deleting votes in local storage. The data is structured by chainId
 * and then by proposalId.
 */
export class VoteStorage extends StorageUtils {
  constructor(prefix = 'vote_') {
    super(prefix);
  }

  /**
   * Add a new vote to the local storage.
   *
   * @param chainId - The chain ID for which the vote is associated.
   * @param proposalId - The proposal ID for which the vote is cast.
   * @param voteOrApproval - The vote data to be stored.
   */
  addVote(
    chainId: SupportedChainID,
    proposalId: string,
    voteOrApproval: TokenVotingProposalVote | string
  ): void {
    const key = chainId.toString();
    const chainData: VoteCache = this.getItem(key) || {};

    // Initialize the votes array for the proposal if not present
    if (!chainData[proposalId]) {
      chainData[proposalId] = {votes: []};
    }

    chainData[proposalId].votes.push(voteOrApproval);
    this.setItem(key, chainData);
  }

  /**
   * Retrieve votes for a specific proposal.
   *
   * @param chainId - The chain ID associated with the votes.
   * @param proposalId - The proposal ID whose votes need to be fetched.
   * @returns Array of votes for the given proposal.
   */
  getVotes<T extends string | TokenVotingProposalVote>(
    chainId: SupportedChainID,
    proposalId: string
  ): Array<T> {
    const key = chainId.toString();
    const chainData: VoteCache = this.getItem(key) || {};

    return (chainData[proposalId]?.votes ?? []) as Array<T>;
  }

  /**
   * Remove a singular vote associated with a specific user wallet for a proposal.
   *
   * @param chainId - The chain ID associated with the vote.
   * @param proposalId - The proposal ID whose vote needs to be removed.
   * @param userWallet - The user wallet whose vote needs to be removed.
   */
  removeVoteForProposal(
    chainId: SupportedChainID,
    proposalId: string,
    userWallet: string
  ): void {
    const key = chainId.toString();
    const chainData: VoteCache = this.getItem(key) || {};

    if (chainData[proposalId]) {
      // Filter out the vote associated with the user wallet
      chainData[proposalId].votes = chainData[proposalId].votes.filter(vote =>
        typeof vote === 'string'
          ? vote !== userWallet
          : vote.address !== userWallet
      );

      // If there are no votes left for the proposal, remove the proposal key entirely
      if (!chainData[proposalId].votes.length) {
        delete chainData[proposalId];
      }

      // Only write back to local storage if there's data remaining
      if (Object.keys(chainData).length) {
        this.setItem(key, chainData);
      } else {
        this.removeItem(key);
      }
    }
  }
}
