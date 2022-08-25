import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Context as SdkContext, ContextParams, Client} from '@aragon/sdk-client';
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

export const UseClientProvider = ({children}: {children: ReactNode}) => {
  const {signer} = useWallet();
  const [client, setClient] = useState<Client>();
  const [context, setContext] = useState<SdkContext>();

  useEffect(() => {
    if (signer) {
      const alchemyApiAddress = import.meta.env
        .VITE_REACT_APP_ALCHEMY_API_KEY as string;
      const alchemyApiKey = import.meta.env
        .VITE_REACT_APP_ALCHEMY_API_URL as string;

      const contextParams: ContextParams = {
        network: 'rinkeby', // TODO: remove temporarily hardcoded network
        signer,
        web3Providers: new Array(alchemyApiAddress.concat(alchemyApiKey)),
        ipfsNodes: [
          {
            url: 'https://testing-ipfs-0.aragon.network/api/v0',
            headers: {
              'X-API-KEY': (import.meta.env.VITE_IPFS_API_KEY as string) || '',
            },
          },
        ],
        daoFactoryAddress: '0xF4433059cb12E224EF33510a3bE3329c8c750fD8', // TODO: remove temporary until SDK updates
        graphqlNodes: [
          {
            url: 'https://api.thegraph.com/subgraphs/name/aragon/aragon-zaragoza-rinkeby',
          },
        ],
      };

      const sdkContext = new SdkContext(contextParams);

      setClient(new Client(sdkContext));
      setContext(sdkContext);
    }
  }, [signer]);

  const value: ClientContext = {
    client: client,
    context: context,
  };

  return (
    <UseClientContext.Provider value={value}>
      {children}
    </UseClientContext.Provider>
  );
};
