import {StorageUtils} from './abstractStorage';
import {SupportedChainID} from 'utils/constants';

/**
 * Type definition for execution details.
 * Includes block number, execution date, and transaction hash.
 */
export type ExecutionDetail = {
  executionBlockNumber: number;
  executionDate: Date;
  executionTxHash: string;
};

/**
 * Type alias for chain data, mapping proposal IDs to their execution details.
 */
type ChainDataMap = {
  [proposalId: string]: ExecutionDetail;
};

/**
 * ExecutionStorage class provides methods for managing execution statuses
 * in local storage. The data is structured by chainId and then by proposalId.
 */
export class ExecutionStorage extends StorageUtils {
  constructor(prefix = 'executions_') {
    super(prefix);
  }

  /**
   * Store the execution status for a specific proposal.
   *
   * @param chainId - The chain ID related to the execution.
   * @param proposalId - The proposal ID whose execution status is being stored.
   * @param executionDetail - The execution detail to be stored.
   */
  addExecutionDetail(
    chainId: SupportedChainID,
    proposalId: string,
    executionDetail: ExecutionDetail
  ): void {
    const key = chainId.toString();
    const chainData: ChainDataMap = this.getItem(key) || {};

    chainData[proposalId] = executionDetail;
    this.setItem(key, chainData);
  }

  /**
   * Retrieve the execution status for a specific proposal.
   *
   * @param chainId - The chain ID related to the execution.
   * @param proposalId - The proposal ID whose execution status is being fetched.
   * @returns The execution detail or null if not found.
   */
  getExecutionDetail(
    chainId: SupportedChainID,
    proposalId: string
  ): ExecutionDetail | null {
    const key = chainId.toString();
    const chainData: ChainDataMap = this.getItem(key) || {};
    return chainData[proposalId] || null;
  }

  /**
   * Delete the execution status for a specific proposal.
   *
   * @param chainId - The chain ID related to the execution.
   * @param proposalId - The proposal ID whose execution status is being deleted.
   */
  removeExecutionDetail(chainId: SupportedChainID, proposalId: string): void {
    const key = chainId.toString();
    const chainData: ChainDataMap = this.getItem(key) || {};

    if (chainData[proposalId]) {
      delete chainData[proposalId];

      // Directly remove the key from local storage if no data is left
      if (Object.keys(chainData).length === 0) {
        this.removeItem(key);
      } else {
        this.setItem(key, chainData);
      }
    }
  }
}
