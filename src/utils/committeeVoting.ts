import {TFunction} from 'i18next';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';
import {Locale, formatDistanceToNow} from 'date-fns';
import * as Locales from 'date-fns/locale';

export function getCommitteVoteButtonLabel(
  executed: boolean,
  notBegan: boolean,
  voted: boolean,
  canApprove: boolean,
  approved: boolean,
  t: TFunction
) {
  if (approved || voted) {
    return t('votingTerminal.status.approved');
  }
  if (notBegan || canApprove) {
    return t('votingTerminal.approve');
  }
  return t('votingTerminal.concluded');
}

export function getApproveStatusLabel(
  proposal: GaslessVotingProposal,
  isApprovalPeriod: boolean,
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

    if (!isApprovalPeriod) {
      const timeUntilNow = formatDistanceToNow(proposal.endDate, {
        includeSeconds: true,
        locale,
      });
      label = t('votingTerminal.status.pending', {timeUntilNow});
    } else {
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
