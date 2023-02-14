import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  makeVar,
  NormalizedCacheObject,
} from '@apollo/client';
import {
  DaoListItem,
  Deposit,
  CreateDaoParams,
  DaoMetadata,
  InstalledPluginListItem,
  IPluginInstallItem,
} from '@aragon/sdk-client';
import {RestLink} from 'apollo-link-rest';
import {CachePersistor, LocalStorageWrapper} from 'apollo3-cache-persist';

import {
  BASE_URL,
  FAVORITE_DAOS_KEY,
  PENDING_DAOS_KEY,
  PENDING_DEPOSITS_KEY,
  PENDING_EXECUTION_KEY,
  PENDING_MULTISIG_VOTES_KEY,
  PENDING_PROPOSALS_KEY,
  PENDING_VOTES_KEY,
  SUBGRAPH_API_URL,
  SupportedChainID,
  SupportedNetworks,
} from 'utils/constants';
import {customJSONReviver} from 'utils/library';
import {DetailedProposal, Erc20ProposalVote} from 'utils/types';
import {PRIVACY_KEY} from './privacyContext';

const restLink = new RestLink({
  uri: BASE_URL,
});

const cache = new InMemoryCache();

// add the REST API's typename you want to persist here
const entitiesToPersist = ['tokenData'];

// check if cache should be persisted or restored based on user preferences
const value = localStorage.getItem(PRIVACY_KEY);
if (value && JSON.parse(value).functional) {
  const persistor = new CachePersistor({
    cache,
    // TODO: Check and update the size needed for the cache
    maxSize: 5242880, // 5 MiB
    storage: new LocalStorageWrapper(window.localStorage),
    debug: process.env.NODE_ENV === 'development',
    persistenceMapper: async (data: string) => {
      const parsed = JSON.parse(data);

      const mapped: Record<string, unknown> = {};
      const persistEntities: string[] = [];
      const rootQuery = parsed['ROOT_QUERY'];

      mapped['ROOT_QUERY'] = Object.keys(rootQuery).reduce(
        (obj: Record<string, unknown>, key: string) => {
          if (key === '__typename') return obj;

          const keyWithoutArgs = key.substring(0, key.indexOf('('));
          if (entitiesToPersist.includes(keyWithoutArgs)) {
            obj[key] = rootQuery[key];

            if (Array.isArray(rootQuery[key])) {
              const entities = rootQuery[key].map(
                (item: Record<string, unknown>) => item.__ref
              );
              persistEntities.push(...entities);
            } else {
              const entity = rootQuery[key].__ref;
              persistEntities.push(entity);
            }
          }

          return obj;
        },
        {__typename: 'Query'}
      );

      persistEntities.reduce((obj, key) => {
        obj[key] = parsed[key];
        return obj;
      }, mapped);

      return JSON.stringify(mapped);
    },
  });

  const restoreApolloCache = async () => {
    await persistor.restore();
  };

  restoreApolloCache();
}

export const goerliClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['goerli']})),
});

const mumbaiClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['mumbai']})),
});

const arbitrumTestClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['arbitrum-test']})),
});

// TODO: remove undefined when all clients are defined
const client: Record<
  SupportedNetworks,
  ApolloClient<NormalizedCacheObject> | undefined
> = {
  ethereum: undefined,
  goerli: goerliClient,
  polygon: undefined,
  mumbai: mumbaiClient,
  arbitrum: undefined,
  'arbitrum-test': arbitrumTestClient,
};

// FAVORITE & SELECTED DAOS
// including description, type, and chain in anticipation for
// showing these daos on explorer page
export type NavigationDao = Omit<DaoListItem, 'metadata' | 'plugins'> & {
  chain: SupportedChainID;
  metadata: {
    name: string;
    avatar?: string;
    description?: string;
  };
  plugins: InstalledPluginListItem[] | IPluginInstallItem[];
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

// PENDING DEPOSITS
const depositTxs = JSON.parse(
  localStorage.getItem(PENDING_DEPOSITS_KEY) || '[]',
  customJSONReviver
);
const pendingDeposits = makeVar<Deposit[]>(depositTxs);

// PENDING VOTES & APPROVALS
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

// Multisig
export type PendingMultisigApprovals = {
  /** key is: daoAddress_proposalId; value: wallet address */
  [key: string]: string;
};
const pendingMultisigVotes = JSON.parse(
  localStorage.getItem(PENDING_MULTISIG_VOTES_KEY) || '{}'
);

const pendingMultisigVotesVar =
  makeVar<PendingMultisigApprovals>(pendingMultisigVotes);

// PENDING EXECUTION
type PendingExecution = {
  /** key is: daoAddress_proposalId */
  [key: string]: boolean;
};
const pendingExecution = JSON.parse(
  localStorage.getItem(PENDING_EXECUTION_KEY) || '{}',
  customJSONReviver
);
const pendingExecutionVar = makeVar<PendingExecution>(pendingExecution);

// PENDING PROPOSAL
// iffy about this structure
export type CachedProposal = Omit<
  DetailedProposal,
  'creationBlockNumber' | 'executionBlockNumber' | 'executionDate'
>;
type PendingProposals = {
  // key is dao address
  [key: string]: {
    // key is proposal id
    [key: string]: CachedProposal;
  };
};

const pendingProposals = JSON.parse(
  localStorage.getItem(PENDING_PROPOSALS_KEY) || '{}',
  customJSONReviver
);
const pendingProposalsVar = makeVar<PendingProposals>(pendingProposals);

type PendingDaoCreation = {
  [key in SupportedNetworks]?: {
    // This key is the id of the newly created DAO
    [key: string]: {
      daoCreationParams: CreateDaoParams;
      daoMetadata: DaoMetadata;
    };
  };
};
const pendingDaoCreation = JSON.parse(
  localStorage.getItem(PENDING_DAOS_KEY) || '{}'
);
const pendingDaoCreationVar = makeVar<PendingDaoCreation>(pendingDaoCreation);

export {
  client,
  favoriteDaosVar,
  selectedDaoVar,
  pendingDeposits,
  pendingProposalsVar,
  pendingTokenBasedVotesVar,
  pendingMultisigVotesVar,
  pendingDaoCreationVar,
  pendingExecutionVar,
};
