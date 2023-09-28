import {
  MultisigClient,
  MultisigProposal,
  TokenVotingClient,
  TokenVotingProposal,
  TokenVotingProposalVote,
} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';

import {useNetwork} from 'context/network';
import {usePluginClient} from 'hooks/usePluginClient';
import {CHAIN_METADATA, SupportedChainID} from 'utils/constants';
import {invariant} from 'utils/invariant';
import {ExecutionStorage, VoteStorage} from 'utils/localStorage';
import {
  isMultisigProposal,
  isTokenBasedProposal,
  recalculateStatus,
} from 'utils/proposals';
import {IFetchProposalParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';

async function fetchProposalAsync(
  params: IFetchProposalParams,
  client: TokenVotingClient | MultisigClient | undefined
): Promise<MultisigProposal | TokenVotingProposal | null> {
  invariant(!!client, 'fetchProposalAsync: client is not defined');

  const data = await client?.methods.getProposal(params.id);
  return data;
}

export const useProposal = (
  params: IFetchProposalParams,
  options: UseQueryOptions<MultisigProposal | TokenVotingProposal | null> = {}
) => {
  const client = usePluginClient(params.pluginType);
  const {network} = useNetwork();

  if (!client || !params.id || !params.pluginType) {
    options.enabled = false;
  }

  return useQuery({
    queryKey: aragonSdkQueryKeys.proposal(params),
    queryFn: () => fetchProposalAsync(params, client),
    select: data => transformData(CHAIN_METADATA[network].id, data),
    ...options,
  });
};

/**
 * Transforms the input data by adding cached votes and execution info, and recalculating its status.
 *
 * The function performs a series of enhancements on the proposal:
 * 1. Appends cached votes from local storage.
 * 2. Adds execution details from local storage.
 * 3. Recalculates the status of the proposal.
 *
 * If the input data is `null`, it is returned as-is.
 *
 * @template T - Type that extends either `MultisigProposal` or `TokenVotingProposal` or can be null.
 * @param chainId - The chain ID associated with the data.
 * @param data - The data to transform.
 * @returns The transformed data.
 */
function transformData<T extends MultisigProposal | TokenVotingProposal | null>(
  chainId: SupportedChainID,
  data: T
): T {
  if (!data) return data;

  const proposal = {...data};

  syncApprovalsOrVotes(chainId, proposal);
  syncExecutionInfo(chainId, proposal);

  return {...recalculateStatus(proposal)} as T;
}

/**
 * Update the proposal with its execution details or remove execution details if they exist.
 *
 * If the proposal has an executionTxHash, it means the execution detail has been handled and
 * should be removed from the execution storage. Otherwise, the execution detail is fetched
 * from the storage and merged into the proposal.
 *
 * @param chainId - The chain ID associated with the proposal.
 * @param proposal - The proposal to update with execution details.
 */
function syncExecutionInfo(
  chainId: SupportedChainID,
  proposal: MultisigProposal | TokenVotingProposal
): void {
  const executionStorage = new ExecutionStorage();

  if (proposal.executionTxHash) {
    // If the proposal already has an execution hash, remove its detail from storage.
    executionStorage.removeExecutionDetail(chainId, proposal.id);
  } else {
    // Otherwise, get the execution detail from storage and merge into the proposal.
    const executionDetail = executionStorage.getExecutionDetail(
      chainId,
      proposal.id
    );
    Object.assign(proposal, executionDetail);
  }
}

/**
 * Enhances and appends cached votes to the provided proposal.
 *
 * @param chainId - The chain ID for which votes or approvals are associated.
 * @param proposal - The input proposal data.
 */
function syncApprovalsOrVotes(
  chainId: SupportedChainID,
  proposal: MultisigProposal | TokenVotingProposal
): void {
  const voteStorage = new VoteStorage();

  if (isMultisigProposal(proposal)) {
    proposal.approvals = syncMultisigVotes(chainId, proposal, voteStorage);
  } else if (isTokenBasedProposal(proposal)) {
    proposal.votes = syncTokenBasedVotes(chainId, proposal, voteStorage);
  }
}

/**
 * Retrieves and filters cached votes for a multisig proposal, removing votes
 * already indexed by the server and storing unique cached votes.
 *
 * @param chainId - The chain ID for which votes are associated.
 * @param proposal - The input proposal data.
 * @param voteStorage - Instance of VoteStorage to manage cached votes.
 * @returns A list of unique cached votes.
 */
function syncMultisigVotes(
  chainId: SupportedChainID,
  proposal: MultisigProposal,
  voteStorage: VoteStorage
): string[] {
  const serverApprovals = new Set(proposal.approvals);
  const allCachedApprovals = voteStorage.getVotes(
    chainId,
    proposal.id
  ) as string[];

  const uniqueCachedApprovals = allCachedApprovals.filter(cachedVote => {
    // remove votes returned by the query from the cache
    if (serverApprovals.has(cachedVote.toLowerCase())) {
      voteStorage.removeVoteForProposal(chainId, proposal.id, cachedVote);
      return false;
    } else {
      return true;
    }
  });

  return [...uniqueCachedApprovals, ...Array.from(serverApprovals)];
}

/**
 * Handles the votes for a token based proposal by checking if the cached vote
 * needs to replace or supplement the server's votes.
 *
 * @param chainId - The chain ID for which votes are associated.
 * @param proposal - The input proposal data.
 * @param voteStorage - Instance of VoteStorage to manage cached votes.
 * @returns An updated list of votes.
 */
function syncTokenBasedVotes(
  chainId: SupportedChainID,
  proposal: TokenVotingProposal,
  voteStorage: VoteStorage
): TokenVotingProposalVote[] {
  const serverVotes = new Map(proposal.votes.map(vote => [vote.address, vote]));
  const uniqueCachedVotes: Array<TokenVotingProposalVote> = [];

  // all cached votes
  const allCachedVotes = voteStorage.getVotes(
    chainId,
    proposal.id
  ) as TokenVotingProposalVote[];

  for (const cachedVote of allCachedVotes) {
    const serverVote = serverVotes.get(cachedVote.address.toLowerCase());
    const sameVoter = !!serverVote;

    // unique voter, keep cache and server votes
    if (!sameVoter) {
      uniqueCachedVotes.push(cachedVote);
      continue;
    }

    const sameVoteReplacementStatus =
      !!serverVote.voteReplaced === cachedVote.voteReplaced;

    if (sameVoteReplacementStatus) {
      // same vote, remove cached vote
      voteStorage.removeVoteForProposal(
        chainId,
        proposal.id,
        cachedVote.address
      );
    } else if (cachedVote.voteReplaced) {
      // cachedVote is a replacement: cache ahead, keep cached version
      serverVotes.set(cachedVote.address, cachedVote);
    } else {
      // serverVote is a replacement, cache is behind, remove cached version
      voteStorage.removeVoteForProposal(
        chainId,
        proposal.id,
        cachedVote.address
      );
    }
  }

  return [...uniqueCachedVotes, ...Array.from(serverVotes.values())];
}
