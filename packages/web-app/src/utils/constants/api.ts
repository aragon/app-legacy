import {SupportedNetworks} from './chains';

type SubgraphNetworkUrl = Record<SupportedNetworks, string | undefined>;

export const FEEDBACK_FORM =
  'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3';

export const SUBGRAPH_API_URL: SubgraphNetworkUrl = {
  //TODO: This is a temporary subgraph for ethereum should be replace with the right one
  ethereum:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-mainnet/api',
  goerli:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-goerli/version/v1.0.0/api',
  polygon:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-polygon/api',
  mumbai:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-mumbai/api',
  arbitrum: undefined,
  'arbitrum-test': undefined,
  unsupported: undefined,
};

export const BASE_URL = 'https://api.coingecko.com/api/v3';
export const DEFAULT_CURRENCY = 'usd';

export const ARAGON_RPC = 'mainnet.eth.aragon.network';

type AlchemyApiKeys = Record<SupportedNetworks, string | undefined>;
export const alchemyApiKeys: AlchemyApiKeys = {
  arbitrum: undefined,
  'arbitrum-test': undefined,
  ethereum: import.meta.env.VITE_ALCHEMY_KEY_MAINNET as string,
  goerli: import.meta.env.VITE_ALCHEMY_KEY_GOERLI as string,
  polygon: import.meta.env.VITE_ALCHEMY_KEY_POLYGON_MAINNET as string,
  mumbai: import.meta.env.VITE_ALCHEMY_KEY_POLYGON_MUMBAI as string,
  unsupported: undefined,
};

export const infuraApiKey = import.meta.env
  .VITE_INFURA_MAINNET_PROJECT_ID as string;

export const IPFS_ENDPOINT_TEST =
  'https://testing-ipfs-0.aragon.network/api/v0';
export const IPFS_ENDPOINT_MAIN_0 = 'https://ipfs-0.aragon.network/api/v0';
export const IPFS_ENDPOINT_MAIN_1 = 'https://ipfs-1.aragon.network/api/v0';

// using Aragon node for avatar resolving
export const AVATAR_IPFS_URL = 'https://ipfs.eth.aragon.network/ipfs';

// Coingecko Api specific asset platform keys
export const ASSET_PLATFORMS: Record<SupportedNetworks, string | null> = {
  arbitrum: 'arbitrum-one',
  'arbitrum-test': null,
  ethereum: 'ethereum',
  goerli: null,
  polygon: 'polygon-pos',
  mumbai: null,
  unsupported: null,
};

export const NATIVE_TOKEN_ID = {
  default: 'ethereum',
  polygon: 'matic-network',
};
