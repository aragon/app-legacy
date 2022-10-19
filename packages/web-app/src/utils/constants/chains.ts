/* SUPPORTED NETWORK TYPES ================================================== */

const SUPPORTED_CHAIN_ID = [1, 5, 137, 80001, 42161, 421611] as const;
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
export type SupportedNetworks = typeof SUPPORTED_NETWORKS[number];

export function isSupportedNetwork(
  network: string
): network is SupportedNetworks {
  return SUPPORTED_NETWORKS.some(n => n === network);
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
  },
  ethereum: {
    id: 1,
    name: 'Ethereum',
    domain: 'L1 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://etherscan.io/',
    testnet: false,
    rpc: ['https://api.mycryptoapi.com/eth', 'https://cloudflare-eth.com'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    domain: 'L2 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
    explorer: 'https://polygonscan.com/',
    testnet: false,
    rpc: ['https://polygon-rpc.com/', 'https://rpc-mainnet.matic.network'],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  'arbitrum-test': {
    id: 421611,
    name: 'Arbitrum Rinkeby',
    domain: 'L2 Blockchain',
    logo: 'https://bridge.arbitrum.io/logo.png',
    explorer: 'https://testnet.arbiscan.io/',
    testnet: true,
    rpc: ['https://rinkeby.arbitrum.io/rpc', 'wss://rinkeby.arbitrum.io/ws'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  goerli: {
    id: 5,
    name: 'Goerli',
    domain: 'L1 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://goerli.etherscan.io/',
    testnet: true,
    rpc: [
      'https://goerli.infura.io/v3/${INFURA_PROJECT_ID}',
      'wss://goerli.infura.io/ws/v3/${INFURA_PROJECT_ID}',
    ],
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  mumbai: {
    id: 80001,
    name: 'Mumbai',
    domain: 'L2 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
    explorer: 'https://mumbai.polygonscan.com/',
    testnet: true,
    rpc: [
      'https://matic-mumbai.chainstacklabs.com',
      'https://rpc-mumbai.maticvigil.com',
      'https://matic-testnet-archive-rpc.bwarelabs.com',
    ],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
};
