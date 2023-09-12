import type {QueryKey} from '@tanstack/query-core';
import type {IFetchTokenHoldersParams} from './aragon-backend-service.api';

export enum AragonBackendQueryItem {
  TOKEN_HOLDERS = 'TOKEN_HOLDERS',
}

export const aragonSdkQueryKeys = {
  tokenHolders: (params: IFetchTokenHoldersParams): QueryKey => [
    AragonBackendQueryItem.TOKEN_HOLDERS,
    params,
  ],
};
