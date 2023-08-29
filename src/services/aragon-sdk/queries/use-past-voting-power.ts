import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchPastVotingPowerParams} from '../aragon-sdk-service.api';
import {getPastVotingPower} from 'utils/tokens';
import {useProviders} from 'context/providers';
import {BigNumber} from 'ethers';

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
