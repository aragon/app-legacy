import {useEffect, useState} from 'react';
import {
  Client,
  PluginPreparationListItem,
  PluginPreparationSortBy,
} from '@aragon/sdk-client';
import {
  SortDirection,
  LIVE_CONTRACTS,
  SupportedVersion,
  SupportedNetworksArray,
} from '@aragon/sdk-client-common';

import {HookData} from 'utils/types';
import {useProtocolVersions} from './useDaoVersions';
import {useNetwork} from 'context/network';
import {translateToNetworkishName} from 'utils/library';

export function usePreparedPlugin(
  client?: Client,
  pluginAddress?: string,
  pluginType?: string,
  daoAddressOrEns?: string
): HookData<PluginPreparationListItem[] | undefined> {
  const [data, setData] = useState<PluginPreparationListItem[]>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  let PluginRepoAddress: undefined | string;

  const {data: versions} = useProtocolVersions(daoAddressOrEns);
  const {network} = useNetwork();
  const translatedNetwork = translateToNetworkishName(network);

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

  useEffect(() => {
    async function getTokenMetadata() {
      try {
        setIsLoading(true);

        const response = await client?.methods?.getPluginPreparations({
          limit: 10,
          skip: 0,
          direction: SortDirection.ASC,
          sortBy: PluginPreparationSortBy.ID,
          pluginAddress: pluginAddress,
          daoAddressOrEns: '0x7e2093ff32dca9933ae5f7f01e3ba0798a9887c5',
          pluginRepoAddress: '0x2c4690b8be39adAd4F15A69340d5035aC6E53eEF',
        });

        if (response) {
          setData(response as PluginPreparationListItem[]);
        }
      } catch (err) {
        console.error('Error fetching DAO token', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (
      client &&
      pluginAddress &&
      daoAddressOrEns &&
      PluginRepoAddress &&
      PluginRepoAddress
    ) {
      getTokenMetadata();
    }
  }, [
    client,
    client?.methods,
    daoAddressOrEns,
    pluginAddress,
    PluginRepoAddress,
  ]);

  return {data, error, isLoading};
}
