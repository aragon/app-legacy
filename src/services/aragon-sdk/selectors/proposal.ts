import {
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
  Erc721TokenDetails,
  MultisigProposal,
  MultisigProposalListItem,
  SubgraphAction,
  SubgraphVoteValuesMap,
  TokenVotingProposal,
  TokenVotingProposalListItem,
  TokenVotingProposalVote,
  VoteValues,
} from '@aragon/sdk-client';
import {
  DaoAction,
  decodeRatio,
  ensure0x,
  getCompactProposalId,
  hexToBytes,
  ProposalMetadata,
  ProposalStatus,
  TokenType,
} from '@aragon/sdk-client-common';
import {
  SubgraphErc20Token,
  SubgraphErc20WrapperToken,
  SubgraphErc721Token,
  SubgraphTokenVotingProposal,
  SubgraphTokenVotingProposalListItem,
  SubgraphTokenVotingVoterListItem,
} from '@aragon/sdk-client/dist/tokenVoting/internal/types';
import {InfiniteData} from '@tanstack/react-query';
import {
  GaslessVotingProposal,
  GaslessVotingProposalListItem,
} from '@vocdoni/gasless-voting';

import {SupportedChainID} from 'utils/constants';
import {executionStorage, voteStorage} from 'utils/localStorage';
import {proposalStorage} from 'utils/localStorage/proposalStorage';
import {
  isGaslessProposal,
  isMultisigProposal,
  isTokenBasedProposal,
  recalculateProposalStatus,
} from 'utils/proposals';
import {
  SubgraphContractType,
  SubgraphMultisigProposal,
  SubgraphMultisigProposalListItem,
} from 'utils/types';

/**
 * Transforms proposals within an `InfiniteData` structure.
 *
 * @template T - Type of the proposals list, either `MultisigProposalListItem` array or `TokenVotingProposalListItem` array.
 * @param chainId - The ID of the supported chain.
 * @param data - The data containing pages of proposals to transform.
 *
 * @returns - Transformed data with proposals processed based on the chainId.
 */
export function transformInfiniteProposals<
  T extends
    | Array<MultisigProposalListItem>
    | Array<TokenVotingProposalListItem>
    | Array<GaslessVotingProposalListItem>,
>(chainId: SupportedChainID, data: InfiniteData<T>): InfiniteData<T> {
  return {
    ...data,
    pages: data.pages.map(
      page => page?.map(proposal => transformProposal(chainId, proposal)) as T
    ),
  };
}

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
 *
 * @returns The transformed data.
 */
export function transformProposal<
  T extends
    | MultisigProposal
    | TokenVotingProposal
    | MultisigProposalListItem
    | TokenVotingProposalListItem
    | GaslessVotingProposal
    | GaslessVotingProposalListItem
    | null,
>(chainId: SupportedChainID, data: T): T {
  if (data == null) {
    return data;
  }

  const proposal = {...data};

  syncApprovalsOrVotes(chainId, proposal);
  syncExecutionInfo(chainId, proposal);

  // todo(kon): Quickfix for gasless proposals bug where the creator address is not prefixed with 0x
  proposal.creatorAddress = ensure0x(proposal.creatorAddress);

  return recalculateProposalStatus(proposal) as T;
}

export function syncProposalData<
  T extends
    | MultisigProposal
    | TokenVotingProposal
    | GaslessVotingProposal
    | MultisigProposalListItem
    | TokenVotingProposalListItem
    | GaslessVotingProposalListItem,
>(chainId: SupportedChainID, proposalId: string, serverData: T | null) {
  if (serverData) {
    proposalStorage.removeProposal(chainId, serverData.id);
    return serverData;
  } else {
    return proposalStorage.getProposal(chainId, proposalId);
  }
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
  proposal:
    | MultisigProposal
    | TokenVotingProposal
    | GaslessVotingProposal
    | MultisigProposalListItem
    | TokenVotingProposalListItem
    | GaslessVotingProposalListItem
): void {
  if (proposal.status === ProposalStatus.EXECUTED) {
    // If the proposal is already executed, remove its detail from storage.
    executionStorage.removeExecutionDetail(chainId, proposal.id);
  } else {
    // Otherwise, get the execution detail from storage and merge into the proposal.
    const executionDetail = executionStorage.getExecutionDetail(
      chainId,
      proposal.id
    );

    if (executionDetail) {
      Object.assign(proposal, executionDetail);
      proposal.status = ProposalStatus.EXECUTED;
    }
  }
}

/**
 * Enhances and appends cached votes to the provided proposal/proposal list item.
 *
 * @param chainId - The chain ID for which votes or approvals are associated.
 * @param proposal - The input proposal data.
 */
function syncApprovalsOrVotes(
  chainId: SupportedChainID,
  proposal:
    | MultisigProposal
    | TokenVotingProposal
    | GaslessVotingProposal
    | MultisigProposalListItem
    | TokenVotingProposalListItem
    | GaslessVotingProposalListItem
): void {
  if (isMultisigProposal(proposal)) {
    proposal.approvals = syncMultisigVotes(chainId, proposal);
  } else if (isGaslessProposal(proposal)) {
    const {gaslessVoters, approvers} = syncGaslessVotesOrApproves(
      chainId,
      proposal
    );
    proposal.approvers = approvers;
    proposal.voters = gaslessVoters.map(({address}) => address);
  } else if (isTokenBasedProposal(proposal)) {
    proposal.votes = syncTokenBasedVotes(chainId, proposal);
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
  proposal: MultisigProposal | MultisigProposalListItem
): string[] {
  const serverApprovals = new Set(proposal.approvals);
  const allCachedApprovals = voteStorage.getVotes<string>(chainId, proposal.id);

  const uniqueCachedApprovals = allCachedApprovals.filter(cachedVote => {
    // remove, from the cache, votes that are returned by the query as well
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
  proposal: TokenVotingProposal | TokenVotingProposalListItem
): TokenVotingProposalVote[] {
  const serverVotes = new Map(
    proposal.votes?.map(vote => [vote.address, vote])
  );
  const uniqueCachedVotes: Array<TokenVotingProposalVote> = [];

  // all cached votes
  const allCachedVotes = voteStorage.getVotes<TokenVotingProposalVote>(
    chainId,
    proposal.id
  );

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
      // same vote replacement status, remove cached vote
      voteStorage.removeVoteForProposal(
        chainId,
        proposal.id,
        cachedVote.address
      );
    } else if (cachedVote.voteReplaced) {
      // cachedVote is a replacement: cache ahead, keep cached version
      serverVotes.set(cachedVote.address, cachedVote);
    } else {
      // serverVote is a replacement: cache is behind, remove cached version
      // - NOTE: shouldn't be possible really unless someone is replacing their vote
      //   using a different device
      voteStorage.removeVoteForProposal(
        chainId,
        proposal.id,
        cachedVote.address
      );
    }
  }

  return [...uniqueCachedVotes, ...Array.from(serverVotes.values())];
}

type ApprovalVote = string;
type GaslessVote = {
  address: string;
  vote: VoteValues;
  weight: BigInt;
};

export type GaslessVoteOrApprovalVote =
  | {
      type: 'gaslessVote';
      vote: GaslessVote;
    }
  | {
      type: 'approval';
      vote: ApprovalVote;
    };

function syncGaslessVotesOrApproves(
  chainId: SupportedChainID,
  proposal: GaslessVotingProposal
) {
  const approversCache: ApprovalVote[] = [];
  const gaslessVotersCache: GaslessVote[] = [];

  // all cached votes
  const allCachedVotes = voteStorage.getVotes<GaslessVoteOrApprovalVote>(
    chainId,
    proposal.id
  );

  const serverApprovals = new Set(
    proposal.approvers?.map(approver => approver.toLowerCase())
  );
  const serverGaslessVoters = new Set(
    proposal.voters?.map(voter => voter.toLowerCase())
  );

  allCachedVotes.forEach(cachedVote => {
    // remove, from the cache, votes that are returned by the query as well
    if (
      cachedVote.type === 'approval' &&
      serverApprovals.has(cachedVote.vote.toLowerCase())
    ) {
      voteStorage.removeVoteForProposal(chainId, proposal.id, cachedVote.vote);
    } else if (
      cachedVote.type === 'gaslessVote' &&
      serverGaslessVoters.has(cachedVote.vote.address.toLowerCase())
    ) {
      voteStorage.removeVoteForProposal(
        chainId,
        proposal.id,
        cachedVote.vote.address
      );
    } else {
      // If the vote is not in the server, add it to the list
      cachedVote.type === 'approval'
        ? approversCache.push(cachedVote.vote)
        : gaslessVotersCache.push(cachedVote.vote);
    }
  });

  // This is needed until the voters list is fixed from the backend
  const mappedVoters = Array.from(serverGaslessVoters).map(address => ({
    address,
    vote: null,
    weight: null,
  }));

  return {
    approvers: [...approversCache, ...serverApprovals],
    gaslessVoters: [...gaslessVotersCache, ...mappedVoters],
  };
}

export function computeMultisigProposalStatus(
  proposal: SubgraphMultisigProposal | SubgraphMultisigProposalListItem
): ProposalStatus {
  const now = new Date();
  const startDate = new Date(parseInt(proposal.startDate) * 1000);
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
  // The proposal is executed so the status becomes EXECUTED
  // independently of the other conditions
  if (proposal.executed) {
    return ProposalStatus.EXECUTED;
  }
  // The proposal is not executed and the start date is in the future
  // so the status becomes PENDING
  if (startDate >= now) {
    return ProposalStatus.PENDING;
  }
  // The proposal is not executed and the start date is in the past
  // So we must check if the proposal reached the approval threshold
  // If it reached the approval threshold and it's a signaling proposal
  // the status becomes SUCCEEDED
  // If it reached the approval threshold and it's not a signaling proposal
  // the status becomes SUCCEEDED if if it hasn't reached the end date
  if (proposal.approvalReached) {
    if (proposal.isSignaling) {
      return ProposalStatus.SUCCEEDED;
    }
    if (now <= endDate) {
      return ProposalStatus.SUCCEEDED;
    }
  }
  // The proposal is not executed and the start date is in the past
  // and the approval threshold is not reached
  // If the end date is in the future this means that you can still vote
  // so the status becomes ACTIVE
  if (now <= endDate) {
    return ProposalStatus.ACTIVE;
  }
  // If none of the other conditions are met the status becomes DEFEATED
  return ProposalStatus.DEFEATED;
}

export function computeTokenVotingProposalStatus(
  proposal: SubgraphTokenVotingProposal | SubgraphTokenVotingProposalListItem
): ProposalStatus {
  const now = new Date();
  const startDate = new Date(parseInt(proposal.startDate) * 1000);
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
  // The proposal is executed so the status becomes EXECUTED
  // independently of the other conditions
  if (proposal.executed) {
    return ProposalStatus.EXECUTED;
  }
  // The proposal is not executed and the start date is in the future
  // so the status becomes PENDING
  if (startDate >= now) {
    return ProposalStatus.PENDING;
  }
  // The proposal is not executed and the start date is in the past.
  // Accordingly, we check if the proposal reached enough approval
  // (i.e., that the supportThreshold and minParticipation criteria are both met).
  // If approvalReached is true and the vote has ended (end date is in the past), it has succeeded.
  // This applies to normal mode and vote replacement mode.
  if (proposal.approvalReached && endDate <= now) {
    return ProposalStatus.SUCCEEDED;
  }
  // In early exeuction mode, we calculate if subsequent voting can change the result of the vote.
  // If not, the proposal is early executable and is therefore succeeded as well.
  if (proposal.earlyExecutable) {
    return ProposalStatus.SUCCEEDED;
  }
  // The proposal is not executed and the start date is in the past
  // and the approval threshold is not reached
  // If the end date is in the future this means that you can still vote
  // so the status becomes ACTIVE
  if (now < endDate) {
    return ProposalStatus.ACTIVE;
  }
  // If none of the other conditions are met the status becomes DEFEATED
  return ProposalStatus.DEFEATED;
}

export function toMultisigProposal(
  proposal: SubgraphMultisigProposal,
  metadata: ProposalMetadata
): MultisigProposal {
  const creationDate = new Date(parseInt(proposal.createdAt) * 1000);
  const startDate = new Date(parseInt(proposal.startDate) * 1000);
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
  const executionDate = proposal.executionDate
    ? new Date(parseInt(proposal.executionDate) * 1000)
    : null;
  return {
    id: getCompactProposalId(proposal.id),
    dao: {
      address: proposal.dao.id,
      name: proposal.dao.subdomain,
    },
    creatorAddress: proposal.creator,
    metadata: {
      title: metadata.title,
      summary: metadata.summary,
      description: metadata.description,
      resources: metadata.resources,
      media: metadata.media,
    },
    settings: {
      onlyListed: proposal.plugin.onlyListed,
      minApprovals: proposal.minApprovals,
    },
    creationBlockNumber: parseInt(proposal.creationBlockNumber) || 0,
    creationDate,
    startDate,
    endDate,
    executionDate,
    executionBlockNumber: parseInt(proposal.executionBlockNumber) || null,
    executionTxHash: proposal.executionTxHash || null,
    actions: proposal.actions.map((action: SubgraphAction): DaoAction => {
      return {
        data: hexToBytes(action.data),
        to: action.to,
        value: BigInt(action.value),
      };
    }),
    status: computeMultisigProposalStatus(proposal),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    approvals: proposal.approvals.map(approval => approval.approver.address),
  };
}

export function toTokenVotingProposal(
  proposal: SubgraphTokenVotingProposal,
  metadata: ProposalMetadata
): TokenVotingProposal {
  const startDate = new Date(parseInt(proposal.startDate) * 1000);
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
  const creationDate = new Date(parseInt(proposal.createdAt) * 1000);
  const executionDate = proposal.executionDate
    ? new Date(parseInt(proposal.executionDate) * 1000)
    : null;
  let usedVotingWeight: bigint = BigInt(0);
  for (const voter of proposal.voters) {
    usedVotingWeight += BigInt(voter.votingPower);
  }
  const token = parseToken(proposal.plugin.token);
  return {
    id: getCompactProposalId(proposal.id),
    dao: {
      address: proposal.dao.id,
      name: proposal.dao.subdomain,
    },
    creatorAddress: proposal.creator,
    metadata: {
      title: metadata.title,
      summary: metadata.summary,
      description: metadata.description,
      resources: metadata.resources,
      media: metadata.media,
    },
    startDate,
    endDate,
    creationDate,
    creationBlockNumber: parseInt(proposal.creationBlockNumber),
    executionDate,
    executionBlockNumber: parseInt(proposal.executionBlockNumber) || null,
    executionTxHash: proposal.executionTxHash || null,
    actions: proposal.actions.map((action: SubgraphAction): DaoAction => {
      return {
        data: hexToBytes(action.data),
        to: action.to,
        value: BigInt(action.value),
      };
    }),
    status: computeTokenVotingProposalStatus(proposal),
    result: {
      yes: proposal.yes ? BigInt(proposal.yes) : BigInt(0),
      no: proposal.no ? BigInt(proposal.no) : BigInt(0),
      abstain: proposal.abstain ? BigInt(proposal.abstain) : BigInt(0),
    },
    settings: {
      supportThreshold: decodeRatio(BigInt(proposal.supportThreshold), 6),
      duration: parseInt(proposal.endDate) - parseInt(proposal.startDate),
      minParticipation: decodeRatio(
        (BigInt(proposal.minVotingPower) * BigInt(1000000)) /
          BigInt(proposal.totalVotingPower),
        6
      ),
    },
    token,
    usedVotingWeight,
    totalVotingWeight: BigInt(proposal.totalVotingPower),
    votes: proposal.voters.map((voter: SubgraphTokenVotingVoterListItem) => {
      return {
        voteReplaced: voter.voteReplaced,
        address: voter.voter.address,
        vote: SubgraphVoteValuesMap.get(voter.voteOption) as VoteValues,
        weight: BigInt(voter.votingPower),
      };
    }),
  };
}

export function parseToken(
  subgraphToken:
    | SubgraphErc20Token
    | SubgraphErc721Token
    | SubgraphErc20WrapperToken
): Erc20TokenDetails | Erc721TokenDetails | null {
  let token:
    | Erc721TokenDetails
    | Erc20TokenDetails
    | Erc20WrapperTokenDetails
    | null = null;
  if (subgraphToken.__typename === SubgraphContractType.ERC20) {
    token = {
      address: subgraphToken.id,
      symbol: subgraphToken.symbol,
      name: subgraphToken.name,
      decimals: subgraphToken.decimals,
      type: TokenType.ERC20,
    };
  } else if (subgraphToken.__typename === SubgraphContractType.ERC721) {
    token = {
      address: subgraphToken.id,
      symbol: subgraphToken.symbol,
      name: subgraphToken.name,
      type: TokenType.ERC721,
    };
  } else if (subgraphToken.__typename === SubgraphContractType.ERC20_WRAPPER) {
    token = {
      address: subgraphToken.id,
      symbol: subgraphToken.symbol,
      name: subgraphToken.name,
      decimals: subgraphToken.decimals,
      type: TokenType.ERC20,
      underlyingToken: {
        address: subgraphToken.underlyingToken.id,
        symbol: subgraphToken.underlyingToken.symbol,
        name: subgraphToken.underlyingToken.name,
        decimals: subgraphToken.underlyingToken.decimals,
        type: TokenType.ERC20,
      },
    };
  }
  return token;
}
