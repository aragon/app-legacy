import {useQuery} from '@tanstack/react-query';
import {PluginTypes, usePluginClient} from './usePluginClient';
import {useNetwork} from 'context/network';
import {Client, MultisigClient, TokenVotingClient} from '@aragon/sdk-client';
import {useClient} from './useClient';
import {OffchainVotingClient} from '@vocdoni/offchain-voting';

async function fetchPluginList(
  pluginClient?: TokenVotingClient | MultisigClient | OffchainVotingClient,
  client?: Client,
  pluginType?: PluginTypes
) {
  if (!pluginType || !client || !pluginClient) return null;

  const pluginRepoAddress = pluginClient?.web3.getAddress(
    pluginType === 'token-voting.plugin.dao.eth'
      ? 'tokenVotingRepoAddress'
      : 'multisigRepoAddress'
  );

  return await client?.methods.getPlugin(pluginRepoAddress);
}

/**
 * Get List of plugins available for a DAO
 * @param pluginType The plugin type to get available versions for
 * @returns List of available versions
 */
export const usePluginAvailableVersions = (pluginType: PluginTypes) => {
  const pluginClient = usePluginClient(pluginType);
  const {client} = useClient();
  const {network} = useNetwork();

  return useQuery<{} | null>({
    queryKey: ['pluginAvailableVersions', pluginType, network],
    queryFn: () => fetchPluginList(pluginClient, client, pluginType),
    enabled: Boolean(pluginType) && Boolean(client) && Boolean(pluginClient),
  });
};
