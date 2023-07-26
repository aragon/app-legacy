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

export const useToken = (
  params: IFetchTokenParams,
  options?: UseQueryOptions<Token>
) => {
  return useQuery(
    tokenQueryKeys.token(params),
    () => tokenService.fetchToken(params),
    options
  );
};

export const useTokenAsync = () => {
  const queryClient = useQueryClient();

  return (params: IFetchTokenParams) =>
    queryClient.fetchQuery({
      queryKey: tokenQueryKeys.token(params),
      queryFn: () => tokenService.fetchToken(params),
    });
};

export const useTokenList = (
  paramsList: IFetchTokenParams[],
  options?: Array<UseQueryOptions<Token>>
) => {
  const queries = paramsList.map((params, index) => ({
    queryKey: tokenQueryKeys.token(params),
    queryFn: () => tokenService.fetchToken(params),
    retry: 0,
    ...options?.[index],
  }));

  return useQueries({queries});
};
