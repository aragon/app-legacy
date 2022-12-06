/**
 * This file contains helpers for mapping a proposal
 * to voting terminal properties. Doesn't exactly belong
 * here, but couldn't leave in the Proposal Details page,
 * so open to suggestions.
 */

import {
  AddressListProposal,
  AddressListProposalResult,
  Erc20Proposal,
  Erc20ProposalResult,
  Erc20TokenDetails,
  ICreateProposalParams,
  IPluginSettings,
  ProposalStatus,
  VoteValues,
} from '@aragon/sdk-client';
import {ProgressStatusProps, VoterType} from '@aragon/ui-components';
import Big from 'big.js';
import {format} from 'date-fns';

import {ProposalVoteResults} from 'containers/votingTerminal';
import differenceInSeconds from 'date-fns/fp/differenceInSeconds';
import {i18n} from '../../i18n.config';
import {getFormattedUtcOffset, KNOWN_FORMATS} from './date';
import {formatUnits} from './library';
import {abbreviateTokenAmount} from './tokens';
import {AddressListVote, DetailedProposal, Erc20ProposalVote} from './types';
import {BigNumber} from 'ethers';

export const MappedVotes: {[key in VoteValues]: VoterType['option']} = {
  1: 'abstain',
  2: 'yes',
  3: 'no',
};

// this type guard will need to evolve when there are more types
export function isTokenBasedProposal(
  proposal: DetailedProposal
): proposal is Erc20Proposal {
  return 'token' in proposal;
}

/**
 * Get minimum approval summary for ERC20 voting proposal
 * @param minSupport Minimum support for vote to pass
 * @param totalVotingWeight number of eligible voting tokens at proposal creation snapshot
 * @param token token associated with proposal
 * @returns minimum approval summary for voting terminal
 */
export function getErc20MinimumApproval(
  minSupport: number,
  totalVotingWeight: bigint,
  token: Erc20Proposal['token']
): string {
  const percentage = Math.trunc(minSupport * 100);
  const tokenValue = abbreviateTokenAmount(
    parseFloat(
      Big(formatUnits(totalVotingWeight, token.decimals))
        .mul(minSupport)
        .toFixed(2)
    ).toString()
  );

  return `${tokenValue} ${token.symbol} (${percentage}%)`;
}

/**
 *  Get minimum approval summary for whitelist voting proposal
 * @param minSupport Minimum support for vote to pass
 * @param totalVotingWeight number of eligible wallets/members at proposal creation snapshot
 * @returns minimum approval summary for voting terminal
 */
export function getWhitelistMinimumApproval(
  minSupport: number,
  totalVotingWeight: number
): string {
  const members = Math.ceil(totalVotingWeight * minSupport);
  return `${members} ${i18n.t('labels.members')} (${minSupport * 100}%)`;
}

/**
 * Get mapped voters and voting participation summary for ERC20 Voting proposal
 * @param votes list of votes on proposal
 * @param token token associated with proposal
 * @param totalVotingWeight number of eligible voting tokens at proposal creation snapshot
 * @returns mapped voters and participation summary
 */
export function getErc20VotersAndParticipation(
  votes: Erc20Proposal['votes'],
  token: Erc20Proposal['token'],
  totalVotingWeight: bigint,
  usedVotingWeight: bigint
): {voters: Array<VoterType>; summary: string} {
  let votingPower;
  let tokenAmount;

  // map to voters structure
  const voters = votes.map(vote => {
    votingPower =
      parseFloat(
        Big(Number(vote.weight))
          .div(Number(totalVotingWeight))
          .mul(100)
          .toNumber()
          .toFixed(2)
      ).toString() + '%';

    tokenAmount = `${abbreviateTokenAmount(
      parseFloat(
        Number(formatUnits(vote.weight, token.decimals)).toFixed(2)
      ).toString()
    )} ${token.symbol}`;

    return {
      wallet: vote.address,
      option: MappedVotes[vote.vote],
      votingPower,
      tokenAmount,
    };
  });

  // calculate participation summary
  const formattedTotalWeight = abbreviateTokenAmount(
    parseFloat(
      Number(formatUnits(totalVotingWeight, token.decimals)).toFixed(2)
    ).toString()
  );

  const formattedParticipation = abbreviateTokenAmount(
    parseFloat(
      Number(formatUnits(usedVotingWeight, token.decimals)).toFixed(2)
    ).toString()
  );

  const participationPercentage = parseFloat(
    Big(Number(usedVotingWeight))
      .mul(100)
      .div(Number(totalVotingWeight))
      .toFixed(2)
  );

  return {
    voters,
    summary: i18n.t('votingTerminal.participationErc20', {
      participation: formattedParticipation,
      percentage: participationPercentage,
      tokenSymbol: token.symbol,
      totalWeight: formattedTotalWeight,
    }),
  };
}

/**
 * Get mapped voters and voting participation summary for Whitelist Voting proposal
 * @param votes list of votes on proposal
 * @param totalVotingWeight  number of eligible wallets/members at proposal creation snapshot
 * @returns mapped voters and participation summary
 */
export function getWhitelistVoterParticipation(
  votes: AddressListProposal['votes'],
  totalVotingWeight: number
): {voters: Array<VoterType>; summary: string} {
  const voters = votes.map(voter => ({
    wallet: voter.address,
    option: MappedVotes[voter.vote],
    votingPower: '1',
  }));

  // calculate summary
  return {
    voters,
    summary: i18n.t('votingTerminal.participationErc20', {
      participation: votes.length,
      percentage: parseFloat(
        ((votes.length / totalVotingWeight) * 100).toFixed(2)
      ),
      tokenSymbol: i18n.t('labels.members'),
      totalWeight: totalVotingWeight,
    }),
  };
}

/**
 * Get the mapped result of ERC20 voting proposal vote
 * @param result result of votes on proposal
 * @param tokenDecimals number of decimals in token
 * @param totalVotingWeight number of eligible voting tokens at proposal creation snapshot
 * @returns mapped voting result
 */
export function getErc20Results(
  result: Erc20ProposalResult,
  tokenDecimals: number,
  totalVotingWeight: BigInt
): ProposalVoteResults {
  const {yes, no, abstain} = result;

  return {
    yes: {
      value: abbreviateTokenAmount(
        parseFloat(
          Number(formatUnits(yes, tokenDecimals)).toFixed(2)
        ).toString()
      ),
      percentage: parseFloat(
        Big(Number(yes)).mul(100).div(Number(totalVotingWeight)).toFixed(2)
      ),
    },
    no: {
      value: abbreviateTokenAmount(
        parseFloat(Number(formatUnits(no, tokenDecimals)).toFixed(2)).toString()
      ),
      percentage: parseFloat(
        Big(Number(no)).mul(100).div(Number(totalVotingWeight)).toFixed(2)
      ),
    },
    abstain: {
      value: abbreviateTokenAmount(
        parseFloat(
          Number(formatUnits(abstain, tokenDecimals)).toFixed(2)
        ).toString()
      ),
      percentage: parseFloat(
        Big(Number(abstain)).mul(100).div(Number(totalVotingWeight)).toFixed(2)
      ),
    },
  };
}

/**
 * Get the mapped result of Whitelist voting proposal vote
 * @param result result of votes on proposal
 * @param totalVotingWeight number of eligible wallets/members at proposal creation snapshot
 * @returns mapped voters and participation summary
 */
export function getWhitelistResults(
  result: AddressListProposalResult,
  totalVotingWeight: number
): ProposalVoteResults {
  const {yes, no, abstain} = result;
  return {
    yes: {
      value: yes,
      percentage: parseFloat(((yes / totalVotingWeight) * 100).toFixed(2)),
    },
    no: {
      value: no,
      percentage: parseFloat(((no / totalVotingWeight) * 100).toFixed(2)),
    },
    abstain: {
      value: abstain,
      percentage: parseFloat(((abstain / totalVotingWeight) * 100).toFixed(2)),
    },
  };
}

/**
 * Get proposal status steps
 * @param status proposal status
 * @param endDate proposal voting end date
 * @param creationDate proposal creation date
 * @param publishedBlock block number
 * @param executionDate proposal execution date
 * @returns list of status steps based on proposal status
 */
export function getProposalStatusSteps(
  status: ProposalStatus,
  startDate: Date,
  endDate: Date,
  creationDate: Date,
  publishedBlock: string,
  executionFailed: boolean,
  executionBlock?: string,
  executionDate?: Date
): Array<ProgressStatusProps> {
  switch (status) {
    case 'Active':
      return [
        {...getPublishedProposalStep(creationDate, publishedBlock)},
        {
          label: i18n.t('governance.statusWidget.active'),
          mode: 'active',
          date: `${format(
            startDate,
            KNOWN_FORMATS.proposals
          )}  ${getFormattedUtcOffset()}`,
        },
      ];
    case 'Defeated':
      return [
        {...getPublishedProposalStep(creationDate, publishedBlock)},
        {
          label: i18n.t('governance.statusWidget.defeated'),
          mode: 'failed',
          date: `${format(
            endDate,
            KNOWN_FORMATS.proposals
          )}  ${getFormattedUtcOffset()}`,
        },
      ];
    case 'Succeeded':
      if (executionFailed)
        return [
          ...getPassedProposalSteps(creationDate, startDate, publishedBlock),
          {
            label: i18n.t('governance.statusWidget.failed'),
            mode: 'failed',
            date: `${format(
              new Date(),
              KNOWN_FORMATS.proposals
            )}  ${getFormattedUtcOffset()}`,
          },
        ];
      else
        return [
          ...getPassedProposalSteps(creationDate, startDate, publishedBlock),
          {
            label: i18n.t('governance.statusWidget.succeeded'),
            mode: 'upcoming',
          },
        ];
    case 'Executed':
      if (executionDate)
        return [
          ...getPassedProposalSteps(creationDate, startDate, publishedBlock),
          {
            label: i18n.t('governance.statusWidget.executed'),
            mode: 'succeeded',
            date: `${format(
              executionDate,
              KNOWN_FORMATS.proposals
            )}  ${getFormattedUtcOffset()}`,
            block: executionBlock,
          },
        ];
      else
        return [
          ...getPassedProposalSteps(creationDate, startDate, publishedBlock),
          {label: i18n.t('governance.statusWidget.failed'), mode: 'failed'},
        ];

    // Pending by default
    default:
      return [
        {...getPublishedProposalStep(creationDate, publishedBlock)},
        {
          label: i18n.t('governance.statusWidget.pending'),
          mode: 'upcoming',
          date: `${format(
            startDate,
            KNOWN_FORMATS.proposals
          )}  ${getFormattedUtcOffset()}`,
        },
      ];
  }
}

function getPassedProposalSteps(
  creationDate: Date,
  startDate: Date,
  block: string
): Array<ProgressStatusProps> {
  return [
    {...getPublishedProposalStep(creationDate, block)},
    {
      label: i18n.t('governance.statusWidget.passed'),
      mode: 'done',
      date: `${format(
        startDate,
        KNOWN_FORMATS.proposals
      )}  ${getFormattedUtcOffset()}`,
    },
  ];
}

function getPublishedProposalStep(
  creationDate: Date,
  block: string
): ProgressStatusProps {
  return {
    label: i18n.t('governance.statusWidget.published'),
    date: `${format(
      creationDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`,
    mode: 'done',
    block,
  };
}

/**
 * get transformed data for terminal
 * @param proposal
 * @returns transformed data for terminal
 */
export function getTerminalProps(
  proposal: DetailedProposal,
  voter: string | null
) {
  let token;
  let voters;
  let participation;
  let results;
  let approval;
  let strategy;

  if (isTokenBasedProposal(proposal)) {
    // token
    token = {
      name: proposal.token.name,
      symbol: proposal.token.symbol,
    };

    // voters
    const ptcResults = getErc20VotersAndParticipation(
      proposal.votes,
      proposal.token,
      proposal.totalVotingWeight,
      proposal.usedVotingWeight
    );
    voters = ptcResults.voters.sort(a => (a.wallet === voter ? -1 : 0));

    // participation summary
    participation = ptcResults.summary;

    // results
    results = getErc20Results(
      proposal.result,
      proposal.token.decimals,
      proposal.totalVotingWeight
    );

    // min approval
    approval = getErc20MinimumApproval(
      proposal.settings.minSupport,
      proposal.totalVotingWeight,
      proposal.token
    );

    // strategy
    strategy = i18n.t('votingTerminal.tokenVoting');
  } else {
    // voters
    const ptcResults = getWhitelistVoterParticipation(
      proposal.votes,
      proposal.totalVotingWeight
    );
    voters = ptcResults.voters.sort(a => (a.wallet === voter ? -1 : 0));

    // participation summary
    participation = ptcResults.summary;

    // results
    results = getWhitelistResults(proposal.result, proposal.totalVotingWeight);

    // approval
    approval = getWhitelistMinimumApproval(
      proposal.settings.minSupport,
      proposal.totalVotingWeight
    );

    // strategy
    strategy = i18n.t('votingTerminal.multisig');
  }

  return {
    token,
    status: proposal.status,
    voters,
    results,
    approval,
    strategy,
    participation,

    startDate: `${format(
      proposal.startDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`,

    endDate: `${format(
      proposal.endDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`,
  };
}

type MapToDetailedProposalParams = {
  creatorAddress: string;
  daoAddress: string;
  daoName: string;
  daoToken?: Erc20TokenDetails;
  totalVotingWeight: number | bigint;
  pluginSettings: IPluginSettings;
  proposalCreationData: ICreateProposalParams;
  proposalId: string;
};

/**
 * Map newly created proposal to Detailed proposal that can be cached and shown
 * @param params necessary parameters to map newly created proposal to augmented DetailedProposal
 * @returns Detailed proposal, ready for caching and displaying
 */
export function mapToDetailedProposal(params: MapToDetailedProposalParams) {
  return {
    actions: params.proposalCreationData.actions || [],
    creationDate: new Date(),
    creatorAddress: params.creatorAddress,
    dao: {address: params.daoAddress, name: params.daoName},
    endDate: params.proposalCreationData.endDate,
    id: params.proposalId,
    metadata: params.proposalCreationData.metadata,
    settings: {
      minSupport: params.pluginSettings.minSupport,
      minTurnout: params.pluginSettings.minTurnout,
      duration: differenceInSeconds(
        params.proposalCreationData.startDate!,
        params.proposalCreationData.endDate!
      ),
    },
    startDate: params.proposalCreationData.startDate,
    status: 'Pending',
    votes: [],
    ...(params.daoToken
      ? {
          token: {
            address: params.daoToken?.address,
            decimals: params.daoToken?.decimals,
            name: params.daoToken?.name,
            symbol: params.daoToken?.symbol,
          },
          totalVotingWeight: params.totalVotingWeight as bigint,
          usedVotingWeight: BigInt(0),
          result: {yes: BigInt(0), no: BigInt(0), abstain: BigInt(0)},
        }
      : {
          totalVotingWeight: params.totalVotingWeight as number,
          usedVotingWeight: 0,
          result: {yes: 0, no: 0, abstain: 0},
        }),
  } as DetailedProposal;
}

/**
 * Augment proposal with vote
 * @param proposal proposal to be augmented with vote
 * @param vote
 * @returns a proposal augmented with a singular vote
 */
export function addVoteToProposal(
  proposal: DetailedProposal,
  vote: AddressListVote | Erc20ProposalVote
): DetailedProposal {
  if (!vote) return proposal;

  // calculate new vote values including cached ones
  const voteValue = MappedVotes[vote.vote];
  if (isTokenBasedProposal(proposal)) {
    // Token-based calculation
    return {
      ...proposal,
      votes: [...proposal.votes, {...vote}],
      result: {
        ...proposal.result,
        [voteValue]: BigNumber.from(proposal.result[voteValue])
          .add((vote as Erc20ProposalVote).weight)
          .toBigInt(),
      },
      usedVotingWeight: BigNumber.from(proposal.usedVotingWeight)
        .add((vote as Erc20ProposalVote).weight)
        .toBigInt(),
    } as Erc20Proposal;
  } else {
    // AddressList calculation
    return {
      ...proposal,
      votes: [...proposal.votes, {...vote}],
      result: {
        ...proposal.result,
        [voteValue]: proposal.result[voteValue] + 1,
      },
    } as AddressListProposal;
  }
}

/**
 * Strips proposal id of plugin address
 * @param proposalId id with following format:  *0x4206cdbc...a675cae35_0x0*
 * @returns proposal id without the pluginAddress
 * or the given proposal id if already stripped of the plugin address: *0x3*
 */
export function stripPlgnAdrFromProposalId(proposalId: string) {
  const parts = proposalId.split('_');

  // return the "pure" contract proposal id or consider given proposal already stripped
  return parts[1] || proposalId;
}

/**
 * Adds plugin address to proposal id
 * @param proposalId id with following format: *0x000000000...00000000002*
 * @param pluginAddress address of plugin on which proposal was created
 * @returns proposal id prefixed with the plugin address
 * or the given proposal id if already prefixed with teh plugin address: *0x4206cdbc...a675cae35_0x0*
 */
export function prefixProposalIdWithPlgnAdr(
  proposalId: string,
  pluginAddress: string
) {
  const parts = proposalId.split('_');

  // address already prefixed
  if (parts.length === 2) return proposalId;

  // get last five characters from proposal, remove leading zeros, and prefix with
  // plugin address
  return `${pluginAddress}_0x${proposalId.slice(-5).replace(/^0+/, '')}`;
}
