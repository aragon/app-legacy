import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchVotingPowerParams} from '../aragon-sdk-service.api';
import {getVotingPower} from 'utils/tokens';
import {useProviders} from 'context/providers';
import {BigNumber} from 'ethers';

export const useVotingPower = (
  params: IFetchVotingPowerParams,
  options?: UseQueryOptions<BigNumber>
) => {
  const {api: provider} = useProviders();

  return useQuery(
    aragonSdkQueryKeys.votingPower(params),
    () => getVotingPower(params.tokenAddress, params.address, provider),
    options
  );
};
