import {TFunction} from 'react-i18next';
import {GaslessVotingProposal} from '@vocdoni/offchain-voting';
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
    return t('offchainVotingTerminal.btnLabel.executed');
  }
  if (approved) {
    return t('offchainVotingTerminal.btnLabel.approved');
  }
  if (notBegan) {
    return t('offchainVotingTerminal.btnLabel.approve');
  }
  if (voted) {
    return t('offchainVotingTerminal.btnLabel.voted');
  }
  if (canApprove) {
    return t('offchainVotingTerminal.btnLabel.approve');
  }
  return t('offchainVotingTerminal.btnLabel.concluded');
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
