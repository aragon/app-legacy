import {PluginTypes, GaselessPluginType} from 'hooks/usePluginClient';
import {SupportedNetworks} from 'utils/constants';

type NetworkFilter = {
  label: string;
  value: SupportedNetworks;
  testnet?: boolean;
};

export const networkFilters: Array<NetworkFilter> = [
  {
    label: 'explore.modal.filterDAOs.label.ethereum',
    value: 'ethereum',
  },
  {
    label: 'explore.modal.filterDAOs.label.polygon',
    value: 'polygon',
  },
  {
    label: 'ARBITRUM',
    value: 'arbitrum',
  },
  {
    label: 'explore.modal.filterDAOs.label.base',
    value: 'base',
  },
  {
    label: 'SEPOLIA',
    value: 'sepolia',
    testnet: true,
  },
  {
    label: 'explore.modal.filterDAOs.label.polygonMumbai',
    value: 'mumbai',
    testnet: true,
  },
  {
    label: 'ARBITRUM-GOERLI',
    value: 'arbitrum-goerli',
    testnet: true,
  },
  {
    label: 'explore.modal.filterDAOs.label.baseGoerli',
    value: 'base-goerli',
    testnet: true,
  },
];

type GovernanceFilter = {
  label: string;
  value: Exclude<PluginTypes, GaselessPluginType>;
};
export const governanceFilters: GovernanceFilter[] = [
  {
    label: 'explore.modal.filterDAOs.label.tokenVoting',
    value: 'token-voting.plugin.dao.eth',
  },
  {
    label: 'explore.modal.filterDAOs.label.member',
    value: 'multisig.plugin.dao.eth',
  },
];

export type QuickFilterValue = 'allDaos' | 'memberOf' | 'following';
type QuickFilter = {
  label: string;
  value: QuickFilterValue;
  disabled?: boolean;
};

export const quickFilters: QuickFilter[] = [
  {label: 'explore.toggleFilter.allDAOs', value: 'allDaos'},
  {label: 'explore.toggleFilter.member', value: 'memberOf'},
  {
    label: 'explore.toggleFilter.Favourites',
    value: 'following',
  },
];
