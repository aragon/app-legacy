import type {QueryKey} from '@tanstack/query-core';
import type {IFetchTokenParams} from './token-service.api';

export enum TokenQueryItem {
  TOKEN = 'TOKEN',
}

export const tokenQueryKeys = {
  token: (params: IFetchTokenParams): QueryKey => [
    TokenQueryItem.TOKEN,
    params,
  ],
};
