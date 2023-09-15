import {useWallet} from './useWallet';
import {useClient} from '@vocdoni/react-providers';
import {useEffect, useState} from 'react';

/**
 * Hook to know if the actual wallet chain id is supported by the census3 vocdoni service
 */
const useCensus3SupportedChains = () => {
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

export default useCensus3SupportedChains;
