import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchMembersParams} from '../aragon-sdk-service.api';
import {usePluginClient} from 'hooks/usePluginClient';
import {
  MultisigClient,
  TokenVotingClient,
  TokenVotingMember,
} from '@aragon/sdk-client';
import {invariant} from 'utils/invariant';
import {OffchainVotingClient} from '@vocdoni/offchain-voting';

const fetchMembers = async (
  params: IFetchMembersParams,
  client?: TokenVotingClient | MultisigClient | OffchainVotingClient
): Promise<Array<string | TokenVotingMember>> => {
  invariant(client != null, 'fetchMembers: client is not defined');
  const data = await client.methods.getMembers({
    pluginAddress: params.pluginAddress,
  });

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
