import type {QueryKey} from '@tanstack/query-core';

import type {
  IFetchDelegateeParams,
  IFetchMembersParams,
  IFetchPastVotingPowerParams,
  IFetchVotingPowerParams,
} from './aragon-sdk-service.api';
import {SupportedNetworks} from 'utils/constants';

export enum AragonSdkQueryItem {
  DELEGATEE = 'DELEGATEE',
  VOTING_POWER = 'VOTING_POWER',
  PAST_VOTING_POWER = 'PAST_VOTING_POWER',
  MEMBERS = 'MEMBERS',
}

// Add address and network parameters to all query keys to use the most updated DAO plugin client
export interface IAragonSdkBaseParams {
  address: string;
  network: SupportedNetworks;
}

export const aragonSdkQueryKeys = {
  delegatee: (
    baseParams: IAragonSdkBaseParams,
    params: IFetchDelegateeParams
  ): QueryKey => [AragonSdkQueryItem.DELEGATEE, baseParams, params],
  pastVotingPower: (params: IFetchPastVotingPowerParams): QueryKey => [
    AragonSdkQueryItem.PAST_VOTING_POWER,
    params,
  ],
  votingPower: (params: IFetchVotingPowerParams): QueryKey => [
    AragonSdkQueryItem.VOTING_POWER,
    params,
  ],
  members: (params: IFetchMembersParams): QueryKey => [
    AragonSdkQueryItem.MEMBERS,
    params,
  ],
};
