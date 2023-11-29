import {
  Client,
  PluginPreparationListItem,
  PluginPreparationSortBy,
} from '@aragon/sdk-client';
import {SortDirection} from '@aragon/sdk-client-common';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {useNetwork} from 'context/network';
import {useClient} from 'hooks/useClient';
import {invariant} from 'utils/invariant';
import {getPluginRepoAddress} from 'utils/library';
import {IFetchPreparedPluginsParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';
import {useProtocolVersion} from './use-protocol-version';

/**
 * Fetches a list of prepared plugins from the client.
 * @param client - The client instance to use for fetching the list.
 * @param daoAddressOrEns - The DAO address or ENS name to fetch the list for.
 * @param PluginRepoAddress - The address of the plugin repository to filter by.
 * @param pluginAddress - The address of the plugin to filter by.
 * @returns A promise that resolves to the list of prepared plugins.
 * @throws An error if the client or pluginReposAddress are not defined.
 */
async function fetchPreparedPlugins(
  client: Client | undefined,
  daoAddressOrEns: string,
  pluginAddress: string,
  pluginRepoAddress?: string
): Promise<Map<string, PluginPreparationListItem>> {
  invariant(client != null, 'fetchPreparedList: client is not defined');
  invariant(
    pluginRepoAddress != null,
    'fetchPreparedList: pluginRepoAddress is not defined'
  );

  const fetchedList = await client.methods.getPluginPreparations({
    limit: 10,
    skip: 0,
    direction: SortDirection.ASC,
    sortBy: PluginPreparationSortBy.ID,
    pluginAddress: pluginAddress,
    daoAddressOrEns: daoAddressOrEns,
    pluginRepoAddress: pluginRepoAddress,
  });

  const filteredFetchedList = new Map<string, PluginPreparationListItem>();

  //  Filters the fetched list of plugins to only include those of type 'Update'.
  (fetchedList ?? []).map(plugin => {
    if (plugin.type === 'Update')
      filteredFetchedList.set(
        `${plugin.versionTag.release}.${plugin.versionTag.build}`,
        plugin
      );
  });

  return filteredFetchedList;
}

export const usePreparedPlugins = (
  params: IFetchPreparedPluginsParams,
  options: UseQueryOptions<Map<string, PluginPreparationListItem>> = {}
) => {
  const {client} = useClient();
  const {network} = useNetwork();

  const {data: protocolVersion} = useProtocolVersion(params.daoAddressOrEns);

  let pluginRepoAddress: string | undefined;

  if (params.pluginType && protocolVersion) {
    pluginRepoAddress = getPluginRepoAddress(
      network,
      params.pluginType,
      protocolVersion
    );
  }

  if (!pluginRepoAddress || !params.pluginAddress || !client) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.preparedPlugins(params),
    () =>
      fetchPreparedPlugins(
        client,
        params.daoAddressOrEns,
        params.pluginAddress,
        pluginRepoAddress
      ),
    options
  );
};
