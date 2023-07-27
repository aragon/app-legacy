import type {QueryKey} from '@tanstack/query-core';
import type {
  IFetchTokenMarketDataParams,
  IFetchTokenParams,
} from './token-service.api';

export enum TokenQueryItem {
  MARKET_DATA = 'MARKET_DATA',
  TOKEN = 'TOKEN',
}

export const tokenQueryKeys = {
  marketData: (params: IFetchTokenMarketDataParams): QueryKey => [
    TokenQueryItem.MARKET_DATA,
    params,
  ],
  token: (params: IFetchTokenParams): QueryKey => [
    TokenQueryItem.TOKEN,
    params,
  ],
};
