import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchMemberParams} from '../aragon-sdk-service.api';
import {usePluginClient} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {SupportedNetworks} from 'utils/constants';
import {TokenVotingClient} from '@aragon/sdk-client';
import {invariant} from 'utils/invariant';

export interface IDaoMember {
  address: string;
  balance: number;
}

const fetchMember = async (
  params: IFetchMemberParams,
  client?: TokenVotingClient
): Promise<IDaoMember> => {
  invariant(client != null, 'fetchDelegatee: client is not defined');
  // TODO: currently not implemented
  // const data = await client.methods.getMember(params.tokenAddress, params.blockNumber);
  const address = await client.web3.getSigner().getAddress();

  return {address, balance: 10};
};

export const useGetMember = (
  params: IFetchMemberParams,
  options: UseQueryOptions<IDaoMember> = {}
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
    aragonSdkQueryKeys.getMember(baseParams, params),
    () => fetchMember(params, client),
    options
  );
};
