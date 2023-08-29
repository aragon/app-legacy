import {
  MultisigClient,
  MultisigVotingSettings,
  TokenVotingClient,
  VotingSettings,
} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';
import {HookData, SupportedVotingSettings} from 'utils/types';

import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {PluginTypes, usePluginClient} from './usePluginClient';

export function isTokenVotingSettings(
  settings: SupportedVotingSettings | undefined
): settings is VotingSettings {
  if (!settings || Object.keys(settings).length === 0) return false;
  return 'minDuration' in settings;
}

export function isMultisigVotingSettings(
  settings: SupportedVotingSettings | undefined
): settings is MultisigVotingSettings {
  if (!settings || Object.keys(settings).length === 0) return false;
  return !('minDuration' in settings);
}

type FetchVotingSettingsParams = {
  pluginAddress: string;
  blockNumber?: number;
};

type UseFetchVotingSettingsParams = FetchVotingSettingsParams & {
  pluginType: PluginTypes;
};

async function fetchVotingSettings(
  {pluginAddress, blockNumber}: FetchVotingSettingsParams,
  client: TokenVotingClient | MultisigClient | undefined
): Promise<SupportedVotingSettings | null> {
  if (!pluginAddress)
    return Promise.reject(new Error('pluginAddress must be defined'));

  if (!client) return Promise.reject(new Error('client must be defined'));

  const data = await client.methods.getVotingSettings(
    pluginAddress,
    blockNumber
  );

  return data;
}

export function useVotingSettings(
  params: UseFetchVotingSettingsParams,
  options: UseQueryOptions<SupportedVotingSettings | null> = {}
) {
  const client = usePluginClient(params.pluginType);

  if (client == null || !params.pluginAddress || !params.pluginType) {
    options.enabled = false;
  }

  return useQuery({
    queryKey: ['VOTE_SETTINGS', params],
    queryFn: () => fetchVotingSettings(params, client),
    ...options,
  });
}

/**
 * Retrieves plugin governance settings from SDK
 * @param pluginAddress plugin from which proposals will be retrieved
 * @param type plugin type
 * @returns plugin governance settings
 */
export function useVotingSettingsbak(
  pluginAddress: string,
  type: PluginTypes
): HookData<SupportedVotingSettings> {
  const [data, setData] = useState<SupportedVotingSettings>(
    {} as SupportedVotingSettings
  );
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const client = usePluginClient(type);

  useEffect(() => {
    async function getPluginSettings() {
      try {
        setIsLoading(true);

        const settings = await client?.methods.getVotingSettings(pluginAddress);
        if (settings) setData(settings as VotingSettings);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getPluginSettings();
  }, [client?.methods, pluginAddress]);

  return {data, error, isLoading};
}
