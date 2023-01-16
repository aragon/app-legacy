import {VotingSettings} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';
import {HookData} from 'utils/types';

import {PluginTypes, usePluginClient} from './usePluginClient';

/**
 * Retrieves plugin governance settings from SDK
 * @param pluginAddress plugin from which proposals will be retrieved
 * @param type plugin type
 * @returns plugin governance settings
 */
export function usePluginSettings(
  pluginAddress: string,
  type: PluginTypes
): HookData<VotingSettings> {
  const [data, setData] = useState<VotingSettings>({} as VotingSettings);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const client = usePluginClient(type);

  useEffect(() => {
    async function getPluginSettings() {
      try {
        setIsLoading(true);

        const settings = await client?.methods.getSettings(pluginAddress);
        if (settings) setData(settings);
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
