import {UseQueryOptions, useQuery, useQueryClient} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchMembersParams} from '../aragon-sdk-service.api';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {
  MultisigClient,
  TokenVotingClient,
  TokenVotingMember,
} from '@aragon/sdk-client';
import {invariant} from 'utils/invariant';
import {useCallback} from 'react';

const fetchMembers = async (
  params: IFetchMembersParams,
  client?: TokenVotingClient | MultisigClient
): Promise<Array<string | TokenVotingMember>> => {
  invariant(client != null, 'fetchMembers: client is not defined');
  const data = await client.methods.getMembers(params.pluginAddress);

  return data;
};

export const useMembers = (
  params: IFetchMembersParams,
  options: UseQueryOptions<Array<string | TokenVotingMember>> = {}
) => {
  const client = usePluginClient(params.pluginType);

  if (client == null) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.members(params),
    () => fetchMembers(params, client),
    options
  );
};

export const useMembersAsync = (pluginType?: PluginTypes) => {
  const queryClient = useQueryClient();
  const client = usePluginClient(pluginType);

  const fetchMembersAsync = useCallback(
    (params: IFetchMembersParams) =>
      queryClient.fetchQuery({
        queryKey: aragonSdkQueryKeys.members(params),
        queryFn: () => fetchMembers(params, client),
      }),
    [queryClient, client]
  );

  return fetchMembersAsync;
};
