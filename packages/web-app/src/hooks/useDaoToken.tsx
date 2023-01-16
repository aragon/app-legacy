import {useEffect, useState} from 'react';
import {TokenVotingClient, Erc20TokenDetails} from '@aragon/sdk-client';

import {HookData} from 'utils/types';
import {usePluginClient} from './usePluginClient';

export function useDaoToken(
  pluginAddress: string
): HookData<Erc20TokenDetails | undefined> {
  const [data, setData] = useState<Erc20TokenDetails>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const pluginClient = usePluginClient(
    'erc20voting.dao.eth'
  ) as TokenVotingClient;

  useEffect(() => {
    async function getDaoMetadata() {
      try {
        setIsLoading(true);

        const response = await pluginClient?.methods.getToken(pluginAddress);
        if (response) setData(response);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (pluginAddress) getDaoMetadata();
  }, [pluginAddress, pluginClient]);

  return {data, error, isLoading};
}
