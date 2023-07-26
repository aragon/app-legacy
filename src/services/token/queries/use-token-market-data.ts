import type {IFetchTokenMarketDataParams} from '../token-service.api';
import {tokenQueryKeys} from '../query-keys';
import {tokenService} from '../token-service';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {TokenPrices} from '../domain';

export const useTokenMarketData = (
  params: IFetchTokenMarketDataParams,
  options?: UseQueryOptions<TokenPrices>
) => {
  return useQuery(
    tokenQueryKeys.marketData(params),
    () => tokenService.fetchTokenMarketData(params),
    options
  );
};
