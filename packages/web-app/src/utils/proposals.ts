/**
 * This file contains helpers for mapping a proposal
 * to voting terminal properties. Doesn't exactly belong
 * here, but couldn't leave in the Proposal Details page,
 * so open to suggestions.
 */

import {
  AddresslistVotingProposal,
  AddresslistVotingProposalResult,
  Erc20TokenDetails,
  ICreateProposalParams,
  MultisigProposal,
  ProposalMetadata,
  ProposalStatus,
  TokenVotingProposal,
  TokenVotingProposalResult,
  VoteValues,
  VotingMode,
  VotingSettings,
} from '@aragon/sdk-client';
import {ProgressStatusProps, VoterType} from '@aragon/ui-components';
import Big from 'big.js';
import {format, formatDistanceToNow, Locale} from 'date-fns';
import differenceInSeconds from 'date-fns/fp/differenceInSeconds';
import * as Locales from 'date-fns/locale';
import {BigNumber} from 'ethers';
import {TFunction} from 'react-i18next';

import {ProposalVoteResults} from 'containers/votingTerminal';
import {CachedProposal} from 'context/apolloClient';
import {MultisigMember} from 'hooks/useDaoMembers';
import {i18n} from '../../i18n.config';
import {getFormattedUtcOffset, KNOWN_FORMATS} from './date';
import {formatUnits} from './library';
import {abbreviateTokenAmount} from './tokens';
import {
  Action,
  AddressListVote,
  DetailedProposal,
  Erc20ProposalVote,
  StrictlyExclude,
  SupportedProposals,
  SupportedVotingSettings,
} from './types';
import {isMultisigVotingSettings} from 'hooks/usePluginSettings';

export type TokenVotingOptions = StrictlyExclude<
  VoterType['option'],
  'approved' | 'none'
>;

export const MappedVotes: {
  [key in VoteValues]: TokenVotingOptions;
} = {
  1: 'abstain',
  2: 'yes',
  3: 'no',
};

// this type guard will need to evolve when there are more types
export function isTokenBasedProposal(
  proposal: SupportedProposals | undefined
): proposal is TokenVotingProposal {
  if (!proposal) return false;
  return 'token' in proposal;
}

export function isErc20Token(
  token: TokenVotingProposal['token'] | undefined
): token is Erc20TokenDetails {
  if (!token) return false;
  return 'decimals' in token;
}

export function isErc20VotingProposal(
  proposal: SupportedProposals | undefined
): proposal is TokenVotingProposal & {token: Erc20TokenDetails} {
  return isTokenBasedProposal(proposal) && isErc20Token(proposal.token);
}

export function isMultisigProposal(
  proposal: SupportedProposals | undefined
): proposal is MultisigProposal {
  if (!proposal) return false;
  return 'approvals' in proposal;
}

/**
 * Get formatted minimum participation for an ERC20 proposal
 * @param minParticipation minimum number of tokens needed to participate in vote
 * @param totalVotingWeight total number of tokens able to vote
 * @param tokenDecimals proposal token decimals
 * @returns
 */
export function getErc20MinParticipation(
  minParticipation: number,
  totalVotingWeight: bigint,
  tokenDecimals: number
) {
  return abbreviateTokenAmount(
    parseFloat(
      Big(formatUnits(totalVotingWeight, tokenDecimals))
        .mul(minParticipation)
        .toFixed(2)
    ).toString()
  );
}

export function getErc20VotingParticipation(
  minParticipation: number,
  usedVotingWeight: bigint,
  totalVotingWeight: bigint,
  tokenDecimals: number
) {
  // calculate participation summary
  const totalWeight = abbreviateTokenAmount(
    parseFloat(
      Number(formatUnits(totalVotingWeight, tokenDecimals)).toFixed(2)
    ).toString()
  );

  // current participation
  const currentPart = abbreviateTokenAmount(
    parseFloat(
      Number(formatUnits(usedVotingWeight, tokenDecimals)).toFixed(2)
    ).toString()
  );

  const currentPercentage = parseFloat(
    Big(usedVotingWeight.toString())
      .mul(100)
      .div(totalVotingWeight.toString())
      .toFixed(2)
  );

  // minimum participation
  const minPart = getErc20MinParticipation(
    minParticipation,
    totalVotingWeight,
    tokenDecimals
  );

  // missing participation
  const missingRaw = Big(formatUnits(usedVotingWeight, tokenDecimals))
    .minus(
      Big(formatUnits(totalVotingWeight, tokenDecimals)).mul(minParticipation)
    )
    .toNumber();

  let missingPart;

  if (Math.sign(missingRaw) === 1) {
    // number of votes greater than required minimum participation
    missingPart = 0;
  } else missingPart = Math.abs(missingRaw);
  // const missingPart = Math.sign(Number(missingRaw)) === 1 ? Math.abs(Number(missingRaw));

  return {currentPart, currentPercentage, minPart, missingPart, totalWeight};
}

/**
 * Get mapped voters for ERC20 Voting proposal
 * @param votes list of votes on proposal
 * @param totalVotingWeight number of eligible voting tokens at proposal creation snapshot
 * @param tokenDecimals proposal token decimal
 * @param tokenSymbol proposal token symbol
 * @returns mapped voters
 */
export function getErc20Voters(
  votes: TokenVotingProposal['votes'],
  totalVotingWeight: bigint,
  tokenDecimals: number,
  tokenSymbol: string
): Array<VoterType> {
  let votingPower;
  let tokenAmount;
  // map to voters structure
  return votes.flatMap(vote => {
    if (vote.vote === undefined) return [];

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
        Number(formatUnits(vote.weight, tokenDecimals)).toFixed(2)
      ).toString()
    )} ${tokenSymbol}`;

    return {
      wallet: vote.address,
      option: MappedVotes[vote.vote],
      votingPower,
      tokenAmount,
    };
  });
}

/**
 * Get mapped voters and voting participation summary for Whitelist Voting proposal
 * @param votes list of votes on proposal
 * @param totalVotingWeight  number of eligible wallets/members at proposal creation snapshot
 * @returns mapped voters and participation summary
 */
export function getWhitelistVoterParticipation(
  votes: AddresslistVotingProposal['votes'],
  totalVotingWeight: number
): {voters: Array<VoterType>; summary: string} {
  const voters = votes.flatMap(voter => {
    return voter.vote !== undefined
      ? {
          wallet: voter.address,
          option: MappedVotes[voter.vote],
          votingPower: '1',
        }
      : [];
  });

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
  result: TokenVotingProposalResult,
  tokenDecimals: number,
  totalVotingWeight: BigInt
): ProposalVoteResults {
  const {yes, no, abstain} = result;

  return {
    yes: {
      value: parseFloat(
        Number(formatUnits(yes, tokenDecimals)).toFixed(2)
      ).toString(),
      percentage: parseFloat(
        Big(Number(yes)).mul(100).div(Number(totalVotingWeight)).toFixed(2)
      ),
    },
    no: {
      value: parseFloat(
        Number(formatUnits(no, tokenDecimals)).toFixed(2)
      ).toString(),
      percentage: parseFloat(
        Big(Number(no)).mul(100).div(Number(totalVotingWeight)).toFixed(2)
      ),
    },
    abstain: {
      value: parseFloat(
        Number(formatUnits(abstain, tokenDecimals)).toFixed(2)
      ).toString(),
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
  result: AddresslistVotingProposalResult,
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
  t: TFunction,
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
        {...getPublishedProposalStep(t, creationDate, publishedBlock)},
        {
          label: t('governance.statusWidget.active'),
          mode: 'active',
          date: `${format(
            startDate,
            KNOWN_FORMATS.proposals
          )}  ${getFormattedUtcOffset()}`,
        },
      ];
    case 'Defeated':
      return [
        {...getPublishedProposalStep(t, creationDate, publishedBlock)},
        {
          label: t('governance.statusWidget.defeated'),
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
          ...getPassedProposalSteps(t, creationDate, startDate, publishedBlock),
          {
            label: t('governance.statusWidget.failed'),
            mode: 'failed',
            date: `${format(
              new Date(),
              KNOWN_FORMATS.proposals
            )}  ${getFormattedUtcOffset()}`,
          },
        ];
      else
        return [
          ...getPassedProposalSteps(t, creationDate, startDate, publishedBlock),
          {
            label: t('governance.statusWidget.succeeded'),
            mode: 'upcoming',
          },
        ];
    case 'Executed':
      if (executionDate)
        return [
          ...getPassedProposalSteps(t, creationDate, startDate, publishedBlock),
          {
            label: t('governance.statusWidget.executed'),
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
          ...getPassedProposalSteps(t, creationDate, startDate, publishedBlock),
          {label: t('governance.statusWidget.failed'), mode: 'failed'},
        ];

    // Pending by default
    default:
      return [
        {...getPublishedProposalStep(t, creationDate, publishedBlock)},
        {
          label: t('governance.statusWidget.pending'),
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
  t: TFunction,
  creationDate: Date,
  startDate: Date,
  block: string
): Array<ProgressStatusProps> {
  return [
    {...getPublishedProposalStep(t, creationDate, block)},
    {
      label: t('governance.statusWidget.passed'),
      mode: 'done',
      date: `${format(
        startDate,
        KNOWN_FORMATS.proposals
      )}  ${getFormattedUtcOffset()}`,
    },
  ];
}

function getPublishedProposalStep(
  t: TFunction,
  creationDate: Date,
  block: string
): ProgressStatusProps {
  return {
    label: t('governance.statusWidget.published'),
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
  t: TFunction,
  proposal: DetailedProposal,
  voter: string | null,
  votingSettings: SupportedVotingSettings,
  members?: MultisigMember[]
) {
  let token;
  let voters: Array<VoterType>;
  let currentParticipation;
  let minParticipation;
  let missingParticipation;
  let results;
  let supportThreshold;
  let strategy;

  if (isErc20VotingProposal(proposal)) {
    // token
    token = {
      name: proposal.token.name,
      symbol: proposal.token.symbol,
    };

    // voters
    voters = getErc20Voters(
      proposal.votes,
      proposal.totalVotingWeight,
      proposal.token.decimals,
      proposal.token.symbol
    ).sort(a => (a.wallet === voter ? -1 : 0));

    // results
    results = getErc20Results(
      proposal.result,
      proposal.token.decimals,
      proposal.totalVotingWeight
    );

    // calculate participation
    const {currentPart, currentPercentage, minPart, missingPart, totalWeight} =
      getErc20VotingParticipation(
        proposal.settings.minTurnout,
        proposal.usedVotingWeight,
        proposal.totalVotingWeight,
        proposal.token.decimals
      );

    minParticipation = t('votingTerminal.participationErc20', {
      participation: minPart,
      totalWeight,
      tokenSymbol: token.symbol,
      percentage: Math.round(proposal.settings.minTurnout * 100),
    });

    currentParticipation = t('votingTerminal.participationErc20', {
      participation: currentPart,
      totalWeight,
      tokenSymbol: token.symbol,
      percentage: currentPercentage,
    });

    missingParticipation = missingPart;

    // support threshold
    supportThreshold = Math.round(proposal.settings.minSupport * 100);

    // strategy
    strategy = t('votingTerminal.tokenVoting');
    return {
      token,
      voters,
      results,
      strategy,
      supportThreshold,
      minParticipation,
      currentParticipation,
      missingParticipation,
      voteOptions: t('votingTerminal.yes+no'),
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
  // This method's return needs to be typed properly
  else if (
    isMultisigProposal(proposal) &&
    isMultisigVotingSettings(votingSettings)
  ) {
    // add members to Map of VoterType
    const mappedMembers = new Map(
      // map multisig members to voterType
      members
        ?.map(m => ({wallet: m.address, option: 'none'} as VoterType))
        .map(v => [v.wallet, v])
    );

    // loop through approvals and update vote option to approved;
    proposal.approvals.forEach(address => {
      // considering only members can approve, no need to check if Map has the key
      mappedMembers.set(address, {
        wallet: stripPlgnAdrFromProposalId(address),
        option: 'approved',
      });
    });

    return {
      approvals: proposal.approvals,
      minApproval: votingSettings.minApprovals,
      voters: [...mappedMembers.values()],
      strategy: t('votingTerminal.multisig'),
      voteOptions: t('votingTerminal.approve'),
    };
  }
}

export type MapToDetailedProposalParams = {
  creatorAddress: string;
  daoAddress: string;
  daoName: string;
  daoToken?: Erc20TokenDetails;
  totalVotingWeight: number | bigint;
  pluginSettings: VotingSettings;
  metadata: ProposalMetadata;
  proposalParams: ICreateProposalParams;
  proposalId: string;
};

/**
 * Map newly created proposal to Detailed proposal that can be cached and shown
 * @param params necessary parameters to map newly created proposal to augmented DetailedProposal
 * @returns Detailed proposal, ready for caching and displaying
 */
export function mapToDetailedProposal(params: MapToDetailedProposalParams) {
  // common properties
  const commonProps = {
    actions: params.proposalParams.actions || [],
    creationDate: new Date(),
    creatorAddress: params.creatorAddress,
    dao: {address: params.daoAddress, name: params.daoName},
    endDate: params.proposalParams.endDate!,
    startDate: params.proposalParams.startDate!,
    id: params.proposalId,
    metadata: params.metadata,
    status: ProposalStatus.PENDING,
    votes: [],
    settings: {
      minSupport: params.pluginSettings.supportThreshold,
      minTurnout: params.pluginSettings.minParticipation,
      duration: differenceInSeconds(
        params.proposalParams.startDate!,
        params.proposalParams.endDate!
      ),
    },
  };

  // erc20
  if (isErc20Token(params.daoToken)) {
    return {
      ...commonProps,
      token: {
        address: params.daoToken.address,
        decimals: params.daoToken.decimals,
        name: params.daoToken.name,
        symbol: params.daoToken.symbol,
      },
      totalVotingWeight: params.totalVotingWeight as bigint,
      usedVotingWeight: BigInt(0),
      result: {yes: BigInt(0), no: BigInt(0), abstain: BigInt(0)},
    } as CachedProposal;
  } else {
    // addressList
    return {
      ...commonProps,
      totalVotingWeight: params.totalVotingWeight as number,
      result: {yes: 0, no: 0, abstain: 0},
    } as CachedProposal;
  }
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
    } as TokenVotingProposal;
  }

  // TODO please add multisig vote config
  return {} as DetailedProposal;
}

/**
 * Strips proposal id of plugin address
 * @param proposalId id with following format:  *0x4206cdbc...a675cae35_0x0*
 * @returns proposal id without the pluginAddress
 * or the given proposal id if already stripped of the plugin address: *0x3*
 */
export function stripPlgnAdrFromProposalId(proposalId: string) {
  // return the "pure" contract proposal id or consider given proposal already stripped
  return proposalId?.split('_')[1] || proposalId;
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
  let parts = proposalId.split('_');

  // address already prefixed
  if (parts.length === 2) return proposalId;

  // get proposal number "0x00" => "00"
  parts = proposalId.split('0x');

  // proposal id is singular number without hex notation "2"
  if (parts.length === 1) {
    return `${pluginAddress}_0x${Number(parts[0]).toString(16)}`;
  }

  // proposal id is of the following format "0x1"
  if (parts[1] === '00') {
    // first proposal => 0x00
    return `${pluginAddress}_0x0`;
  } else {
    // other proposals => 0x3; removes leading zeros from contract proposal id
    // NOTE: Be very careful before modifying; in fact, leave it alone ;)
    return `${pluginAddress}_0x${parts[1].replace(/^0+/, '')}`;
  }
}

export function getVoteStatus(proposal: DetailedProposal, t: TFunction) {
  let label = '';

  switch (proposal.status) {
    case 'Pending':
      {
        const locale = (Locales as Record<string, Locale>)[i18n.language];
        const timeUntilNow = formatDistanceToNow(
          (proposal as TokenVotingProposal).startDate || new Date(),
          {
            includeSeconds: true,
            locale,
          }
        );

        label = t('votingTerminal.status.pending', {timeUntilNow});
      }
      break;
    case 'Active':
      {
        const locale = (Locales as Record<string, Locale>)[i18n.language];
        const timeUntilEnd = formatDistanceToNow(
          (proposal as TokenVotingProposal).endDate || new Date(),
          {
            includeSeconds: true,
            locale,
          }
        );

        label = t('votingTerminal.status.active', {timeUntilEnd});
      }
      break;
    case 'Succeeded':
      label = t('votingTerminal.status.succeeded');

      break;
    case 'Executed':
      label = t('votingTerminal.status.executed');

      break;
    case 'Defeated':
      label = isMultisigProposal(proposal)
        ? t('votingTerminal.status.expired')
        : t('votingTerminal.status.defeated');
  }
  return label;
}

export function getVoteButtonLabel(
  proposal: DetailedProposal,
  canVoteOrApprove: boolean,
  votedOrApproved: boolean,
  t: TFunction
) {
  let label = '';

  if (isMultisigProposal(proposal)) {
    label = votedOrApproved
      ? t('votingTerminal.status.approved')
      : t('votingTerminal.concluded');

    if (proposal.status === 'Pending') label = t('votingTerminal.approve');
    else if (proposal.status === 'Active' && !votedOrApproved)
      label = t('votingTerminal.approve');
  }

  if (isTokenBasedProposal(proposal)) {
    label = votedOrApproved
      ? canVoteOrApprove
        ? t('votingTerminal.status.revote')
        : t('votingTerminal.status.voteSubmitted')
      : t('votingTerminal.voteOver');

    if (proposal.status === 'Pending') label = t('votingTerminal.voteNow');
    else if (proposal.status === 'Active' && !votedOrApproved)
      label = t('votingTerminal.voteNow');
  }

  return label;
}

export function isEarlyExecutable(
  missingParticipation: number | undefined,
  proposal: DetailedProposal | undefined,
  results: ProposalVoteResults | undefined,
  votingMode: VotingMode | undefined
): boolean {
  if (
    missingParticipation === undefined ||
    votingMode !== VotingMode.EARLY_EXECUTION || // early execution disabled
    !isErc20VotingProposal(proposal) || // proposal is not token-based
    !results // no mapped data
  ) {
    return false;
  }

  // check if proposal can be executed early
  const votes: Record<keyof ProposalVoteResults, Big> = {
    yes: Big(0),
    no: Big(0),
    abstain: Big(0),
  };

  for (const voteType in results) {
    votes[voteType as keyof ProposalVoteResults] = Big(
      results[voteType as keyof ProposalVoteResults].value.toString()
    );
  }

  // renaming for clarity, should be renamed in later versions of sdk
  const supportThreshold = proposal.settings.minSupport;

  // those who didn't vote (this is NOT voting abstain)
  const absentee = formatUnits(
    proposal.totalVotingWeight - proposal.usedVotingWeight,
    proposal.token.decimals
  );

  return (
    // participation reached
    missingParticipation === 0 &&
    // support threshold met
    votes.yes.div(votes.yes.add(votes.no)).gt(supportThreshold) &&
    // even if absentees show up and all vote against, still cannot change outcome
    votes.yes.div(votes.yes.add(votes.no).add(absentee)).gt(supportThreshold)
  );
}

export function getProposalExecutionStatus(
  proposalStatus: ProposalStatus | undefined,
  canExecuteEarly: boolean,
  executionFailed: boolean
) {
  switch (proposalStatus) {
    case 'Succeeded':
      return executionFailed ? 'executable-failed' : 'executable';
    case 'Executed':
      return 'executed';
    case 'Defeated':
      return 'defeated';
    case 'Active':
      return canExecuteEarly ? 'executable' : 'default';
    case 'Pending':
    default:
      return 'default';
  }
}

/**
 * Filter out all empty add/remove address and minimul approval actions
 * @param actions supported actions
 * @returns list of non empty address
 */
export function getNonEmptyActions(
  actions: Array<Action>,
  minApprovals?: number
) {
  return actions.flatMap(action => {
    if (action.name === 'update_minimum_approval') {
      // minimum approval changed: return action or don't include
      return action.inputs.minimumApproval !== minApprovals ? action : [];
    } else if (action.name === 'add_address') {
      // address added to the list: return action or don't include
      return action.inputs.memberWallets.some(w => w.address === '')
        ? []
        : action;
    } else if (action.name === 'remove_address') {
      // address removed from the list: return action or don't include
      return action.inputs.memberWallets.length > 0 ? action : [];
    } else {
      // all other actions can go through
      return action;
    }
  });
}
