import {useQuery} from '@tanstack/react-query';
import {
  LIVE_CONTRACTS,
  SupportedVersion,
  SupportedNetworksArray,
} from '@aragon/sdk-client-common';
import {Client} from '@aragon/sdk-client';

import {PluginTypes} from './usePluginClient';
import {useNetwork} from 'context/network';
import {useClient} from './useClient';
import {translateToNetworkishName} from 'utils/library';
import {useProtocolVersion} from 'services/aragon-sdk/queries/use-protocol-version';

export type pluginAvailableVersionsType = {
  address: string;
  current: {
    build: {
      number: number;
    };
    release: {
      number: number;
    };
  };
  releases: {
    release: number;
    builds: {
      build: number;
    }[];
  }[];
};

async function fetchPluginList(client?: Client, PluginRepoAddress?: string) {
  if (!PluginRepoAddress || !client) return null;

  return await client?.methods.getPlugin(PluginRepoAddress);
}

/**
 * Get List of plugins available for a DAO
 * @param pluginType The plugin type to get available versions for
 * @returns List of available versions
 */
export const usePluginAvailableVersions = (
  pluginType: PluginTypes,
  daoAddress: string
) => {
  const {client} = useClient();
  const {network} = useNetwork();

  const {data: versions} = useProtocolVersion(daoAddress);

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

  return useQuery<pluginAvailableVersionsType | null>({
    queryKey: ['pluginAvailableVersions', pluginType, network],
    queryFn: () => fetchPluginList(client, PluginRepoAddress),
    enabled:
      Boolean(PluginRepoAddress) && Boolean(client) && Boolean(daoAddress),
  });
};
