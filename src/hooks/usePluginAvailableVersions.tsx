import {useQuery} from '@tanstack/react-query';
import {
  LIVE_CONTRACTS,
  SupportedVersion,
  SupportedNetworksArray,
} from '@aragon/sdk-client-common';
import {PluginTypes} from './usePluginClient';
import {useNetwork} from 'context/network';
import {Client} from '@aragon/sdk-client';
import {useClient} from './useClient';
import {useProtocolVersions} from './useDaoVersions';
import {translateToNetworkishName} from 'utils/library';

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
  const {data: versions} = useProtocolVersions(daoAddress);
  const {network} = useNetwork();
  const translatedNetwork = translateToNetworkishName(network);
  let PluginRepoAddress: undefined | string;

  if (
    translatedNetwork !== 'unsupported' &&
    SupportedNetworksArray.includes(translatedNetwork)
  ) {
    PluginRepoAddress =
      pluginType === 'multisig.plugin.dao.eth'
        ? LIVE_CONTRACTS[
            `${versions?.[0]}.${versions?.[1]}.${versions?.[2]}` as SupportedVersion
          ]?.[translatedNetwork].multisigRepoAddress
        : LIVE_CONTRACTS[
            `${versions?.[0]}.${versions?.[1]}.${versions?.[2]}` as SupportedVersion
          ]?.[translatedNetwork].tokenVotingRepoAddress;
  }

  return useQuery<pluginAvailableVersionsType | null>({
    queryKey: ['pluginAvailableVersions', pluginType, network],
    queryFn: () => fetchPluginList(client, PluginRepoAddress),
    enabled:
      Boolean(PluginRepoAddress) && Boolean(client) && Boolean(daoAddress),
  });
};
