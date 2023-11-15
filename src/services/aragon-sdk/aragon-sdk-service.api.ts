import {ProposalQueryParams} from '@aragon/sdk-client';

import {PluginTypes} from 'hooks/usePluginClient';
import {SupportedNetworks} from 'utils/constants';

export interface IFetchDelegateeParams {
  tokenAddress: string;
}

export interface IFetchPastVotingPowerParams {
  tokenAddress: string;
  address: string;
  blockNumber: number;
  network: SupportedNetworks;
}

export interface IFetchVotingPowerParams {
  tokenAddress: string;
  address: string;
}

export interface IDelegateTokensParams {
  tokenAddress: string;
  delegatee: string;
}

export interface IFetchMembersParams {
  pluginAddress: string;
  pluginType?: PluginTypes;
}

export interface IFetchVotingSettingsParams {
  blockNumber?: number;
  pluginAddress?: string;
  pluginType?: PluginTypes;
}

export interface IFetchProposalsParams extends ProposalQueryParams {
  pluginType?: PluginTypes;
  pluginAddress: string;
}

export interface IFetchProposalParams {
  pluginType?: PluginTypes;
  id: string;
}

export interface IFetchMemberParams {
  pluginAddress: string;
  address: string;
  blockNumber?: number;
}

export interface IFetchPluginVersionsParams {
  pluginType?: PluginTypes;
  daoAddress: string;
}

export interface IFetchPreparedPluginsParams {
  pluginAddress: string;
  pluginType: PluginTypes;
  daoAddressOrEns: string;
}
