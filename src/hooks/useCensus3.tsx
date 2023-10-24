import {useWallet} from './useWallet';
import {useClient} from '@vocdoni/react-providers';
import {useCallback, useEffect, useState} from 'react';
import {GaselessPluginName, usePluginClient} from './usePluginClient';
import {ErrTokenAlreadyExists} from '@vocdoni/sdk';

/**
 * Hook to know if the actual wallet chain id is supported by the census3 vocdoni service
 */
export const useCensus3SupportedChains = () => {
  const {chainId} = useWallet();
  const {census3} = useClient();
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    (async () => {
      if (chainId && census3) {
        setIsSupported((await census3.getSupportedChains()).includes(chainId));
      }
    })();
  }, [census3, chainId]);

  return {isSupported};
};

export const useCensus3CreateToken = () => {
  const client = usePluginClient(GaselessPluginName);
  const {census3} = useClient();
  const {chainId} = useWallet();
  const {isSupported} = useCensus3SupportedChains();

  const createToken = useCallback(
    async (pluginAddress: string) => {
      if (!isSupported) throw Error('ChainId is not supported');
      // Check if the census is already sync
      try {
        const token = await client?.methods.getToken(pluginAddress);
        if (!token) throw 'Cannot retrieve the token';
        await census3.createToken(token.address, 'erc20', chainId);
      } catch (e) {
        if (e instanceof ErrTokenAlreadyExists) {
          console.log('DEBUG', 'Token already created');
        } else throw e;
      }
    },
    [census3, chainId, client?.methods, isSupported]
  );

  return {createToken};
};
