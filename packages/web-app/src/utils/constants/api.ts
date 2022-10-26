import {SupportedNetworks} from './chains';

type SubgraphNetworkUrl = Record<SupportedNetworks, string | undefined>;

export const SUBGRAPH_API_URL: SubgraphNetworkUrl = {
  ethereum: undefined,
  goerli:
    'https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-goerli',
  polygon: undefined,
  mumbai:
    'https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-mumbai',
  arbitrum: undefined,
  'arbitrum-test':
    'https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-arbitrum-rinkeby',
};

export const BASE_URL = 'https://api.coingecko.com/api/v3';
export const DEFAULT_CURRENCY = 'usd';

// NOTE: These are dummy endpoints and API keys used as POC. They should be
// replaced by env var secrets in an upcoming PR.
export const ALCHEMY_API_KEY = 'dWiL89bA8nrsJW1GIBZ5Sq7kHGmT40av';
export const INFURA_PROJECT_ID = '000bb62a6d1f4b478f2910ab8118bad1';
export const INFURA_PROJECT_ID_ARB = '92aa62d2bb5449cfafe04b83ca8636f1';

// Coingecko Api specific asset platform keys
export const ASSET_PLATFORMS: Record<SupportedNetworks, string | null> = {
  arbitrum: 'arbitrum-one',
  'arbitrum-test': null,
  ethereum: 'ethereum',
  goerli: null,
  polygon: 'polygon-pos',
  mumbai: null,
};

export const NATIVE_TOKEN_ID = {
  default: 'ethereum',
  polygon: 'matic-network',
};
