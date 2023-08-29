import {UseQueryOptions, useQuery, useQueryClient} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchPastVotingPowerParams} from '../aragon-sdk-service.api';
import {getPastVotingPower} from 'utils/tokens';
import {useProviders} from 'context/providers';
import {BigNumber} from 'ethers';
import {useCallback} from 'react';

export const usePastVotingPower = (
  params: IFetchPastVotingPowerParams,
  options?: UseQueryOptions<BigNumber>
) => {
  const {api: provider} = useProviders();

  return useQuery(
    aragonSdkQueryKeys.pastVotingPower(params),
    () =>
      getPastVotingPower(
        params.tokenAddress,
        params.address,
        params.blockNumber,
        provider
      ),
    options
  );
};

export const usePastVotingPowerAsync = () => {
  const queryClient = useQueryClient();
  const {api: provider} = useProviders();

  const fetchPastVotingPowerAsync = useCallback(
    (params: IFetchPastVotingPowerParams) =>
      queryClient.fetchQuery({
        queryKey: aragonSdkQueryKeys.pastVotingPower(params),
        queryFn: () =>
          getPastVotingPower(
            params.tokenAddress,
            params.address,
            params.blockNumber,
            provider
          ),
      }),
    [queryClient, provider]
  );

  return fetchPastVotingPowerAsync;
};
