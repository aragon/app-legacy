import {Client, Context as SdkContext, ContextParams} from '@aragon/sdk-client';
import {useNetwork} from 'context/network';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {CHAIN_METADATA, IPFS_ENDPOINT, SUBGRAPH_API_URL} from 'utils/constants';

import {useWallet} from './useWallet';

interface ClientContext {
  client?: Client;
  context?: SdkContext;
}

const UseClientContext = createContext<ClientContext>({} as ClientContext);

export const useClient = () => {
  const client = useContext(UseClientContext);
  if (client === null) {
    throw new Error(
      'useClient() can only be used on the descendants of <UseClientProvider />'
    );
  }
  return client;
};

export const UseClientProvider: React.FC = ({children}) => {
  const {signer, chainId} = useWallet();
  const [client, setClient] = useState<Client>();
  const {network} = useNetwork();
  const [context, setContext] = useState<SdkContext>();

  const activeNetwork = useMemo(() => {
    if (['ethereum', 'goerli'].includes(network)) return network;

    if (chainId === 5) return 'goerli';

    //TODO: this should change to ethereum once the contract has been deployed
    return 'goerli';
  }, [chainId, network]);

  useEffect(() => {
    const contextParams: ContextParams = {
      //TODO: replace ethereum with mainnet in activeNetworks
      network: activeNetwork === 'ethereum' ? 'mainnet' : 'goerli',
      signer: signer || undefined,
      web3Providers: CHAIN_METADATA[activeNetwork].rpc[0],
      ipfsNodes: [
        {
          url: IPFS_ENDPOINT,
          headers: {
            'X-API-KEY': (import.meta.env.VITE_IPFS_API_KEY as string) || '',
          },
        },
      ],
      daoFactoryAddress: '0xf401dbc7eEf9E8DE629E67154838e8a7D828D2A3',
      graphqlNodes: [
        {
          url: SUBGRAPH_API_URL[activeNetwork]!,
        },
      ],
    };

    const sdkContext = new SdkContext(contextParams);

    setClient(new Client(sdkContext));
    setContext(sdkContext);
  }, [activeNetwork, signer]);

  const value: ClientContext = {
    client,
    context,
  };

  return (
    <UseClientContext.Provider value={value}>
      {children}
    </UseClientContext.Provider>
  );
};
