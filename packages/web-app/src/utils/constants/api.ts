import {SupportedNetworks} from './chains';

type SubgraphNetworkUrl = Record<SupportedNetworks, string | undefined>;

export const FEEDBACK_FORM = 'https://form.typeform.com/to/apg4gHYO';

export const SUBGRAPH_API_URL: SubgraphNetworkUrl = {
  //TODO: This is a temporary subgraph for ethereum should be replace with the right one
  ethereum:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-mainnet/api',
  goerli:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-goerli/api',
  polygon: undefined,
  mumbai:
    'https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-mumbai',
  arbitrum: undefined,
  'arbitrum-test': undefined,
};

export const BASE_URL = 'https://api.coingecko.com/api/v3';
export const DEFAULT_CURRENCY = 'usd';

// NOTE: These are dummy endpoints and API keys used as POC. They should be
// replaced by env var secrets in an upcoming PR.
export const INFURA_PROJECT_ID: Record<
  SupportedNetworks,
  string | boolean | undefined
> = {
  ethereum: import.meta.env.VITE_INFURA_MAINNET_PROJECT_ID,
  goerli: import.meta.env.VITE_INFURA_GOERLI_PROJECT_ID,
  polygon: undefined,
  mumbai: undefined,
  arbitrum: undefined,
  'arbitrum-test': undefined,
};

export const ARAGON_RPC = 'mainnet.eth.aragon.network';

export const IPFS_ENDPOINT = 'https://testing-ipfs-0.aragon.network/api/v0';

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
