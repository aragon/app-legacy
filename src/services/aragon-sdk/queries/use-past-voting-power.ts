import {UseQueryOptions, useQuery, useQueryClient} from '@tanstack/react-query';
import {BigNumber} from 'ethers';
import {useCallback} from 'react';

import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {getPastVotingPower} from 'utils/tokens';
import type {IFetchPastVotingPowerParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';

export const usePastVotingPower = (
  params: IFetchPastVotingPowerParams,
  options?: UseQueryOptions<BigNumber>
) => {
  const {api: provider} = useProviders();
  const {network} = useNetwork();

  return useQuery(
    aragonSdkQueryKeys.pastVotingPower(params),
    () =>
      getPastVotingPower(
        params.tokenAddress,
        params.address,
        params.blockNumber,
        provider,
        network
      ),
    options
  );
};

export const usePastVotingPowerAsync = () => {
  const queryClient = useQueryClient();
  const {api: provider} = useProviders();
  const {network} = useNetwork();

  const fetchPastVotingPowerAsync = useCallback(
    (params: IFetchPastVotingPowerParams) =>
      queryClient.fetchQuery({
        queryKey: aragonSdkQueryKeys.pastVotingPower(params),
        queryFn: () =>
          getPastVotingPower(
            params.tokenAddress,
            params.address,
            params.blockNumber,
            provider,
            network
          ),
      }),
    [queryClient, provider, network]
  );

  return fetchPastVotingPowerAsync;
};
