import {Client, PluginPreparationSortBy} from '@aragon/sdk-client';
import {
  SortDirection,
  LIVE_CONTRACTS,
  SupportedVersion,
  SupportedNetworksArray,
} from '@aragon/sdk-client-common';
import {useQuery} from '@tanstack/react-query';

import {useProtocolVersions} from './useDaoVersions';
import {useNetwork} from 'context/network';
import {translateToNetworkishName} from 'utils/library';

/**
 * Fetches a list of prepared plugins from the client.
 * @param client - The client instance to use for fetching the list.
 * @param daoAddressOrEns - The DAO address or ENS name to fetch the list for.
 * @param PluginRepoAddress - The address of the plugin repository to filter by.
 * @param pluginAddress - The address of the plugin to filter by.
 * @returns A promise that resolves to the list of prepared plugins.
 * @throws An error if the client is not defined.
 */
async function fetchPreparedList(
  client: Client | undefined,
  daoAddressOrEns: string,
  PluginRepoAddress?: string,
  pluginAddress?: string
) {
  return client
    ? client?.methods?.getPluginPreparations({
        limit: 10,
        skip: 0,
        direction: SortDirection.ASC,
        sortBy: PluginPreparationSortBy.ID,
        pluginAddress: pluginAddress,
        daoAddressOrEns: daoAddressOrEns,
        pluginRepoAddress: PluginRepoAddress,
      })
    : Promise.reject(new Error('Client not defined'));
}

/**
 * A hook that returns a query object for fetching a list of prepared plugins for a DAO.
 * @param client - An optional client object for fetching data.
 * @param pluginAddress - The address of the plugin to fetch.
 * @param pluginType - The type of the plugin to fetch.
 * @param daoAddressOrEns - The address or ENS name of the DAO to fetch plugins for.
 * @returns A query object for fetching a list of prepared plugins for a DAO.
 */
export const usePreparedPlugin = (
  client?: Client,
  pluginAddress?: string,
  pluginType?: string,
  daoAddressOrEns?: string
) => {
  const {data: versions} = useProtocolVersions(daoAddressOrEns);
  const {network} = useNetwork();
  const translatedNetwork = translateToNetworkishName(network);
  let PluginRepoAddress: undefined | string;

  if (
    translatedNetwork !== 'unsupported' &&
    SupportedNetworksArray.includes(translatedNetwork)
  ) {
    PluginRepoAddress =
      pluginType === 'multisig.plugin.dao.eth'
        ? LIVE_CONTRACTS[versions?.join('.') as SupportedVersion]?.[
            translatedNetwork
          ].multisigRepoAddress
        : LIVE_CONTRACTS[versions?.join('.') as SupportedVersion]?.[
            translatedNetwork
          ].tokenVotingRepoAddress;
  }

  return useQuery({
    queryKey: ['protocolVersions', daoAddressOrEns],
    queryFn: () =>
      fetchPreparedList(
        client,
        daoAddressOrEns as string,
        PluginRepoAddress,
        pluginAddress
      ),
    enabled: Boolean(client) && Boolean(daoAddressOrEns),
  });
};
