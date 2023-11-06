import {
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
  InstalledPluginListItem,
  TokenVotingClient,
} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {HookData} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';
import {useDaoDetailsQuery} from './useDaoDetails';

import {GaslessVotingClient} from '@vocdoni/gasless-voting';

export function useDaoToken(
  pluginAddress?: string
): HookData<Erc20TokenDetails | Erc20WrapperTokenDetails | undefined> {
  const [data, setData] = useState<
    Erc20TokenDetails | Erc20WrapperTokenDetails
  >();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const {data: daoDetails} = useDaoDetailsQuery();
  const {id: pluginType} =
    daoDetails?.plugins[0] || ({} as InstalledPluginListItem);

  const client = usePluginClient(pluginType as PluginTypes);
  const pluginClient = client as GaslessVotingClient | TokenVotingClient;

  useEffect(() => {
    async function getTokenMetadata(address: string) {
      try {
        setIsLoading(true);

        const response = await pluginClient?.methods.getToken(address);

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

    if (pluginAddress) {
      getTokenMetadata(pluginAddress);
    }
  }, [pluginAddress, pluginClient]);

  return {data, error, isLoading};
}
