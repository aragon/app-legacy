import {UseQueryOptions, useQuery, useQueryClient} from '@tanstack/react-query';
import {BigNumber} from 'ethers';
import {useCallback} from 'react';

import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {getPastVotingPower} from 'utils/tokens';
import type {IFetchPastVotingPowerParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';
import {useGaslessCensusId} from 'hooks/useCensus3';
import {useDaoDetailsQuery} from '../../../hooks/useDaoDetails';
import {GaslessPluginName, PluginTypes} from '../../../hooks/usePluginClient';
import {useClient} from '@vocdoni/react-providers';
import {fetchVotingPowerByCensusId} from '../../vocdoni-census3/census3-service';

/**
 * Get voting power at specific census id. This means that is the voting power of a holder
 * at specific block number.
 */
const useGaslessPastVotingPower = () => {
  const {data: daoDetails} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const {client: vocdoniClient} = useClient();
  const {censusId} = useGaslessCensusId({
    pluginType,
    enable: pluginType === GaslessPluginName,
  });
  const getGaslessPastVotingPower = useCallback(
    async (address: string) => {
      if (!censusId) return BigNumber.from(0);
      const votingPower = await fetchVotingPowerByCensusId({
        // todo(kon): use query
        vocdoniClient,
        holderAddress: address,
        censusId,
      });
      return BigNumber.from(votingPower);
    },
    [censusId, vocdoniClient]
  );
  return {censusId, getGaslessPastVotingPower};
};

export const usePastVotingPower = (
  params: IFetchPastVotingPowerParams,
  options?: UseQueryOptions<BigNumber>
) => {
  const {api: provider} = useProviders();
  const {network} = useNetwork();
  const {censusId, getGaslessPastVotingPower} = useGaslessPastVotingPower();

  return useQuery(
    aragonSdkQueryKeys.pastVotingPower(params),
    () =>
      censusId !== null
        ? getGaslessPastVotingPower(params.address)
        : getPastVotingPower(
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
  const {censusId, getGaslessPastVotingPower} = useGaslessPastVotingPower();

  const fetchPastVotingPowerAsync = useCallback(
    (params: IFetchPastVotingPowerParams) =>
      queryClient.fetchQuery({
        queryKey: aragonSdkQueryKeys.pastVotingPower(params),
        queryFn: () =>
          censusId !== null
            ? getGaslessPastVotingPower(params.address)
            : getPastVotingPower(
                params.tokenAddress,
                params.address,
                params.blockNumber,
                provider,
                network
              ),
      }),
    [queryClient, censusId, getGaslessPastVotingPower, provider, network]
  );

  return fetchPastVotingPowerAsync;
};
