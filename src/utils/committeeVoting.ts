import {TFunction} from 'i18next';
import {
  GaslessPluginVotingSettings,
  GaslessVotingProposal,
} from '@vocdoni/gasless-voting';
import {Locale, formatDistanceToNow} from 'date-fns';
import * as Locales from 'date-fns/locale';
import {ActionUpdateGaslessSettings} from './types';

export function getCommitteVoteButtonLabel(
  notBegan: boolean,
  voted: boolean,
  approved: boolean,
  isApprovalPeriod: boolean,
  executableWithNextApproval: boolean,
  t: TFunction
) {
  if (approved || voted) {
    return t('votingTerminal.status.approved');
  }
  if (notBegan || isApprovalPeriod) {
    return executableWithNextApproval
      ? t('votingTerminal.approveOnly')
      : t('votingTerminal.approve');
  }
  return t('votingTerminal.concluded');
}

export function getApproveStatusLabel(
  proposal: GaslessVotingProposal,
  t: TFunction,
  i18nLanguage: string
) {
  let label = '';

  if (
    proposal.status === 'Pending' ||
    proposal.status === 'Active' ||
    proposal.status === 'Succeeded'
  ) {
    const locale = (Locales as Record<string, Locale>)[i18nLanguage];

    // If proposal gasless voting is active yet
    if (proposal.endDate > new Date()) {
      const timeUntilNow = formatDistanceToNow(proposal.endDate, {
        includeSeconds: true,
        locale,
      });
      label = t('votingTerminal.status.pending', {timeUntilNow});
    }
    // If the status is succeeded but the approval period passed
    // So te proposal is nor active/succeeded neither executed
    else if (proposal.tallyEndDate < new Date()) {
      label = t('votingTerminal.status.succeeded');
    }
    // If is approval period
    else {
      const timeUntilEnd = formatDistanceToNow(proposal.tallyEndDate, {
        includeSeconds: true,
        locale,
      });
      label = t('votingTerminal.status.active', {timeUntilEnd});
    }
  } else if (proposal.status === 'Executed') {
    label = t('votingTerminal.status.executed');
  } else if (proposal.status === 'Defeated') {
    label = t('votingTerminal.status.defeated');
  }
  return label;
}

/**
 * Check if the modify gasless settings action contains different values than default settings
 * @param inputs the action inputs to be set
 * @param settings the current gasless settings
 */
export function isGaslessActionChangingSettings(
  inputs: ActionUpdateGaslessSettings['inputs'],
  settings: GaslessPluginVotingSettings
) {
  const isGovernanceChanged =
    inputs.minDuration !== settings.minDuration ||
    inputs.minParticipation !== settings.minParticipation ||
    inputs.minProposerVotingPower !== settings.minProposerVotingPower ||
    inputs.supportThreshold !== settings.supportThreshold;
  const isGaslessSpecificChanged =
    inputs.minTallyApprovals !== settings.minTallyApprovals ||
    inputs.minTallyDuration !== settings.minTallyDuration;

  return isGaslessSpecificChanged || isGovernanceChanged;
}
