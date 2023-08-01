import type {QueryKey} from '@tanstack/query-core';

import type {
  IFetchTokenBalancesParams,
  IFetchTokenParams,
} from './token-service.api';

export enum TokenQueryItem {
  TOKEN = 'TOKEN',
  BALANCES = 'TOKEN_BALANCES',
}

export const tokenQueryKeys = {
  token: (params: IFetchTokenParams): QueryKey => [
    TokenQueryItem.TOKEN,
    params,
  ],
};

export const tokenBalancesQueryKeys = {
  address: (params: IFetchTokenBalancesParams): QueryKey => [
    TokenQueryItem.BALANCES,
    params,
  ],
};
