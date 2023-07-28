import {SupportedNetworks} from './chains';

type SubgraphNetworkUrl = Record<SupportedNetworks, string | undefined>;

export const FEEDBACK_FORM =
  'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3';

export const SUBGRAPH_API_URL: SubgraphNetworkUrl = {
  arbitrum: undefined,
  'arbitrum-test': undefined,
  base: undefined, //TODO: add subgraph url when available
  'base-goerli': undefined, //TODO: add subgraph url when available
  ethereum:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-mainnet/version/v1.2.1/api',
  goerli:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-goerli/version/v1.2.2/api',
  mumbai:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-mumbai/version/v1.2.2/api',
  polygon:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-polygon/version/v1.2.1/api',
  unsupported: undefined,
};

export const ARAGON_RPC = 'mainnet.eth.aragon.network';

type AlchemyApiKeys = Record<SupportedNetworks, string | undefined>;
export const alchemyApiKeys: AlchemyApiKeys = {
  arbitrum: undefined,
  'arbitrum-test': undefined,
  base: undefined,
  'base-goerli': undefined,
  ethereum: import.meta.env.VITE_ALCHEMY_KEY_MAINNET as string,
  goerli: import.meta.env.VITE_ALCHEMY_KEY_GOERLI as string,
  mumbai: import.meta.env.VITE_ALCHEMY_KEY_POLYGON_MUMBAI as string,
  polygon: import.meta.env.VITE_ALCHEMY_KEY_POLYGON_MAINNET as string,
  unsupported: undefined,
};

export const infuraApiKey = import.meta.env
  .VITE_INFURA_MAINNET_PROJECT_ID as string;

export const walletConnectProjectID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID as string;

export const COVALENT_API_KEY = import.meta.env.VITE_COVALENT_API_KEY as string;

export type ApiMetadata = {
  /**
   * Id of the network as defined by the API.
   */
  networkId: string;
  /**
   * Id of the native token as defined by the API.
   */
  nativeTokenId: string;
};

/**
 * Metadata for Coingecko API, use mainnet endpoints for testnets.
 */
export const coingeckoMetadata: Record<SupportedNetworks, ApiMetadata | null> =
  {
    arbitrum: {
      networkId: 'arbitrum-one',
      nativeTokenId: 'arbitrum',
    },
    'arbitrum-test': null,
    ethereum: {
      networkId: 'ethereum',
      nativeTokenId: 'ethereum',
    },
    goerli: null,
    polygon: {
      networkId: 'polygon-pos',
      nativeTokenId: 'matic-network',
    },
    mumbai: null,
    base: null,
    'base-goerli': null,
    unsupported: null,
  };

export const covalentMetadata: Record<SupportedNetworks, ApiMetadata | null> = {
  arbitrum: null,
  'arbitrum-test': null,
  ethereum: null,
  goerli: null,
  polygon: null,
  mumbai: null,
  base: {
    networkId: 'base-mainnet',
    nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  },
  'base-goerli': null,
  unsupported: null,
};
