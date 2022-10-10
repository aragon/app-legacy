import {useEffect, useState} from 'react';
import {ClientErc20, Erc20TokenDetails} from '@aragon/sdk-client';

import {HookData} from 'utils/types';
import {usePluginClient} from './usePluginClient';

export function useDaoToken(
  pluginAddress: string
): HookData<Erc20TokenDetails> {
  const [data, setData] = useState<Erc20TokenDetails>({} as Erc20TokenDetails);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const pluginClient = usePluginClient('erc20voting.dao.eth');

  useEffect(() => {
    async function getDaoMetadata() {
      try {
        setIsLoading(true);

        if (pluginAddress) {
          const dao = await (pluginClient as ClientErc20)?.methods.getToken(
            pluginAddress
          );
          if (dao) setData(dao);
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
