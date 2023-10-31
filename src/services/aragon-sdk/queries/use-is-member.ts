import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchIsMemberParams} from '../aragon-sdk-service.api';
import {usePluginClient} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {SupportedNetworks} from 'utils/constants';
import {TokenVotingClient} from '@aragon/sdk-client';
import {invariant} from 'utils/invariant';

const fetchIsMember = async (
  params: IFetchIsMemberParams,
  client?: TokenVotingClient
): Promise<boolean> => {
  invariant(client != null, 'fetchDelegatee: client is not defined');
  // TODO: currently not implemented
  // const data = await client.methods.isMember(params.tokenAddress, params.blockNumber);

  return true;
};

export const useIsMember = (
  params: IFetchIsMemberParams,
  options: UseQueryOptions<boolean> = {}
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
    () => fetchIsMember(params, client),
    options
  );
};
