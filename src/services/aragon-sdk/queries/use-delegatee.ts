import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchDelegateeParams} from '../aragon-sdk-service.api';
import {
  GaslessPluginName,
  PluginTypes,
  usePluginClient,
} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {SupportedNetworks} from 'utils/constants';
import {TokenVotingClient} from '@aragon/sdk-client';
import {invariant} from 'utils/invariant';
import {GaslessVotingClient} from '@vocdoni/gasless-voting';
import {useGaslessGovernanceEnabled} from '../../../hooks/useGaslessGovernanceEnabled';

const fetchDelegatee = async (
  params: IFetchDelegateeParams,
  client?: TokenVotingClient | GaslessVotingClient
): Promise<string | null> => {
  invariant(client != null, 'fetchDelegatee: client is not defined');
  const data = await client.methods.getDelegatee(params.tokenAddress);

  return data;
};

export const useDelegatee = (
  params: IFetchDelegateeParams,
  pluginType: PluginTypes,
  options: UseQueryOptions<string | null> = {}
) => {
  const {isGovernanceEnabled} = useGaslessGovernanceEnabled();

  const client = usePluginClient(
    pluginType === GaslessPluginName
      ? GaslessPluginName
      : 'token-voting.plugin.dao.eth'
  );
  const {address, network} = useWallet();

  const baseParams = {
    address: address as string,
    network: network as SupportedNetworks,
  };

  if (
    client == null ||
    address == null ||
    network == null ||
    !isGovernanceEnabled
  ) {
    options.enabled = false;
  }

  // Make sure that the signer is set on the client before
  // querying and caching the result
  try {
    if (options.enabled !== false) {
      const signer = client?.web3.getSigner();
      options.enabled = signer != null;
    }
  } catch (error: unknown) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.delegatee(baseParams, params),
    () => {
      return fetchDelegatee(params, client);
    },
    options
  );
};
