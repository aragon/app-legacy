import type {QueryKey} from '@tanstack/query-core';

import type {
  IFetchTokenBalancesParams,
  IFetchTokenParams,
} from './token-service.api';

export enum TokenQueryItem {
  BALANCES = 'TOKEN_BALANCES',
  TOKEN = 'TOKEN',
  TRANSFERS = 'TOKEN_TRANSFERS',
}

export const tokenQueryKeys = {
  token: (params: IFetchTokenParams): QueryKey => [
    TokenQueryItem.TOKEN,
    params,
  ],
  balances: (params: IFetchTokenBalancesParams): QueryKey => [
    TokenQueryItem.BALANCES,
    params,
  ],
  transfers: (params: IFetchTokenBalancesParams): QueryKey => [
    TokenQueryItem.TRANSFERS,
    params,
  ],
};
