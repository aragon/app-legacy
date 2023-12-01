import {AssetBalance, Deposit} from '@aragon/sdk-client';
import {
  UseQueryOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {useCallback} from 'react';
import {useBalance, Address} from 'wagmi';

import {CHAIN_METADATA} from 'utils/constants';
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
  const tok = useQuery(
    tokenQueryKeys.token(params),
    () => tokenService.fetchToken(params),
    options
  );
  if (options?.enabled) {
    console.log(
      `useToken ${params.address}(${params.symbol}): ${JSON.stringify(tok)}`
    );
  } else {
    console.log(`useToken disabled: ${params.address} ${params.network}`);
  }
  return tok;
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
  options: UseQueryOptions<AssetBalance[] | null> = {}
) => {
  // Because the external api (covalent) sometimes does
  // not index a native balance, fetch the native token balance for
  // the DAO directly and augment the covalent response with it.
  // Please remove this and handle it on the backend; see APP-2592
  // [FF - 11/6/2023]
  const {data: nativeToken, isFetched} = useBalance({
    address: params.address as Address,
    chainId: CHAIN_METADATA[params.network].id,
  });

  if (!isFetched) {
    options.enabled = false;
  }

  return useQuery(
    tokenQueryKeys.balances(params),
    () =>
      tokenService.fetchTokenBalances({
        ...params,
        nativeTokenBalance: nativeToken?.value ?? BigInt(0),
      }),
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
