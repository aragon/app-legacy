/**
 * This file contains helpers for mapping a proposal
 * to voting terminal properties. Doesn't exactly belong
 * here, but couldn't leave in the Proposal Details page,
 * so open to suggestions.
 */

import {AddressListProposal, Erc20Proposal} from '@aragon/sdk-client';
import {ProposalStatus} from '@aragon/sdk-client/dist/internal/interfaces/common';
import {
  AddressListProposalResult,
  Erc20ProposalResult,
  VoteValues,
} from '@aragon/sdk-client/dist/internal/interfaces/plugins';
import {ProgressStatusProps, VoterType} from '@aragon/ui-components';
import Big from 'big.js';
import {format} from 'date-fns';
import {BigNumber} from 'ethers';

import {ProposalVoteResults} from 'containers/votingTerminal';
import {DetailedProposal} from 'hooks/useDaoProposal';
import {i18n} from '../../i18n.config';
import {getFormattedUtcOffset, KNOWN_FORMATS} from './date';
import {formatUnits} from './library';
import {abbreviateTokenAmount} from './tokens';

const MappedVotes: {[key in VoteValues]: VoterType['option']} = {
  1: 'Yes',
  2: 'No',
  3: 'Abstain',
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
 * @param totalWeight number of eligible voting tokens at proposal creation snapshot
 * @param token token associated with proposal
 * @returns minimum approval summary for voting terminal
 */
export function getErc20MinimumApproval(
  minSupport: number,
  totalWeight: bigint,
  token: Erc20Proposal['token']
): string {
  const percentage = Math.trunc(minSupport * 100);
  const tokenValue = abbreviateTokenAmount(
    parseFloat(
      Big(formatUnits(totalWeight, token.decimals)).mul(minSupport).toFixed(2)
    ).toString()
  );

  return `${tokenValue} ${token.symbol} (${percentage}%)`;
}

/**
 *  Get minimum approval summary for whitelist voting proposal
 * @param minSupport Minimum support for vote to pass
 * @param snapshotVotingPower number of eligible wallets/members at proposal creation snapshot
 * @returns minimum approval summary for voting terminal
 */
export function getWhitelistMinimumApproval(
  minSupport: number,
  snapshotVotingPower: number
): string {
  const members = Math.ceil(snapshotVotingPower * minSupport);

  return `${members} ${i18n.t('labels.members')} (${parseFloat(
    (minSupport * 100).toFixed(2)
  )}%)`;
}

/**
 * Get mapped voters and voting participation summary for ERC20 Voting proposal
 * @param votes list of votes on proposal
 * @param token token associated with proposal
 * @param totalWeight number of eligible voting tokens at proposal creation snapshot
 * @returns mapped voters and participation summary
 */
export function getErc20VotersAndParticipation(
  votes: Erc20Proposal['votes'],
  token: Erc20Proposal['token'],
  totalWeight: bigint
): {voters: Array<VoterType>; summary: string} {
  let weights = BigNumber.from(0);
  let votingPower;
  let tokenAmount;

  // map to voters structure
  const voters = votes.map(vote => {
    // increment number of voted tokens
    weights = weights.add(BigNumber.from(vote.weight));

    votingPower =
      parseFloat(
        Big(Number(vote.weight))
          .div(Number(totalWeight))
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
      Number(formatUnits(totalWeight, token.decimals)).toFixed(2)
    ).toString()
  );

  const formattedParticipation = abbreviateTokenAmount(
    parseFloat(
      Number(formatUnits(weights, token.decimals)).toFixed(2)
    ).toString()
  );

  const participationPercentage = parseFloat(
    Big(Number(weights)).mul(100).div(Number(totalWeight)).toFixed(2)
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
 * @param snapshotVotingPower  number of eligible wallets/members at proposal creation snapshot
 * @returns mapped voters and participation summary
 */
export function getWhitelistVoterParticipation(
  votes: AddressListProposal['votes'],
  snapshotVotingPower: number
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
        ((votes.length / snapshotVotingPower) * 100).toFixed(2)
      ),
      tokenSymbol: i18n.t('labels.members'),
      totalWeight: snapshotVotingPower,
    }),
  };
}

/**
 * Get the mapped result of ERC20 voting proposal vote
 * @param result result of votes on proposal
 * @param tokenDecimals number of decimals in token
 * @param totalWeight number of eligible voting tokens at proposal creation snapshot
 * @returns mapped voting result
 */
export function getErc20Results(
  result: Erc20ProposalResult,
  tokenDecimals: number,
  totalWeight: BigInt
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
        Big(Number(no)).mul(100).div(Number(totalWeight)).toFixed(2)
      ),
    },
    no: {
      value: abbreviateTokenAmount(
        parseFloat(Number(formatUnits(no, tokenDecimals)).toFixed(2)).toString()
      ),
      percentage: parseFloat(
        Big(Number(no)).mul(100).div(Number(totalWeight)).toFixed(2)
      ),
    },
    abstain: {
      value: abbreviateTokenAmount(
        parseFloat(
          Number(formatUnits(abstain, tokenDecimals)).toFixed(2)
        ).toString()
      ),
      percentage: parseFloat(
        Big(Number(no)).mul(100).div(Number(totalWeight)).toFixed(2)
      ),
    },
  };
}

/**
 * Get the mapped result of Whitelist voting proposal vote
 * @param result result of votes on proposal
 * @param snapshotVotingPower number of eligible wallets/members at proposal creation snapshot
 * @returns mapped voters and participation summary
 */
export function getWhitelistResults(
  result: AddressListProposalResult,
  snapshotVotingPower: number
): ProposalVoteResults {
  const {yes, no, abstain} = result;
  return {
    yes: {
      value: yes,
      percentage: parseFloat(((yes / snapshotVotingPower) * 100).toFixed(2)),
    },
    no: {
      value: no,
      percentage: parseFloat(((no / snapshotVotingPower) * 100).toFixed(2)),
    },
    abstain: {
      value: abstain,
      percentage: parseFloat(
        ((abstain / snapshotVotingPower) * 100).toFixed(2)
      ),
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
      return [
        ...getPassedProposalSteps(creationDate, startDate, publishedBlock),
        {label: i18n.t('governance.statusWidget.succeeded'), mode: 'upcoming'},
      ];

    // TODO - Execution failed: no execution date treated as failure for now
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
