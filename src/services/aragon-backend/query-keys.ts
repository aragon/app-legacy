import type {QueryKey} from '@tanstack/query-core';
import type {
  IFetchDaosParams,
  IFetchTokenHoldersParams,
} from './aragon-backend-service.api';

export enum AragonBackendQueryItem {
  TOKEN_HOLDERS = 'TOKEN_HOLDERS',
  DAOS = 'DAOS',
}

export const aragonBackendQueryKeys = {
  tokenHolders: (params: IFetchTokenHoldersParams): QueryKey => [
    AragonBackendQueryItem.TOKEN_HOLDERS,
    params,
  ],
  daos: (params: IFetchDaosParams): QueryKey => [
    AragonBackendQueryItem.DAOS,
    params,
  ],
};
