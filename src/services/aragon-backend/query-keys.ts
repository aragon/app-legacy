import type {QueryKey} from '@tanstack/query-core';
import type {IFetchTokenHoldersParams} from './aragon-backend-service.api';

export enum AragonBackendQueryItem {
  TOKEN_HOLDERS = 'TOKEN_HOLDERS',
  TOKENS = 'TOKENS',
}

export const aragonBackendQueryKeys = {
  tokenHolders: (params: IFetchTokenHoldersParams): QueryKey => [
    AragonBackendQueryItem.TOKEN_HOLDERS,
    params,
  ],
  tokens: (network: string): QueryKey => [
    AragonBackendQueryItem.TOKENS,
    network,
  ],
};
