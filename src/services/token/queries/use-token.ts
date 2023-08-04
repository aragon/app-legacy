import {AssetBalance, Deposit} from '@aragon/sdk-client';
import {
  UseQueryOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {useCallback} from 'react';

import {Token} from '../domain';
import {tokenQueryKeys} from '../query-keys';
import {tokenService} from '../token-service';
import type {
  FetchErc20DepositParams,
  IFetchTokenBalancesParams,
  IFetchTokenParams,
} from '../token-service.api';

export const useToken = (
  params: IFetchTokenParams,
  options?: UseQueryOptions<Token | null>
) => {
  return useQuery(
    tokenQueryKeys.token(params),
    () => tokenService.fetchToken(params),
    options
  );
};

export const useTokenAsync = () => {
  const queryClient = useQueryClient();

  const fetchTokenAsync = useCallback(
    (params: IFetchTokenParams) =>
      queryClient.fetchQuery({
        queryKey: tokenQueryKeys.token(params),
        queryFn: () => tokenService.fetchToken(params),
      }),
    [queryClient]
  );

  return fetchTokenAsync;
};

export const useTokenList = (
  paramsList: IFetchTokenParams[],
  options?: UseQueryOptions<Token | null>
) => {
  const queries = paramsList.map(params => ({
    queryKey: tokenQueryKeys.token(params),
    queryFn: () => tokenService.fetchToken(params),
    ...options,
  }));

  return useQueries({queries});
};

export const useTokenBalances = (
  params: IFetchTokenBalancesParams,
  options?: UseQueryOptions<AssetBalance[] | null>
) => {
  return useQuery(
    tokenQueryKeys.balances(params),
    () => tokenService.fetchTokenBalances(params),
    options
  );
};

export const useErc20Deposits = (
  params: FetchErc20DepositParams,
  options?: UseQueryOptions<Deposit[] | null>
) => {
  const {data: assets, isFetched: areAssetsFetched} = useTokenBalances(
    {...params, ignoreZeroBalances: false},
    {enabled: !!params.address}
  );

  return useQuery(
    tokenQueryKeys.transfers(params),
    () => tokenService.fetchErc20Deposits({...params, assets: assets ?? []}),
    {...options, enabled: options?.enabled !== false && areAssetsFetched}
  );
};
