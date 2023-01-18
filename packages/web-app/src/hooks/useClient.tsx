import {Client, Context as SdkContext, ContextParams} from '@aragon/sdk-client';
import React, {createContext, useContext, useEffect, useState} from 'react';
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
  const {signer} = useWallet();
  const [client, setClient] = useState<Client>();
  const [context, setContext] = useState<SdkContext>();
  // TODO hook this up to useNetwork once other networks become useable.

  useEffect(() => {
    const network = 'goerli';
    const contextParams: ContextParams = {
      network: network,
      signer: signer || undefined,
      web3Providers: CHAIN_METADATA[network].rpc[0],
      ipfsNodes: [
        {
          url: IPFS_ENDPOINT,
          headers: {
            'X-API-KEY': (import.meta.env.VITE_IPFS_API_KEY as string) || '',
          },
        },
      ],
      daoFactoryAddress: '0x66DBb74f6cADD2486CBFf0b9DF211e3D7961eBf9', // TODO: remove temporary until SDK updates
      graphqlNodes: [
        {
          url: SUBGRAPH_API_URL[network]!,
        },
      ],
    };

    const sdkContext = new SdkContext(contextParams);

    setClient(new Client(sdkContext));
    setContext(sdkContext);
  }, [signer]);

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
