import {useQueries} from '@tanstack/react-query';
import {PluginTypes, usePluginClient} from './usePluginClient';
import {useNetwork} from 'context/network';
import {
  Client,
  MultisigClient,
  PluginRepo,
  TokenVotingClient,
} from '@aragon/sdk-client';
import {useClient} from './useClient';

/**
 * Fetches the list of available versions for a plugin
 * @param pluginClient The plugin client instance
 * @param client The SDK client instance
 * @param pluginType The type of plugin to fetch the list for
 * @returns The list of available versions for the plugin
 */
async function fetchPluginList(
  pluginClient?: TokenVotingClient | MultisigClient,
  client?: Client,
  pluginType?: PluginTypes
): Promise<PluginRepo | null> {
  if (!pluginType || !client || !pluginClient) return null;

  // Get the address of the plugin repository based on the plugin type
  const pluginRepoAddress = pluginClient?.web3.getAddress(
    pluginType === 'token-voting.plugin.dao.eth'
      ? 'tokenVotingRepoAddress'
      : 'multisigRepoAddress'
  );

  // Fetch the list of available versions for the plugin
  return await client?.methods.getPlugin(pluginRepoAddress);
}

/**
 * Fetches the list of available versions for the OSX client
 * @param pluginClient The plugin client instance
 * @param client The SDK client instance
 * @param pluginType The type of plugin to fetch the list for
 * @returns The list of available versions for the OSX client
 */
async function fetchOSXList(
  pluginClient?: TokenVotingClient | MultisigClient,
  client?: Client,
  pluginType?: PluginTypes
): Promise<PluginRepo | null> {
  if (!pluginType || !client || !pluginClient) return null;

  // Get the address of the plugin repository based on the plugin type
  const pluginRepoAddress = pluginClient?.web3.getAddress(
    pluginType === 'token-voting.plugin.dao.eth'
      ? 'tokenVotingRepoAddress'
      : 'multisigRepoAddress'
  );

  // Fetch the list of available versions for the OSX client
  return await client?.methods.getPlugin(pluginRepoAddress);
}

/**
 * Custom hook to get the list of available versions for a plugin
 * @param pluginType The type of plugin to fetch the list for
 * @returns An array of queries for the list of available versions
 */
export const useAvailableVersions = (pluginType: PluginTypes) => {
  const pluginClient = usePluginClient(pluginType);
  const {client} = useClient();
  const {network} = useNetwork();

  // Use the useQueries hook to fetch the list of available versions for the plugin and the OSX client
  return useQueries<PluginRepo[] | null[]>({
    queries: [
      {
        queryKey: ['pluginAvailableVersions', pluginType, network],
        queryFn: () => fetchPluginList(pluginClient, client, pluginType),
        // Only enable the query if the plugin type, SDK client, and plugin client are all defined
        enabled:
          Boolean(pluginType) && Boolean(client) && Boolean(pluginClient),
      },
      {
        queryKey: ['osxAvailableVersions', network],
        queryFn: () => fetchOSXList(pluginClient, client, pluginType),
        // Only enable the query if the plugin type, SDK client, and plugin client are all defined
        enabled:
          Boolean(pluginType) && Boolean(client) && Boolean(pluginClient),
      },
    ],
  });
};
