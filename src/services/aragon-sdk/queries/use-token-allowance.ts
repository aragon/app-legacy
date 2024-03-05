import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchTokenAllowanceParams} from '../aragon-sdk-service.api';
import {getAllowance} from 'utils/tokens';
import {useProviders} from 'context/providers';
import {BigNumber} from 'ethers';

export const useTokenAllowance = (
  params: IFetchTokenAllowanceParams,
  options?: UseQueryOptions<BigNumber>
) => {
  const {api: provider} = useProviders();

  return useQuery(
    aragonSdkQueryKeys.tokenAllowance(params),
    () => getAllowance(params.token, params.owner, params.spender, provider),
    options
  );
};
