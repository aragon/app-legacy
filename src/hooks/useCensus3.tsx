import {useClient} from '@vocdoni/react-providers';
import {useCallback, useEffect, useState} from 'react';
import {GaselessPluginName, usePluginClient} from './usePluginClient';
import {ErrTokenAlreadyExists} from '@vocdoni/sdk';

const CENSUS3_URL = 'https://census3-stg.vocdoni.net/api';

export const useCensus3Client = () => {
  const {census3} = useClient();
  census3.url = CENSUS3_URL;
  return census3;
};

/**
 * Hook to know if the actual wallet chain id is supported by the census3 vocdoni service
 */
export const useCensus3SupportedChains = (chainId: number) => {
  const census3 = useCensus3Client();
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    (async () => {
      if (chainId && census3) {
        const supported = (await census3.getSupportedChains())
          .map(chain => chain.chainID)
          .includes(chainId);
        setIsSupported(supported);
      }
    })();
  }, [census3, chainId]);

  return isSupported;
};

export const useCensus3CreateToken = ({chainId}: {chainId: number}) => {
  const client = usePluginClient(GaselessPluginName);
  const census3 = useCensus3Client();
  const isSupported = useCensus3SupportedChains(chainId);

  const createToken = useCallback(
    async (pluginAddress: string) => {
      if (!isSupported) throw Error('ChainId is not supported');
      // Check if the census is already sync
      try {
        const token = await client?.methods.getToken(pluginAddress);
        if (!token) throw 'Cannot retrieve the token';
        await census3.createToken(token.address, 'erc20', chainId, undefined, [
          'aragon/app',
        ]);
      } catch (e) {
        if (!(e instanceof ErrTokenAlreadyExists)) {
          throw e;
        }
      }
    },
    [census3, chainId, client?.methods, isSupported]
  );

  return {createToken};
};
