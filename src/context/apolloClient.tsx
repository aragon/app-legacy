import {makeVar} from '@apollo/client';
import {
  DaoListItem,
  CreateDaoParams,
  DaoMetadata,
  InstalledPluginListItem,
  VotingMode,
} from '@aragon/sdk-client';
import {PluginInstallItem} from '@aragon/sdk-client-common';

import {
  FAVORITE_DAOS_KEY,
  PENDING_EXECUTION_KEY,
  PENDING_MULTISIG_EXECUTION_KEY,
  PENDING_MULTISIG_PROPOSALS_KEY,
  PENDING_MULTISIG_VOTES_KEY,
  PENDING_PROPOSALS_KEY,
  PENDING_VOTES_KEY,
  SupportedChainID,
  SupportedNetworks,
} from 'utils/constants';
import {customJSONReviver} from 'utils/library';
import {DetailedProposal, Erc20ProposalVote} from 'utils/types';

/*************************************************
 *            FAVORITE & SELECTED DAOS           *
 *************************************************/
// including description, type, and chain in anticipation for
// showing these daos on explorer page
export type NavigationDao = Omit<DaoListItem, 'metadata' | 'plugins'> & {
  chain: SupportedChainID;
  metadata: {
    name: string;
    avatar?: string;
    description?: string;
  };
  plugins: InstalledPluginListItem[] | PluginInstallItem[];
};
const favoriteDaos = JSON.parse(
  localStorage.getItem(FAVORITE_DAOS_KEY) || '[]'
);
const favoriteDaosVar = makeVar<Array<NavigationDao>>(favoriteDaos);

const selectedDaoVar = makeVar<NavigationDao>({
  address: '',
  ensDomain: '',
  metadata: {
    name: '',
    avatar: '',
  },
  chain: 5,
  plugins: [],
});

// TODO: Please switch keys from `daoAddress_proposalId` to
//  `pluginAddress_proposalId` when migrating because DAOs may have
// multiple installed plugins
/*************************************************
 *           PENDING VOTES & APPROVALS           *
 *************************************************/
// Token-based
export type PendingTokenBasedVotes = {
  /** key is: daoAddress_proposalId */
  [key: string]: Erc20ProposalVote;
};
const pendingVotes = JSON.parse(
  localStorage.getItem(PENDING_VOTES_KEY) || '{}',
  customJSONReviver
);

const pendingTokenBasedVotesVar = makeVar<PendingTokenBasedVotes>(pendingVotes);

//================ Multisig
export type PendingMultisigApprovals = {
  /** key is: daoAddress_proposalId; value: wallet address */
  [key: string]: string;
};
const pendingMultisigApprovals = JSON.parse(
  localStorage.getItem(PENDING_MULTISIG_VOTES_KEY) || '{}'
);

const pendingMultisigApprovalsVar = makeVar<PendingMultisigApprovals>(
  pendingMultisigApprovals
);

/*************************************************
 *                PENDING EXECUTION              *
 *************************************************/
// Token-based
export type PendingTokenBasedExecution = {
  /** key is: daoAddress_proposalId */
  [key: string]: boolean;
};
const pendingTokenBasedExecution = JSON.parse(
  localStorage.getItem(PENDING_EXECUTION_KEY) || '{}',
  customJSONReviver
);
const pendingTokenBasedExecutionVar = makeVar<PendingTokenBasedExecution>(
  pendingTokenBasedExecution
);

//================ Multisig
export type PendingMultisigExecution = {
  /** key is: daoAddress_proposalId */
  [key: string]: boolean;
};
const pendingMultisigExecution = JSON.parse(
  localStorage.getItem(PENDING_MULTISIG_EXECUTION_KEY) || '{}',
  customJSONReviver
);
const pendingMultisigExecutionVar = makeVar<PendingMultisigExecution>(
  pendingMultisigExecution
);

/*************************************************
 *                 PENDING PROPOSAL              *
 *************************************************/
// iffy about this structure
export type CachedProposal = Omit<
  DetailedProposal,
  'creationBlockNumber' | 'executionBlockNumber' | 'executionDate' | 'status'
> & {
  votingMode?: VotingMode;
  minApprovals?: number;
};

type PendingTokenBasedProposals = {
  // key is dao address
  [key: string]: {
    // key is ProposalId.toString()
    [key: string]: CachedProposal;
  };
};

const pendingTokenBasedProposals = JSON.parse(
  localStorage.getItem(PENDING_PROPOSALS_KEY) || '{}',
  customJSONReviver
);
const pendingTokenBasedProposalsVar = makeVar<PendingTokenBasedProposals>(
  pendingTokenBasedProposals
);

//================ Multisig
type PendingMultisigProposals = {
  // key is dao address
  [key: string]: {
    // key is proposal id
    [key: string]: CachedProposal;
  };
};

const pendingMultisigProposals = JSON.parse(
  localStorage.getItem(PENDING_MULTISIG_PROPOSALS_KEY) || '{}',
  customJSONReviver
);
const pendingMultisigProposalsVar = makeVar<PendingMultisigProposals>(
  pendingMultisigProposals
);

/*************************************************
 *                   PENDING DAOs                *
 *************************************************/
export type PendingDao = CreateDaoParams & {
  metadata: DaoMetadata;
  creationDate: Date;
};

export type PendingDaoCreation = {
  [key in SupportedNetworks]?: {
    // This key is the id of the newly created DAO
    [key: string]: PendingDao;
  };
};

export {
  favoriteDaosVar,
  selectedDaoVar,
  // votes
  pendingMultisigApprovalsVar,
  pendingTokenBasedVotesVar,
  // executions
  pendingMultisigExecutionVar,
  pendingTokenBasedExecutionVar,
  // proposals
  pendingMultisigProposalsVar,
  pendingTokenBasedProposalsVar,
};
