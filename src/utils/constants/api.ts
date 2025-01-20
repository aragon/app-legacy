import {SupportedNetworks} from './chains';

type SubgraphNetworkUrl = Record<SupportedNetworks, string | undefined>;

export const AppVersion =
  import.meta.env.VITE_REACT_APP_DEPLOY_VERSION ?? '0.1.0';

export const AppMetadata = {
  name: 'Aragon DAO',
  description: 'Aragon DAO',
  url: 'https://app.aragon.org/',
  icons: [
    'https://assets.website-files.com/5e997428d0f2eb13a90aec8c/635283b535e03c60d5aafe64_logo_aragon_isotype.png',
  ],
};

export const FEEDBACK_FORM =
  'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3';

export const pinataJSONAPI = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
export const pinataFileAPI = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export const SUBGRAPH_API_URL: SubgraphNetworkUrl = {
  arbitrum:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-arbitrum/version/v1.4.2/api',

  base: 'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-baseMainnet/version/1.4.2/api',

  ethereum:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-mainnet/version/1.4.3/api',

  polygon:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-polygon/version/1.4.2/api',
  sepolia:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/dev-sepolia/api',
  zksyncMainnet:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-zksync-era/version/1.4.3/api',
  zksyncSepolia:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-zksync-era-sepolia/version/1.4.2/api',
  unsupported: undefined,
};

export const walletConnectProjectID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID as string;

export const COVALENT_API_KEY = import.meta.env.VITE_COVALENT_API_KEY as string;
