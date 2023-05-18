import {
  Client,
  Context as SdkContext,
  ContextParams,
  LIVE_CONTRACTS,
  SupportedNetworksArray,
} from '@aragon/sdk-client';

import {useNetwork} from 'context/network';
import React, {createContext, useContext, useEffect, useState} from 'react';

import {
  CHAIN_METADATA,
  IPFS_ENDPOINT_MAIN_0,
  IPFS_ENDPOINT_MAIN_1,
  IPFS_ENDPOINT_TEST,
  SUBGRAPH_API_URL,
  SupportedNetworks,
} from 'utils/constants';
import {translateToAppNetwork, translateToNetworkishName} from 'utils/library';
import {useWallet} from './useWallet';

interface ClientContext {
  client?: Client;
  context?: SdkContext;
  network?: SupportedNetworks;
}

const UseClientContext = createContext<ClientContext>({} as ClientContext);

export const useClient = () => {
  const client = useContext(UseClientContext);
  if (client === null) {
    throw new Error(
      'useClient() can only be used on the descendants of <UseClientProvider />'
    );
  }
  if (client.context) {
    client.network = translateToAppNetwork(client.context.network);
  }
  return client;
};

export const UseClientProvider: React.FC = ({children}) => {
  const {signer} = useWallet();
  const [client, setClient] = useState<Client>();
  const {network} = useNetwork();
  const [context, setContext] = useState<SdkContext>();

  useEffect(() => {
    const translatedNetwork = translateToNetworkishName(network);

    // when network not supported by the SDK, don't set network
    if (
      translatedNetwork === 'unsupported' ||
      !SupportedNetworksArray.includes(translatedNetwork)
    ) {
      return;
    }

    let ipfsNodes = [
      {
        url: IPFS_ENDPOINT_MAIN_0,
        headers: {
          'X-API-KEY': (import.meta.env.VITE_IPFS_API_KEY as string) || '',
        },
      },
      {
        url: IPFS_ENDPOINT_MAIN_1,
        headers: {
          'X-API-KEY': (import.meta.env.VITE_IPFS_API_KEY as string) || '',
        },
      },
    ];

    if (CHAIN_METADATA[network].testnet) {
      ipfsNodes = [
        {
          url: IPFS_ENDPOINT_TEST,
          headers: {
            'X-API-KEY': (import.meta.env.VITE_IPFS_API_KEY as string) || '',
          },
        },
      ];
    }

    const contextParams: ContextParams = {
      daoFactoryAddress: LIVE_CONTRACTS[translatedNetwork].daoFactory,
      network: translatedNetwork,
      signer: signer ?? undefined,
      web3Providers: CHAIN_METADATA[network].rpc[0],
      ipfsNodes,
      graphqlNodes: [{url: SUBGRAPH_API_URL[network]!}],
    };

    const sdkContext = new SdkContext(contextParams);

    setClient(new Client(sdkContext));
    setContext(sdkContext);
  }, [network, signer]);

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
