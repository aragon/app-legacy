import {
  MultisigProposal,
  MultisigProposalListItem,
  TokenVotingProposal,
  TokenVotingProposalListItem,
} from '@aragon/sdk-client';

import {SupportedChainID} from 'utils/constants';
import {StorageUtils} from './abstractStorage';

type StoredProposal = Omit<
  MultisigProposal | TokenVotingProposal,
  'executionBlockNumber' | 'executionDate' | 'executionTxHash'
>;

type ProposalCache = {
  [proposalId: string]: StoredProposal;
};

/**
 * ProposalStorage class provides methods for storing, retrieving, and
 * deleting proposals in local storage. The data is structured by chainId
 * and then by proposalId.
 */
export class ProposalStorage extends StorageUtils {
  constructor() {
    super('proposals_');
  }

  /**
   * Adds a proposal to localStorage.
   * @param chainId - The ID of the blockchain network.
   * @param proposal - The proposal object to be stored.
   */
  addProposal<T extends StoredProposal>(
    chainId: SupportedChainID,
    proposal: T
  ): void {
    if (!proposal.id) {
      console.error('Proposal must have an ID.');
      return;
    }
    const key = chainId.toString();
    const proposals: ProposalCache = this.getItem(key) || {};

    proposals[proposal.id] = proposal;
    this.setItem(key, proposals);
  }

  /**
   * Retrieves a proposal from localStorage by its chainId and proposalId.
   * @param chainId - The ID of the blockchain network.
   * @param proposalId - The ID of the proposal to be retrieved.
   * @returns - The retrieved proposal, or null if not found.
   */
  getProposal<T extends MultisigProposal | TokenVotingProposal>(
    chainId: SupportedChainID,
    proposalId: string
  ): T | null {
    const key = chainId.toString();
    const proposals: ProposalCache = this.getItem(key) || {};

    return (proposals[proposalId] as T) ?? null;
  }

  /**
   * Retrieves all stored proposals associated with a given plugin address from localStorage.
   * @param chainId - The ID of the blockchain network.
   * @param pluginAddress - The plugin address that is part of the proposal ID.
   * @returns - An array of retrieved proposals associated with the given plugin address
   */
  getProposalsByPluginAddress<
    T extends MultisigProposalListItem | TokenVotingProposalListItem,
  >(chainId: SupportedChainID, pluginAddress: string): T[] {
    const key = chainId.toString();
    const proposals: ProposalCache = this.getItem(key) || {};
    const matchingProposals = Object.values(proposals).filter(proposal =>
      proposal.id.startsWith(pluginAddress)
    );

    return matchingProposals as unknown as T[];
  }

  /**
   * Removes a proposal from localStorage by its chainId and proposalId.
   * @param chainId - The ID of the blockchain network.
   * @param proposalId - The ID of the proposal to be removed.
   */
  removeProposal(chainId: SupportedChainID, proposalId: string): void {
    const key = chainId.toString();
    const proposals: ProposalCache = this.getItem(key) || {};

    if (proposals[proposalId]) {
      delete proposals[proposalId];

      // Directly remove the key from local storage if no data is left
      if (Object.keys(proposals).length === 0) {
        this.removeItem(key);
      } else {
        this.setItem(key, proposals);
      }
    }

    this.removeItem(key);
  }
}

export const proposalStorage = new ProposalStorage();
