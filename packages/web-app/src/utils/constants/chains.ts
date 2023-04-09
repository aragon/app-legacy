/* SUPPORTED NETWORK TYPES ================================================== */

import {infuraApiKey} from './api';

export const SUPPORTED_CHAIN_ID = [1, 5, 137, 80001, 42161, 421613] as const;
export type SupportedChainID = typeof SUPPORTED_CHAIN_ID[number];

export function isSupportedChainId(
  chainId: number
): chainId is SupportedChainID {
  return SUPPORTED_CHAIN_ID.some(id => id === chainId);
}

const SUPPORTED_NETWORKS = [
  'ethereum',
  'goerli',
  'polygon',
  'mumbai',
  'arbitrum',
  'arbitrum-test',
] as const;

export type availableNetworks = 'mainnet' | 'goerli' | 'polygon' | 'mumbai';

export type SupportedNetworks =
  | typeof SUPPORTED_NETWORKS[number]
  | 'unsupported';

export function isSupportedNetwork(
  network: string
): network is SupportedNetworks {
  return SUPPORTED_NETWORKS.some(n => n === network);
}

export function toSupportedNetwork(network: string): SupportedNetworks {
  return SUPPORTED_NETWORKS.some(n => n === network)
    ? (network as SupportedNetworks)
    : 'unsupported';
}

/**
 * Get the network name with given chain id
 * @param chainId Chain id
 * @returns the name of the supported network or undefined if network is unsupported
 */
export function getSupportedNetworkByChainId(
  chainId: number
): SupportedNetworks | undefined {
  if (isSupportedChainId(chainId)) {
    return Object.entries(CHAIN_METADATA).find(
      entry => entry[1].id === chainId
    )?.[0] as SupportedNetworks;
  }
}

export type NetworkDomain = 'L1 Blockchain' | 'L2 Blockchain';

/* CHAIN DATA =============================================================== */

export type NativeTokenData = {
  name: string;
  symbol: string;
  decimals: number;
};

export type ChainData = {
  id: SupportedChainID;
  name: string;
  domain: NetworkDomain;
  testnet: boolean;
  explorer: string;
  logo: string;
  rpc: string[];
  nativeCurrency: NativeTokenData;
  etherscanApi: string;
  alchemyApi: string;
};

export type ChainList = Record<SupportedNetworks, ChainData>;
export const CHAIN_METADATA: ChainList = {
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    domain: 'L2 Blockchain',
    logo: 'https://bridge.arbitrum.io/logo.png',
    explorer: 'https://arbiscan.io/',
    testnet: false,
    rpc: ['https://arb1.arbitrum.io/rpc', 'wss://arb1.arbitrum.io/ws'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api.arbiscan.io/api',
    alchemyApi: 'https://arb-mainnet.g.alchemy.com/v2',
  },
  ethereum: {
    id: 1,
    name: 'Ethereum',
    domain: 'L1 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://etherscan.io/',
    testnet: false,
    rpc: [
      `https://mainnet.infura.io/v3/${infuraApiKey}`,
      `wss://mainnet.infura.io/ws/v3/${infuraApiKey}`,
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api.etherscan.io/api',
    alchemyApi: 'https://eth-mainnet.g.alchemy.com/v2',
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    domain: 'L2 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
    explorer: 'https://polygonscan.com/',
    testnet: false,
    rpc: [
      `https://polygon-mainnet.infura.io/v3/${infuraApiKey}`,
      `wss://polygon-mainnet.infura.io/ws/v3/${infuraApiKey}`,
    ],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    etherscanApi: 'https://api.polygonscan.com/api',
    alchemyApi: 'https://polygon-mainnet.g.alchemy.com/v2',
  },
  'arbitrum-test': {
    id: 421613,
    name: 'Arbitrum Goerli',
    domain: 'L2 Blockchain',
    logo: 'https://bridge.arbitrum.io/logo.png',
    explorer: 'https://goerli-rollup-explorer.arbitrum.io/',
    testnet: true,
    rpc: ['https://goerli-rollup.arbitrum.io/rpc'],
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api-goerli.arbiscan.io/api',
    alchemyApi: 'https://arb-goerli.g.alchemy.com/v2',
  },
  goerli: {
    id: 5,
    name: 'Goerli',
    domain: 'L1 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://goerli.etherscan.io/',
    testnet: true,
    rpc: [
      `https://goerli.infura.io/v3/${infuraApiKey}`,
      `wss://goerli.infura.io/ws/v3/${infuraApiKey}`,
    ],
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api-goerli.etherscan.io/api',
    alchemyApi: 'https://eth-goerli.g.alchemy.com/v2',
  },
  mumbai: {
    id: 80001,
    name: 'Mumbai',
    domain: 'L2 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
    explorer: 'https://mumbai.polygonscan.com/',
    testnet: true,
    rpc: [
      `https://polygon-mumbai.infura.io/v3/${infuraApiKey}`,
      `wss://polygon-mumbai.infura.io/ws/v3/${infuraApiKey}`,
    ],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    etherscanApi: 'https://api-testnet.polygonscan.com/api',
    alchemyApi: 'https://polygon-mumbai.g.alchemy.com/v2',
  },
  unsupported: {
    id: 1,
    name: 'Unsupported',
    domain: 'L1 Blockchain',
    logo: '',
    explorer: '',
    testnet: false,
    rpc: [],
    nativeCurrency: {
      name: '',
      symbol: '',
      decimals: 18,
    },
    etherscanApi: '',
    alchemyApi: '',
  },
};
