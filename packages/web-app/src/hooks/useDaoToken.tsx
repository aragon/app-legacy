import {Erc20TokenDetails, Erc20WrapperTokenDetails} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {HookData} from 'utils/types';
import {usePluginClient} from './usePluginClient';

export function useDaoToken(
  pluginAddress: string
): HookData<Erc20TokenDetails | Erc20WrapperTokenDetails | undefined> {
  const [data, setData] = useState<
    Erc20TokenDetails | Erc20WrapperTokenDetails
  >();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const pluginClient = usePluginClient('token-voting.plugin.dao.eth');

  useEffect(() => {
    async function getDaoMetadata() {
      try {
        setIsLoading(true);

        const response = await pluginClient?.methods.getToken(pluginAddress);

        if (response) {
          setData(response as Erc20TokenDetails | Erc20WrapperTokenDetails);
        }
      } catch (err) {
        console.error('Error fetching DAO token', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (pluginAddress) getDaoMetadata();
  }, [pluginAddress, pluginClient]);

  return {data, error, isLoading};
}
