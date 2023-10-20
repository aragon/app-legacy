import {useQuery} from '@tanstack/react-query';
import {Client, PluginRepo, PluginSortBy} from '@aragon/sdk-client';
import {SortDirection} from '@aragon/sdk-client-common';

/**
 * Custom hook to get the list of available versions for a plugin
 * @param pluginType The type of plugin to fetch the list for
 * @returns The query result for the list of available versions
 */
export const usePluginAvailableVersions = (client: Client) => {
  // Use the useQuery hook to fetch the list of available versions for the plugin
  return useQuery(
    ['pluginAvailableVersions'],
    () =>
      client.methods.getPlugins({
        limit: 10,
        skip: 0,
        direction: SortDirection.ASC,
        sortBy: PluginSortBy.SUBDOMAIN,
      }),
    {
      enabled: Boolean(client),
    }
  );
};
