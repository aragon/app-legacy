import {
  MultisigProposalListItem,
  SubgraphAction,
  SubgraphVoteValuesMap,
  TokenVotingProposalListItem,
  VoteValues,
} from '@aragon/sdk-client';
import {
  DaoAction,
  ProposalMetadata,
  decodeRatio,
  getCompactProposalId,
  hexToBytes,
} from '@aragon/sdk-client-common';
import {SubgraphMultisigProposalListItem} from 'utils/types';
import {
  computeMultisigProposalStatus,
  computeTokenVotingProposalStatus,
  parseToken,
} from './proposal';
import {
  SubgraphTokenVotingProposalListItem,
  SubgraphTokenVotingVoterListItem,
} from '@aragon/sdk-client/dist/tokenVoting/internal/types';

export function toMultisigProposalListItem(
  proposal: SubgraphMultisigProposalListItem,
  metadata: ProposalMetadata
): MultisigProposalListItem {
  const startDate = new Date(parseInt(proposal.startDate) * 1000);
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
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
    },
    approvals: proposal.approvals.map(approval => approval.id.slice(0, 42)),
    actions: proposal.actions.map((action: SubgraphAction): DaoAction => {
      return {
        data: hexToBytes(action.data),
        to: action.to,
        value: BigInt(action.value),
      };
    }),
    settings: {
      onlyListed: proposal.plugin.onlyListed,
      minApprovals: proposal.minApprovals,
    },
    startDate,
    endDate,
    status: computeMultisigProposalStatus(proposal),
  };
}

export function toTokenVotingProposalListItem(
  proposal: SubgraphTokenVotingProposalListItem,
  metadata: ProposalMetadata
): TokenVotingProposalListItem {
  const startDate = new Date(parseInt(proposal.startDate) * 1000);
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
  const token = parseToken(proposal.plugin.token);
  return {
    id: getCompactProposalId(proposal.id),
    dao: {
      address: proposal.dao.id,
      name: proposal.dao.subdomain,
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
    creatorAddress: proposal.creator,
    metadata: {
      title: metadata.title,
      summary: metadata.summary,
    },
    totalVotingWeight: BigInt(proposal.totalVotingPower),
    startDate,
    endDate,
    status: computeTokenVotingProposalStatus(proposal),
    result: {
      yes: proposal.yes ? BigInt(proposal.yes) : BigInt(0),
      no: proposal.no ? BigInt(proposal.no) : BigInt(0),
      abstain: proposal.abstain ? BigInt(proposal.abstain) : BigInt(0),
    },
    token,
    votes: proposal.voters.map((voter: SubgraphTokenVotingVoterListItem) => {
      return {
        voteReplaced: voter.voteReplaced,
        address: voter.voter.address,
        vote: SubgraphVoteValuesMap.get(voter.voteOption) as VoteValues,
        weight: BigInt(voter.votingPower),
      };
    }),
    actions: proposal.actions.map((action: SubgraphAction): DaoAction => {
      return {
        data: hexToBytes(action.data),
        to: action.to,
        value: BigInt(action.value),
      };
    }),
  };
}
