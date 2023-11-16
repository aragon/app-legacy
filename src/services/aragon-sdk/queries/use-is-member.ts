import {MultisigClient, TokenVotingClient} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';

import {useNetwork} from 'context/network';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {invariant} from 'utils/invariant';
import {IFetchIsMemberParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';

const fetchIsMember = async (
  params: IFetchIsMemberParams,
  client?: TokenVotingClient | MultisigClient
) => {
  invariant(client != null, 'fetchIsMember: client is not defined');

  const data = await client.methods.isMember({
    address: params.address,
    pluginAddress: params.pluginAddress,
  });

  return data;
};

interface IUseIsMemberParams extends IFetchIsMemberParams {
  pluginType: PluginTypes;
}

export const useIsMember = (
  params: IUseIsMemberParams,
  options: UseQueryOptions<boolean> = {}
) => {
  const {network} = useNetwork();
  const client = usePluginClient(params.pluginType);

  if (client == null || !params.address || !params.pluginAddress) {
    options.enabled = false;
  }

  const queryParams: IFetchIsMemberParams = {
    pluginAddress: params.pluginAddress,
    address: params.address,
  };

  return useQuery(
    aragonSdkQueryKeys.isMember(
      {
        network,
        address: params.address,
      },
      queryParams
    ),
    () => fetchIsMember(queryParams, client),
    options
  );
};
