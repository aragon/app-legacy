import {SupportedNetworks} from './chains';

type SubgraphNetworkUrl = Record<SupportedNetworks, string | undefined>;

export const AppVersion =
  import.meta.env.VITE_REACT_APP_DEPLOY_VERSION ?? '0.1.0';

// TODO: Remove this Goerli based network conditions
export const FEEDBACK_FORM =
  'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3';

export const SUBGRAPH_API_URL: SubgraphNetworkUrl = {
  arbitrum:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-arbitrum/version/v1.4.0/api',
  base: 'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-baseMainnet/version/v1.4.0/api',
  ethereum:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-mainnet/version/v1.4.0/api',
  polygon:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-polygon/version/1.4.0/api',
  sepolia:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-sepolia/version/v1.4.0/api',
  unsupported: undefined,
  goerli:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-goerli/version/v1.4.0/api',
  mumbai:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-mumbai/version/v1.4.0/api',
  'arbitrum-goerli':
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-arbitrumGoerli/version/v1.4.0/api',
  'base-goerli':
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-baseGoerli/version/v1.4.0/api',
};

export const walletConnectProjectID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID as string;

export const COVALENT_API_KEY = import.meta.env.VITE_COVALENT_API_KEY as string;
