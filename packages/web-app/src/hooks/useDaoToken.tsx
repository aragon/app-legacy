import {useEffect, useState} from 'react';
import {ClientErc20, Erc20TokenDetails} from '@aragon/sdk-client';

import {HookData} from 'utils/types';
import {usePluginClient} from './usePluginClient';

export function useDaoToken(
  pluginAddress: string
): HookData<Erc20TokenDetails | undefined> {
  const [data, setData] = useState<Erc20TokenDetails>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const pluginClient = usePluginClient('erc20voting.dao.eth');

  useEffect(() => {
    async function getDaoMetadata() {
      try {
        setIsLoading(true);

        if (pluginAddress) {
          const data = await (pluginClient as ClientErc20)?.methods.getToken(
            pluginAddress
          );
          console.log('daoToken', data);
          if (data) setData(data);
        }
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getDaoMetadata();
  }, [pluginAddress, pluginClient]);

  return {data, error, isLoading};
}
