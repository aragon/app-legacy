import {TFunction} from 'i18next';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';
import {formatDistanceToNow} from 'date-fns';

export function getCommitteVoteButtonLabel(
  executed: boolean,
  notBegan: boolean,
  voted: boolean,
  canApprove: boolean,
  approved: boolean,
  t: TFunction
) {
  if (executed) {
    return t('gaslessVotingTerminal.btnLabel.executed');
  }
  if (approved) {
    return t('gaslessVotingTerminal.btnLabel.approved');
  }
  if (notBegan) {
    return t('gaslessVotingTerminal.btnLabel.approve');
  }
  if (voted) {
    return t('gaslessVotingTerminal.btnLabel.voted');
  }
  if (canApprove) {
    return t('gaslessVotingTerminal.btnLabel.approve');
  }
  return t('gaslessVotingTerminal.btnLabel.concluded');
}

export function getApproveStatusLabel(
  proposal: GaslessVotingProposal,
  isApprovalPeriod: boolean,
  t: TFunction
) {
  let label = '';
  if (
    proposal.status === 'Pending' ||
    proposal.status === 'Active' ||
    proposal.status === 'Succeeded'
  ) {
    // Uncomment line below is causing SyntaxError: ambiguous indirect export: default 🤷‍♀️
    // const locale = (Locales as Record<string, Locale>)[i18n.language];

    if (!isApprovalPeriod) {
      const timeUntilNow = formatDistanceToNow(proposal.endDate, {
        includeSeconds: true,
        // locale,
      });
      label = t('votingTerminal.status.pending', {timeUntilNow});
    } else {
      const timeUntilEnd = formatDistanceToNow(proposal.expirationDate, {
        includeSeconds: true,
        // locale,
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
