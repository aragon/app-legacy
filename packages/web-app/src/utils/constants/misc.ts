import {
  IconCommunity,
  IconDashboard,
  IconFinance,
  IconGovernance,
  IconType,
  IconSettings,
} from '@aragon/ui-components';
import {BigNumber} from 'ethers';

import {i18n} from '../../../i18n.config';
import {Dashboard, Community, Finance, Governance, Settings} from '../paths';

/** Time period options for token price change */
export const enum TimeFilter {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
  // max = 'max',
}

export const enum TransactionState {
  WAITING = 'WAITING',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type NavLinkData = {
  path: string;
  label: string;
  icon: IconType;
};

export const NAV_LINKS_DATA: NavLinkData[] = [
  {
    label: i18n.t('navLinks.dashboard'),
    path: Dashboard,
    icon: IconDashboard,
  },
  {
    label: i18n.t('navLinks.governance'),
    path: Governance,
    icon: IconGovernance,
  },
  {label: i18n.t('navLinks.finance'), path: Finance, icon: IconFinance},
  {
    label: i18n.t('navLinks.community'),
    path: Community,
    icon: IconCommunity,
  },
  {
    label: i18n.t('navLinks.settings'),
    path: Settings,
    icon: IconSettings,
  },
];

export const EXPLORE_NAV_LINKS = [
  {
    label: i18n.t('navLinks.explore'),
    path: 'https://staging-app.aragon.org/',
  },
  {
    label: i18n.t('navLinks.learn'),
    path: 'https://aragon.org/how-to',
  },
  {
    label: i18n.t('navLinks.build'),
    path: 'https://devs.aragon.org/',
  },
  {
    label: i18n.t('navLinks.help'),
    path: 'https://documentation.aragon.org/aragon/readme',
  },
];

export const PRIVACY_NAV_LINKS = [
  {
    label: i18n.t('navLinks.terms'),
    path: 'https://aragon.org/terms-and-conditions',
  },
  {
    label: i18n.t('navLinks.privacy'),
    path: 'https://aragon.org/privacy-policy',
  },
];

export const enum TransferTypes {
  Deposit = 'VaultDeposit',
  Withdraw = 'VaultWithdraw',
}

// largest decimal that can be represented in 224 bits
// before adding the 18 decimals
export const MAX_TOKEN_AMOUNT = BigNumber.from(
  '26959946667150600000000000000000000000000000000000'
);

// TokenVoting duration boundaries
export const MAX_DURATION_DAYS = 365;
export const MIN_DURATION_HOURS = 1;

// Multisig duration boundaries
// Note: multisig does not contain a hard end boundary
export const MULTISIG_MIN_DURATION_HOURS = 1;

// recommended duration for multisig proposal
export const MULTISIG_REC_DURATION_DAYS = 5;
export const MULTISIG_MAX_REC_DURATION_DAYS = 30;

// lowest minimum approvals on multisig
export const MULTISIG_LOWEST_MIN_APPROVAL = 1;

// delay for correcting invalid user inputs
export const CORRECTION_DELAY = 2000;

// date time
export const HOURS_IN_DAY = 24;
export const MINS_IN_HOUR = 60;
export const MINS_IN_DAY = HOURS_IN_DAY * MINS_IN_HOUR;

export const PROPOSAL_STATE_LABELS = [
  i18n.t('governance.proposals.states.draft'),
  i18n.t('governance.proposals.states.pending'),
  i18n.t('governance.proposals.states.active'),
  i18n.t('governance.proposals.states.executed'),
  i18n.t('governance.proposals.states.succeeded'),
  i18n.t('governance.proposals.states.defeated'),
];

// Storage and cacheing keys
export const FAVORITE_DAOS_KEY = 'favoriteDaos';
export const PENDING_DEPOSITS_KEY = 'pendingDeposits';
export const PENDING_PROPOSALS_KEY = 'pendingProposals';
export const PENDING_MULTISIG_PROPOSALS_KEY = 'pendingMultisigProposals';
export const PENDING_VOTES_KEY = 'pendingVotes';
export const PENDING_MULTISIG_VOTES_KEY = 'pendingMultisigVotes';
export const PENDING_DAOS_KEY = 'pendingDaos';
export const PENDING_EXECUTION_KEY = 'pendingExecution';
export const PENDING_MULTISIG_EXECUTION_KEY = 'pendingMultisigExecution';
