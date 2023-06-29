import {useEffect, useState} from 'react';
import {
  TokenVotingClient,
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
} from '@aragon/sdk-client';

import {HookData} from 'utils/types';
import {usePluginClient} from './usePluginClient';

export function useDaoToken(
  pluginAddress: string
): HookData<Erc20TokenDetails | undefined> {
  const [data, setData] = useState<
    Erc20TokenDetails | Erc20WrapperTokenDetails
  >();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const pluginClient = usePluginClient(
    'token-voting.plugin.dao.eth'
  ) as TokenVotingClient;

  useEffect(() => {
    async function getDaoMetadata() {
      try {
        setIsLoading(true);

        const response = await pluginClient?.methods.getToken(pluginAddress);
        if (response) {
          const underlyingToken = (
            response as Erc20WrapperTokenDetails | undefined
          )?.underlyingToken;

          const finalResponse = response as Erc20TokenDetails;

          setData({
            ...finalResponse,
            decimals: underlyingToken
              ? underlyingToken.decimals
              : finalResponse.decimals,
          });
        }
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
