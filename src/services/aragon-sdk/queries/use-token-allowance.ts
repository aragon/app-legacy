import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchTokenAllowanceParams} from '../aragon-sdk-service.api';
import {getAllowance} from 'utils/tokens';
import {useProviders} from 'context/providers';
import {BigNumber} from 'ethers';

export const useTokenAllowance = (
  params: IFetchTokenAllowanceParams,
  options?: Omit<UseQueryOptions<BigNumber>, 'queryKey'>
) => {
  const {api: provider} = useProviders();

  return useQuery({
    queryKey: aragonSdkQueryKeys.tokenAllowance(params),
    queryFn: () =>
      getAllowance(params.token, params.owner, params.spender, provider),
    ...options,
  });
};
