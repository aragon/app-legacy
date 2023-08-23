import type {QueryKey} from '@tanstack/query-core';

import type {IFetchDelegateeParams} from './aragon-sdk-service.api';
import {SupportedNetworks} from 'utils/constants';

export enum AragonSdkQueryItem {
  DELEGATEE = 'DELEGATEE',
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
};
