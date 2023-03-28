import {
  Client,
  Context as SdkContext,
  ContextParams,
  SupportedNetworks as SdkSupportedNetworks,
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

import {useWallet} from './useWallet';

interface ClientContext {
  client?: Client;
  context?: SdkContext;
  network?: SupportedNetworks;
}

const translateNetwork = (
  sdkNetwork: SdkContext['network']
): SupportedNetworks => {
  if (typeof sdkNetwork !== 'string') {
    return 'unsupported';
  }

  switch (sdkNetwork) {
    case 'mainnet':
      return 'ethereum';
    case 'goerli':
      return 'goerli';
    case 'mumbai':
      return 'mumbai';
    case 'polygon':
      return 'mumbai';
  }
  return 'unsupported';
};

const UseClientContext = createContext<ClientContext>({} as ClientContext);

export const useClient = () => {
  const client = useContext(UseClientContext);
  if (client === null) {
    throw new Error(
      'useClient() can only be used on the descendants of <UseClientProvider />'
    );
  }
  if (client.context) {
    client.network = translateNetwork(client.context.network);
  }
  return client;
};

export const UseClientProvider: React.FC = ({children}) => {
  const {signer} = useWallet();
  const [client, setClient] = useState<Client>();
  const {network} = useNetwork();
  const [context, setContext] = useState<SdkContext>();

  useEffect(() => {
    const translatedNetwork =
      network === 'ethereum' ? 'mainnet' : (network as SdkSupportedNetworks);

    // when network not supported by the SDK, don't set network
    if (!SupportedNetworksArray.includes(translatedNetwork)) {
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
    if (network !== 'ethereum') {
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
      //TODO: replace ethereum with mainnet for network
      network: translatedNetwork,
      signer: signer || undefined,
      web3Providers: CHAIN_METADATA[network].rpc[0],
      ipfsNodes,
      graphqlNodes: [
        {
          url: SUBGRAPH_API_URL[network]!,
        },
      ],
    };

    console.log('check', contextParams);

    const sdkContext = new SdkContext(contextParams);

    console.log('check2', sdkContext);

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
