import {ProposalQueryParams} from '@aragon/sdk-client';
import {PluginTypes} from 'hooks/usePluginClient';

export interface IFetchDelegateeParams {
  tokenAddress: string;
}

export interface IFetchPastVotingPowerParams {
  tokenAddress: string;
  address: string;
  blockNumber: number;
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
}
