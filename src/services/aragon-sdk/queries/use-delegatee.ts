import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import {aragonSdkService} from '../aragon-sdk-service';
import type {IFetchDelegateeParams} from '../aragon-sdk-service.api';
import {usePluginClient} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {SupportedNetworks} from 'utils/constants';

export const useDelegatee = (
  params: IFetchDelegateeParams,
  options: UseQueryOptions<string | null> = {}
) => {
  const client = usePluginClient('token-voting.plugin.dao.eth');
  const {address, network} = useWallet();
  const baseParams = {
    address: address as string,
    network: network as SupportedNetworks,
  };

  if (client == null || address == null || network == null) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.delegatee(baseParams, params),
    () => aragonSdkService.fetchDelegatee(params, client),
    options
  );
};
