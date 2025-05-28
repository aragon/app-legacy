/* SUPPORTED NETWORK TYPES ================================================== */

import {i18n} from '../../../i18n.config';

export const SUPPORTED_CHAIN_ID = [
  1, 5, 137, 300, 324, 8453, 80001, 84531, 42161, 421613, 11155111,
] as const;

export type SupportedChainID = (typeof SUPPORTED_CHAIN_ID)[number];

export function isSupportedChainId(
  chainId: number
): chainId is SupportedChainID {
  return SUPPORTED_CHAIN_ID.some(id => id === chainId);
}

// Networks supported by the Gasless voting plugin
export const GASLESS_SUPPORTED_NETWORKS: SupportedNetworks[] = ['sepolia'];

export const ENS_SUPPORTED_NETWORKS: SupportedNetworks[] = ['ethereum'];
export const NETWORKS_WITH_CUSTOM_REGISTRY: SupportedNetworks[] = [
  'arbitrum',
  'base',
  'polygon',
  'sepolia',
  'zksyncMainnet',
  'zksyncSepolia',
];

export const L2_NETWORKS = NETWORKS_WITH_CUSTOM_REGISTRY;

const SUPPORTED_NETWORKS = [
  'arbitrum',
  'base',
  'ethereum',
  'polygon',
  'sepolia',
  'zksyncMainnet',
  'zksyncSepolia',
] as const;

export type SupportedNetworks =
  | (typeof SUPPORTED_NETWORKS)[number]
  | 'unsupported';

export function toSupportedNetwork(network: string): SupportedNetworks {
  return SUPPORTED_NETWORKS.some(n => n === network)
    ? (network as SupportedNetworks)
    : 'unsupported';
}

/**
 * Get the network name with given chain id
 * @param chainId Chain id
 * @returns the name of the supported network or null if network is unsupported
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

export type ApiMetadata = {
  networkId: string;
  nativeTokenId: string;
};

export type ChainData = {
  id: SupportedChainID;
  name: string;
  domain: NetworkDomain;
  isTestnet: boolean;
  mainnet?: SupportedNetworks;
  explorer: string;
  explorerName: string;
  logo: string;
  // Public RPC endpoints only used to setup the network on MetaMask
  publicRpc: string;
  gatewayNetwork: string;
  nativeCurrency: NativeTokenData;
  etherscanApi: string;
  etherscanApiKey?: string;
  covalent?: ApiMetadata;
  coingecko?: ApiMetadata;
  supportsEns: boolean;
};

const etherscanApiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;

export const CHAIN_METADATA: Record<SupportedNetworks, ChainData> = {
  ethereum: {
    id: 1,
    name: i18n.t('explore.modal.filterDAOs.label.ethereum'),
    domain: 'L1 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://etherscan.io/',
    explorerName: 'Etherscan',
    isTestnet: false,
    publicRpc: 'https://ethereum.publicnode.com',
    gatewayNetwork: 'ethereum/mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api.etherscan.io/v2/api',
    etherscanApiKey: etherscanApiKey,
    coingecko: {
      networkId: 'ethereum',
      nativeTokenId: 'ethereum',
    },
    covalent: {
      networkId: 'eth-mainnet',
      nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    supportsEns: true,
  },
  polygon: {
    id: 137,
    name: i18n.t('explore.modal.filterDAOs.label.polygon'),
    domain: 'L2 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png',
    explorer: 'https://polygonscan.com/',
    explorerName: 'Polygonscan',
    isTestnet: false,
    publicRpc: 'https://polygon-bor.publicnode.com',
    gatewayNetwork: 'polygon/mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    etherscanApi: 'https://api.etherscan.io/v2/api',
    etherscanApiKey: etherscanApiKey,
    coingecko: {
      networkId: 'polygon-pos',
      nativeTokenId: 'matic-network',
    },
    covalent: {
      networkId: 'matic-mainnet',
      nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    supportsEns: false,
  },

  arbitrum: {
    id: 42161,
    name: i18n.t('explore.modal.filterDAOs.label.arbitrum'),
    domain: 'L2 Blockchain',
    logo: 'https://docs.arbitrum.io/img/logo.svg',
    explorer: 'https://arbiscan.io/',
    explorerName: 'Arbiscan',
    isTestnet: false,
    publicRpc: 'https://arb1.arbitrum.io/rpc',
    gatewayNetwork: 'arbitrum/mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api.etherscan.io/v2/api',
    etherscanApiKey: etherscanApiKey,
    coingecko: {
      networkId: 'arbitrum-one',
      nativeTokenId: 'ethereum',
    },
    covalent: {
      networkId: 'arbitrum-mainnet',
      nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    supportsEns: false,
  },
  base: {
    id: 8453,
    name: i18n.t('explore.modal.filterDAOs.label.base'),
    domain: 'L2 Blockchain',
    logo: 'https://mirror-media.imgix.net/publication-images/cgqxxPdUFBDjgKna_dDir.png?h=250&w=250',
    explorer: 'https://basescan.org/',
    explorerName: 'Basescan',
    isTestnet: false,
    publicRpc: 'https://mainnet.base.org',
    gatewayNetwork: 'base/mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api.etherscan.io/v2/api',
    etherscanApiKey: etherscanApiKey,
    covalent: {
      networkId: 'base-mainnet',
      nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    supportsEns: false,
  },
  sepolia: {
    id: 11155111,
    name: i18n.t('explore.modal.filterDAOs.label.ethereumSepolia'),
    domain: 'L1 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://sepolia.etherscan.io/',
    isTestnet: true,
    explorerName: 'Etherscan',
    mainnet: 'ethereum',
    publicRpc: 'https://ethereum-sepolia.publicnode.com',
    gatewayNetwork: 'ethereum/sepolia',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api.etherscan.io/v2/api',
    etherscanApiKey: etherscanApiKey,
    covalent: {
      networkId: 'eth-sepolia',
      nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    supportsEns: false,
  },
  zksyncMainnet: {
    id: 324,
    name: i18n.t('explore.modal.filterDAOs.label.zksync'),
    domain: 'L2 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png?1718614502',
    explorer: 'https://explorer.zksync.io/',
    isTestnet: false,
    explorerName: 'zkSync Explorer',
    publicRpc: 'https://zksync.meowrpc.com',
    gatewayNetwork: 'zksync/mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api.etherscan.io/v2/api',
    etherscanApiKey: etherscanApiKey,
    covalent: {
      networkId: 'zksync-mainnet',
      nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee800A',
    },
    supportsEns: false,
  },
  zksyncSepolia: {
    id: 300,
    name: i18n.t('explore.modal.filterDAOs.label.zksyncSepolia'),
    domain: 'L2 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/38043/large/ZKTokenBlack.png?1718614502',
    explorer: 'https://sepolia.explorer.zksync.io/',
    isTestnet: true,
    mainnet: 'zksyncMainnet',
    explorerName: 'zkSync Sepolia Explorer',
    publicRpc: 'https://endpoints.omniatech.io/v1/zksync-era/sepolia/public',
    gatewayNetwork: 'zksync/sepolia',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api.etherscan.io/v2/api',
    etherscanApiKey: etherscanApiKey,
    covalent: {
      networkId: 'zksync-sepolia-testnet',
      nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee800A',
    },
    supportsEns: false,
  },
  unsupported: {
    id: 1,
    name: 'Unsupported',
    domain: 'L1 Blockchain',
    logo: '',
    explorer: '',
    explorerName: '',
    isTestnet: false,
    publicRpc: '',
    gatewayNetwork: '',
    nativeCurrency: {
      name: '',
      symbol: '',
      decimals: 18,
    },
    etherscanApi: '',
    supportsEns: false,
  },
};

export const chainExplorerAddressLink = (
  network: SupportedNetworks,
  address: string
) => {
  return `${CHAIN_METADATA[network].explorer}address/${address}`;
};
