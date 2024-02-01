import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchMembersParams} from '../aragon-sdk-service.api';
import {
  isGaslessVotingClient,
  PluginClient,
  usePluginClient,
} from 'hooks/usePluginClient';
import {TokenVotingMember} from '@aragon/sdk-client';
import {invariant} from 'utils/invariant';

const fetchMembers = async (
  params: IFetchMembersParams,
  client?: PluginClient
): Promise<Array<string | TokenVotingMember>> => {
  invariant(client != null, 'fetchMembers: client is not defined');
  // todo(kon): change gasless method signature
  if (isGaslessVotingClient(client)) {
    const data = await client.methods.getMembers(params.pluginAddress);
    return data;
  }
  const data = await client.methods.getMembers({
    pluginAddress: params.pluginAddress,
    limit: 10000,
  });

  return data;
};

export const useMembers = (
  params: IFetchMembersParams,
  options: UseQueryOptions<Array<string | TokenVotingMember>> = {}
) => {
  const client = usePluginClient(params.pluginType);

  if (client == null || !params.pluginAddress) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.members(params),
    () => fetchMembers(params, client),
    options
  );
};
