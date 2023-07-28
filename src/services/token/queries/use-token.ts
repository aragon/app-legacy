import type {IFetchTokenParams} from '../token-service.api';
import {tokenQueryKeys} from '../query-keys';
import {tokenService} from '../token-service';
import {
  UseQueryOptions,
  useQuery,
  useQueryClient,
  useQueries,
} from '@tanstack/react-query';
import {Token} from '../domain';
import {useCallback} from 'react';

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
