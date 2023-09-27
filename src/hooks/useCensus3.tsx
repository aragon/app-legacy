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
    async function checkSupported() {
      (await census3.getSupportedChains()).includes(chainId)
        ? setIsSupported(true)
        : setIsSupported(false);
    }

    if (chainId && census3) {
      checkSupported();
    }
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
      // todo(kon): this part is gonna be done during the dao creation, so not need to be done here. Neither error handling?
      // const chain = 80003;
      if (!isSupported) throw Error('ChainId is not supported');
      // Check if the census is already sync
      try {
        const token = await client?.methods.getToken(pluginAddress);
        if (!token) throw 'Cannot retrieve the token';
        await census3.createToken(token.address, 'erc20', chainId);
      } catch (e) {
        if (e instanceof ErrTokenAlreadyExists) {
          console.log('DEBUG', 'Token already created');
        }
        // todo(kon): handle chain is not supported
        else if (
          e instanceof Error &&
          e.message.includes('chain ID provided not supported')
        ) {
          throw Error('ChainId is not supported');
        } else throw e;
      }
    },
    [census3, chainId, client?.methods, isSupported]
  );

  return {createToken};
};
