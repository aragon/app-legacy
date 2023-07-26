import type {IFetchTokenPriceParams} from '../token-service.api';
import {tokenQueryKeys} from '../query-keys';
import {tokenService} from '../token-service';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';

export const useTokenPrice = (
  params: IFetchTokenPriceParams,
  options?: UseQueryOptions<number>
) => {
  return useQuery(
    tokenQueryKeys.tokenPrice(params),
    () => tokenService.fetchTokenPrice(params),
    options
  );
};
