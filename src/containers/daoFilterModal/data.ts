import {
  CHAIN_METADATA,
  GOERLI_BASED_NETWORKS,
  SupportedNetworks,
} from 'utils/constants';

const ShowGoerliBasedNetworks =
  import.meta.env.VITE_FEATURE_FLAG_HIDE_GOERLIBASED_NETWORKS === 'false';

type NetworkFilter = {
  label: string;
  value: SupportedNetworks;
  testnet?: boolean;
};

export const networkFilters: Array<NetworkFilter> = Object.entries(
  CHAIN_METADATA
).flatMap(([key, {name, isTestnet}]) => {
  const value: SupportedNetworks = key as SupportedNetworks;

  if (!ShowGoerliBasedNetworks && GOERLI_BASED_NETWORKS.includes(value))
    return [];

  return value !== 'goerli' && value !== 'unsupported'
    ? ({label: name, value, testnet: isTestnet} as NetworkFilter)
    : [];
});

type GovernanceFilter = {
  label: string;
  value: 'token-voting-repo' | 'multisig-repo';
};
export const governanceFilters: GovernanceFilter[] = [
  {
    label: 'explore.modal.filterDAOs.label.tokenVoting',
    value: 'token-voting-repo',
  },
  {
    label: 'explore.modal.filterDAOs.label.member',
    value: 'multisig-repo',
  },
];

export type QuickFilterValue = 'allDaos' | 'memberOf' | 'following';
type QuickFilter = {
  label: string;
  value: QuickFilterValue;
  disabled?: boolean;
};

export type OrderByValue = 'createdAt' | 'tvl' | 'members' | 'proposals';

export const quickFilters: QuickFilter[] = [
  {label: 'explore.toggleFilter.allDAOs', value: 'allDaos'},
  {label: 'explore.toggleFilter.member', value: 'memberOf'},
  {
    label: 'explore.toggleFilter.Favourites',
    value: 'following',
  },
];
