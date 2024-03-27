import {UseQueryOptions, useQuery, useQueryClient} from '@tanstack/react-query';
import {BigNumber} from 'ethers';
import {useCallback} from 'react';

import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {getPastVotingPower} from 'utils/tokens';
import type {IFetchPastVotingPowerParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';
import {fetchVotingPowerByCensusId} from '../../vocdoni-census3/census3-service';
import {useClient} from '@vocdoni/react-providers';
import {useGaslessCensusId} from '../../../hooks/useCensus3';
import {GaslessPluginName, PluginTypes} from '../../../hooks/usePluginClient';
import {useDaoDetailsQuery} from '../../../hooks/useDaoDetails';

export const usePastVotingPower = (
  params: IFetchPastVotingPowerParams,
  options: Omit<UseQueryOptions<BigNumber>, 'queryKey'> = {}
) => {
  const {api: provider} = useProviders();
  const {network} = useNetwork();

  const {client: vocdoniClient} = useClient();
  const {data: daoDetails} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const {censusId} = useGaslessCensusId({
    pluginType,
    enable: pluginType === GaslessPluginName,
  });

  return useQuery({
    queryKey: aragonSdkQueryKeys.pastVotingPower(params),
    queryFn: () =>
      censusId !== null
        ? BigNumber.from(
            fetchVotingPowerByCensusId({
              vocdoniClient,
              holderAddress: params.address,
              censusId,
            })
          )
        : getPastVotingPower(
            params.tokenAddress,
            params.address,
            params.blockNumber,
            provider,
            network
          ),
    ...options,
  });
};

export const usePastVotingPowerAsync = () => {
  const queryClient = useQueryClient();
  const {api: provider} = useProviders();
  const {network} = useNetwork();

  const {client: vocdoniClient} = useClient();
  const {data: daoDetails} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const {censusId} = useGaslessCensusId({
    pluginType,
    enable: pluginType === GaslessPluginName,
  });

  const fetchPastVotingPowerAsync = useCallback(
    (params: IFetchPastVotingPowerParams) =>
      queryClient.fetchQuery({
        queryKey: aragonSdkQueryKeys.pastVotingPower(params),
        queryFn: async () => {
          if (censusId) {
            const vp = await fetchVotingPowerByCensusId({
              vocdoniClient,
              holderAddress: params.address,
              censusId,
            });
            return BigNumber.from(vp);
          }
          return getPastVotingPower(
            params.tokenAddress,
            params.address,
            params.blockNumber,
            provider,
            network
          );
        },
      }),
    [queryClient, censusId, vocdoniClient, provider, network]
  );

  return fetchPastVotingPowerAsync;
};
