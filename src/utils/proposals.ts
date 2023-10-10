/**
 * This file contains helpers for mapping a proposal
 * to voting terminal properties. Doesn't exactly belong
 * here, but couldn't leave in the Proposal Details page,
 * so open to suggestions.
 */

import {ModeType, ProgressStatusProps, VoterType} from '@aragon/ods-old';
import {
  CreateMajorityVotingProposalParams,
  Erc20TokenDetails,
  MajorityVotingSettings,
  MultisigProposal,
  MultisigVotingSettings,
  TokenVotingProposal,
  TokenVotingProposalResult,
  VoteValues,
  VotingMode,
  VotingSettings,
} from '@aragon/sdk-client';
import {ProposalMetadata, ProposalStatus} from '@aragon/sdk-client-common';
import Big from 'big.js';
import {Locale, format, formatDistanceToNow} from 'date-fns';
import * as Locales from 'date-fns/locale';
import {TFunction} from 'i18next';

import {ProposalVoteResults} from 'containers/votingTerminal';
import {MultisigDaoMember} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
} from 'services/aragon-sdk/queries/use-voting-settings';
import {i18n} from '../../i18n.config';
import {KNOWN_FORMATS, getFormattedUtcOffset} from './date';
import {formatUnits} from './library';
import {abbreviateTokenAmount} from './tokens';
import {
  Action,
  DetailedProposal,
  ProposalListItem,
  StrictlyExclude,
  SupportedProposals,
  SupportedVotingSettings,
} from './types';
import {GaslessVotingProposal} from '@vocdoni/offchain-voting';
import {
  isGaslessVotingSettings,
  isMultisigVotingSettings,
} from 'hooks/usePluginSettings';

export type TokenVotingOptions = StrictlyExclude<
  VoterType['option'],
  'approved' | 'none'
>;

const MappedVotes: {
  [key in VoteValues]: TokenVotingOptions;
} = {
  1: 'abstain',
  2: 'yes',
  3: 'no',
};

const formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0, // Minimum number of decimal places
  maximumFractionDigits: 2, // Maximum number of decimal places
});

// this type guard will need to evolve when there are more types
export function isTokenBasedProposal(
  proposal: SupportedProposals | undefined | null
): proposal is TokenVotingProposal {
  if (!proposal) return false;
  return 'token' in proposal;
}

function isErc20Token(
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
  proposal: SupportedProposals | undefined | null
): proposal is MultisigProposal {
  if (!proposal) return false;
  return 'approvals' in proposal;
}

export function isGaslessProposal(
  proposal: SupportedProposals | undefined
): proposal is GaslessVotingProposal {
  if (!proposal) return false;
  return 'vochainProposalId' in proposal;
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
function getErc20Voters(
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
      src: vote.address,
      wallet: vote.address,
      option: MappedVotes[vote.vote],
      votingPower,
      tokenAmount,
      voteReplaced: vote.voteReplaced,
    };
  });
}

/**
 * Get the mapped result of ERC20 voting proposal vote
 * @param result result of votes on proposal
 * @param tokenDecimals number of decimals in token
 * @returns mapped voting result
 */
export function getErc20Results(
  result: TokenVotingProposalResult,
  tokenDecimals: number
): ProposalVoteResults {
  const {yes, no, abstain} = result;

  const totalYesNo = Big(yes.toString()).plus(no.toString());

  // TODO: Format with new ODS formatter
  return {
    yes: {
      value: formatter.format(Number(formatUnits(yes, tokenDecimals))),
      percentage: getVotePercentage(yes, totalYesNo),
    },
    no: {
      value: formatter.format(Number(formatUnits(no, tokenDecimals))),
      percentage: getVotePercentage(no, totalYesNo),
    },
    abstain: {
      value: formatter.format(Number(formatUnits(abstain, tokenDecimals))),
      percentage: getVotePercentage(abstain, totalYesNo),
    },
  };
}

function getVotePercentage(value: bigint, totalYesNo: Big): number {
  const vote = Big(value.toString());

  // no yes + no votes
  if (totalYesNo.eq(0)) {
    if (vote.gt(0)) {
      // vote before yes + no votes have been casted
      return 100;
    } else {
      // no votes casted yet/divide by zero
      return 0;
    }
  }

  return Number(formatter.format(vote.mul(100).div(totalYesNo).toNumber()));
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
  pluginType: PluginTypes,
  startDate: Date,
  endDate: Date,
  creationDate: Date,
  publishedBlock: string,
  executionFailed: boolean,
  executionBlock?: string,
  executionDate?: Date
): Array<ProgressStatusProps> {
  switch (status) {
    case ProposalStatus.ACTIVE:
      return [
        {...getPublishedProposalStep(t, creationDate, publishedBlock)},
        {...getActiveProposalStep(t, startDate, 'active')},
      ];
    case ProposalStatus.DEFEATED:
      return [
        {...getPublishedProposalStep(t, creationDate, publishedBlock)},
        {...getActiveProposalStep(t, startDate, 'done')},
        {
          label:
            pluginType === 'token-voting.plugin.dao.eth'
              ? t('governance.statusWidget.defeated')
              : t('governance.statusWidget.expired'),
          mode: 'failed',
          date: `${format(
            endDate,
            KNOWN_FORMATS.proposals
          )}  ${getFormattedUtcOffset()}`,
        },
      ];
    case ProposalStatus.SUCCEEDED:
      if (executionFailed)
        return [
          ...getEndedProposalSteps(
            t,
            creationDate,
            startDate,
            endDate,
            publishedBlock
          ),
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
          ...getEndedProposalSteps(
            t,
            creationDate,
            startDate,
            endDate,
            publishedBlock
          ),
          {
            label: t('governance.statusWidget.executed'),
            mode: 'upcoming',
          },
        ];
    case ProposalStatus.EXECUTED:
      if (executionDate)
        return [
          ...getEndedProposalSteps(
            t,
            creationDate,
            startDate,
            endDate,
            publishedBlock,
            executionDate || new Date()
          ),
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
          ...getEndedProposalSteps(
            t,
            creationDate,
            startDate,
            endDate,
            publishedBlock
          ),
          {label: t('governance.statusWidget.failed'), mode: 'failed'},
        ];

    // Pending by default
    default:
      return [{...getPublishedProposalStep(t, creationDate, publishedBlock)}];
  }
}

function getEndedProposalSteps(
  t: TFunction,
  creationDate: Date,
  startDate: Date,
  endDate: Date,
  block: string,
  executionDate?: Date
): Array<ProgressStatusProps> {
  return [
    {...getPublishedProposalStep(t, creationDate, block)},
    {...getActiveProposalStep(t, startDate, 'done')},
    {
      label: t('governance.statusWidget.succeeded'),
      mode: 'done',
      date: `${format(
        executionDate! < endDate ? executionDate! : endDate,
        KNOWN_FORMATS.proposals
      )}  ${getFormattedUtcOffset()}`,
    },
  ];
}

function getPublishedProposalStep(
  t: TFunction,
  creationDate: Date,
  block: string | undefined
): ProgressStatusProps {
  return {
    label: t('governance.statusWidget.published'),
    date: `${format(
      creationDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`,
    mode: 'done',
    ...(block && {block}),
  };
}

function getActiveProposalStep(t: TFunction, startDate: Date, mode: ModeType) {
  return {
    label: t('governance.statusWidget.active'),
    mode,
    date: `${format(
      startDate,
      KNOWN_FORMATS.proposals
    )}  ${getFormattedUtcOffset()}`,
  };
}

/**
 * get transformed data for terminal
 * @param proposal
 * @returns transformed data for terminal
 */
export function getLiveProposalTerminalProps(
  t: TFunction,
  proposal: DetailedProposal,
  voter: string | null,
  votingSettings: SupportedVotingSettings,
  members?: MultisigDaoMember[]
) {
  let token;
  let voters: Array<VoterType>;
  let currentParticipation;
  let minParticipation;
  let missingParticipation;
  let results;
  let supportThreshold;
  let strategy;

  if (isGaslessProposal(proposal) && isGaslessVotingSettings(votingSettings)) {
    // token
    token = {
      name: proposal.token.name,
      symbol: proposal.token.symbol,
    };

    // voters
    // todo(kon): implement voters
    voters = [];
    // getErc20Voters(
    //   proposal.votes,
    //   proposal.totalVotingWeight,
    //   proposal.token.decimals,
    //   proposal.token.symbol
    // ).sort((a, b) => {
    //   const x = Number(a.votingPower?.slice(0, a.votingPower.length - 1));
    //   const y = Number(b.votingPower?.slice(0, b.votingPower.length - 1));

    //   return x > y ? -1 : 1;
    // });

    // results
    const results: ProposalVoteResults = getErc20Results(
      proposal.vochain.tally.parsed,
      proposal.token.decimals,
      proposal.totalVotingWeight
    );
    // calculate participation
    const {currentPart, currentPercentage, minPart, missingPart, totalWeight} =
      getErc20VotingParticipation(
        proposal.settings.minParticipation,
        proposal.totalUsedWeight,
        proposal.totalVotingWeight,
        proposal.token.decimals
      );

    minParticipation = t('votingTerminal.participationErc20', {
      participation: minPart,
      totalWeight,
      tokenSymbol: token.symbol,
      percentage: Math.round(proposal.settings.minParticipation * 100),
    });

    currentParticipation = t('votingTerminal.participationErc20', {
      participation: currentPart,
      totalWeight,
      tokenSymbol: token.symbol,
      percentage: currentPercentage,
    });

    missingParticipation = missingPart;

    // support threshold
    supportThreshold = Math.round(proposal.settings.supportThreshold * 100);

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
  } else if (isErc20VotingProposal(proposal)) {
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
    ).sort((a, b) => {
      const x = Number(a.votingPower?.slice(0, a.votingPower.length - 1));
      const y = Number(b.votingPower?.slice(0, b.votingPower.length - 1));

      return x > y ? -1 : 1;
    });

    // results
    results = getErc20Results(proposal.result, proposal.token.decimals);

    // calculate participation
    const {currentPart, currentPercentage, minPart, missingPart, totalWeight} =
      getErc20VotingParticipation(
        proposal.settings.minParticipation,
        proposal.usedVotingWeight,
        proposal.totalVotingWeight,
        proposal.token.decimals
      );

    minParticipation = t('votingTerminal.participationErc20', {
      participation: minPart,
      totalWeight,
      tokenSymbol: token.symbol,
      percentage: Math.round(proposal.settings.minParticipation * 100),
    });

    currentParticipation = t('votingTerminal.participationErc20', {
      participation: currentPart,
      totalWeight,
      tokenSymbol: token.symbol,
      percentage: currentPercentage,
    });

    missingParticipation = missingPart;

    // support threshold
    supportThreshold = Math.round(proposal.settings.supportThreshold * 100);

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
      members?.map(member => [
        member.address,
        {wallet: member.address, option: 'none'} as VoterType,
      ])
    );

    // loop through approvals and update vote option to approved;
    let approvalAddress;
    proposal.approvals.forEach(address => {
      approvalAddress = stripPlgnAdrFromProposalId(address).toLowerCase();

      // considering only members can approve, no need to check if Map has the key
      mappedMembers.set(approvalAddress, {
        wallet: approvalAddress,
        src: approvalAddress,
        option: 'approved',
      });
    });

    return {
      approvals: proposal.approvals,
      minApproval: proposal.settings.minApprovals,
      voters: [...mappedMembers.values()],
      strategy: t('votingTerminal.multisig.strategy'),
      voteOptions: t('votingTerminal.approve'),
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
}

export type CacheProposalParams = {
  creatorAddress: string;
  daoAddress: string;
  daoName: string;
  metadata: ProposalMetadata;
  proposalParams: CreateMajorityVotingProposalParams;
  id: string;
  status: ProposalStatus;

  // Multisig props
  minApprovals?: number;
  onlyListed?: boolean;

  // TokenVoting props
  daoToken?: Erc20TokenDetails;
  pluginSettings?: VotingSettings;
  totalVotingWeight?: bigint;
};

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

export function getVoteStatus(proposal: DetailedProposal, t: TFunction) {
  let label = '';

  switch (proposal.status) {
    case 'Pending':
      {
        const locale = (Locales as Record<string, Locale>)[i18n.language];
        const timeUntilNow = formatDistanceToNow(proposal.startDate, {
          includeSeconds: true,
          locale,
        });

        label = t('votingTerminal.status.pending', {timeUntilNow});
      }
      break;
    case 'Active':
      {
        const locale = (Locales as Record<string, Locale>)[i18n.language];
        const timeUntilEnd = formatDistanceToNow(proposal.endDate, {
          includeSeconds: true,
          locale,
        });

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
  voteSettings: MajorityVotingSettings | MultisigVotingSettings,
  votedOrApproved: boolean,
  executableWithNextApproval: boolean,
  t: TFunction
): string {
  if (isMultisigProposal(proposal)) {
    return getMultisigLabel(
      proposal,
      votedOrApproved,
      executableWithNextApproval,
      t
    );
  }

  if (isTokenBasedProposal(proposal) && isTokenVotingSettings(voteSettings)) {
    return getTokenBasedLabel(proposal, voteSettings, votedOrApproved, t);
  }

  return '';
}

function getMultisigLabel(
  proposal: MultisigProposal,
  votedOrApproved: boolean,
  executableWithNextApproval: boolean,
  t: TFunction
): string {
  if (
    proposal.status === ProposalStatus.PENDING ||
    (proposal.status === ProposalStatus.ACTIVE && !votedOrApproved)
  ) {
    return executableWithNextApproval
      ? t('votingTerminal.approveOnly')
      : t('votingTerminal.approve');
  }

  return votedOrApproved
    ? t('votingTerminal.status.approved')
    : t('votingTerminal.concluded');
}

function getTokenBasedLabel(
  proposal: TokenVotingProposal,
  voteSettings: MajorityVotingSettings,
  voted: boolean,
  t: TFunction
): string {
  if (proposal.status === ProposalStatus.PENDING) {
    return t('votingTerminal.voteNow');
  }

  if (voted) {
    // voted on plugin with voteReplacement
    if (
      proposal.status === ProposalStatus.ACTIVE &&
      voteSettings.votingMode === VotingMode.VOTE_REPLACEMENT
    ) {
      return t('votingTerminal.status.revote');
    }

    return t('votingTerminal.status.voteSubmitted');
  }

  // have not voted
  return proposal.status === ProposalStatus.ACTIVE
    ? t('votingTerminal.voteNow')
    : t('votingTerminal.voteOver');
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
  const supportThreshold = proposal.settings.supportThreshold;

  // those who didn't vote (this is NOT voting abstain)
  const absentee = formatUnits(
    proposal.totalVotingWeight - proposal.usedVotingWeight,
    proposal.token.decimals
  );

  if (votes.yes.eq(Big(0))) return false;

  return (
    // participation reached
    missingParticipation === 0 &&
    // support threshold met even if absentees show up and all vote against, still cannot change outcome
    votes.yes.div(votes.yes.add(votes.no).add(absentee)).gt(supportThreshold)
  );
}

export function getProposalExecutionStatus(
  proposalStatus: ProposalStatus | undefined,
  canExecuteEarly: boolean,
  executionFailed: boolean,
  isGaselessProposalExecutable?: boolean // Additional checks for gasless proposals. Undefined for others
) {
  switch (proposalStatus) {
    case 'Succeeded':
      if (executionFailed) {
        return 'executable-failed';
      }
      // Condition will be false if undefined
      if (isGaselessProposalExecutable === false) {
        return 'default';
      }
      return 'executable';
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
  msVoteSettings?: MultisigVotingSettings
) {
  return actions.flatMap(action => {
    if (action.name === 'modify_multisig_voting_settings') {
      // minimum approval or onlyListed changed: return action or don't include
      return action.inputs.minApprovals !== msVoteSettings?.minApprovals ||
        action.inputs.onlyListed !== msVoteSettings.onlyListed
        ? action
        : [];
    } else if (action.name === 'add_address') {
      // strip empty inputs off

      const finalAction = {
        ...action,
        inputs: {
          memberWallets: action.inputs.memberWallets.filter(
            item => !!item.address
          ),
        },
      };

      return finalAction.inputs.memberWallets.length > 0 ? finalAction : [];
    } else if (action.name === 'remove_address') {
      // address removed from the list: return action or don't include
      return action.inputs.memberWallets.length > 0 ? action : [];
    } else {
      // all other actions can go through
      return action;
    }
  });
}

/**
 * Recalculates the status of a proposal.
 * @template T - A type that extends DetailedProposal or ProposalListItem
 * @param proposal - The proposal to recalculate the status of
 * @returns The proposal with recalculated status,
 * or null/undefined if the input was null/undefined
 */
export function recalculateProposalStatus<
  T extends DetailedProposal | ProposalListItem,
>(proposal: T | null | undefined): T | null | undefined {
  if (proposal?.status === ProposalStatus.SUCCEEDED) {
    const endTime = proposal.endDate.getTime();
    // prioritize active state over succeeded one if end time has yet
    // to be met
    if (endTime >= Date.now())
      return {...proposal, status: ProposalStatus.ACTIVE};

    // for an inactive multisig proposal, make sure a vote has actually been cast
    // or that the end time isn't in the past
    if (isMultisigProposal(proposal)) {
      if (endTime < Date.now() || proposal.approvals.length === 0)
        return {...proposal, status: ProposalStatus.DEFEATED};
    }
  }
  return proposal;
}
