import {Client, Context as SdkContext, ContextParams} from '@aragon/sdk-client';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {ALCHEMY_API_KEY, SUBGRAPH_API_URL} from 'utils/constants';

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

  useEffect(() => {
    // const alchemyApiAddress = import.meta.env
    //   .VITE_REACT_APP_ALCHEMY_API_KEY as string;

    const contextParams: ContextParams = {
      network: 'goerli', // TODO: remove temporarily hardcoded network
      signer: signer || undefined,
      web3Providers: new Array(
        `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      ),
      ipfsNodes: [
        {
          url: 'https://testing-ipfs-0.aragon.network/api/v0',
          headers: {
            'X-API-KEY': (import.meta.env.VITE_IPFS_API_KEY as string) || '',
          },
        },
      ],
      daoFactoryAddress: '0x8B4Ca38524fCeCbD5acA39C7cd2f3B762B1d91Bf', // TODO: remove temporary until SDK updates
      graphqlNodes: [
        {
          url: SUBGRAPH_API_URL['goerli']!,
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
