import {Client, Context as SdkContext, ContextParams} from '@aragon/sdk-client';
import {
  LIVE_CONTRACTS,
  SupportedVersion,
  SupportedNetworksArray,
} from '@aragon/sdk-client-common';

import {useNetwork} from 'context/network';
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {SUBGRAPH_API_URL, SupportedNetworks} from 'utils/constants';
import {translateToAppNetwork, translateToNetworkishName} from 'utils/library';
import {useWallet} from './useWallet';
import {aragonGateway} from 'utils/aragonGateway';

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

export const UseClientProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
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

    const ipfsNodes = [
      {
        url: aragonGateway.ipfsUrl,
        headers: {'X-API-KEY': import.meta.env.VITE_GATEWAY_IPFS_API_KEY},
      },
    ];

    const contextParams: ContextParams = {
      daoFactoryAddress:
        LIVE_CONTRACTS[SupportedVersion.LATEST][translatedNetwork]
          .daoFactoryAddress,
      network: translatedNetwork,
      signer: signer ?? undefined,
      web3Providers: aragonGateway.buildRpcUrl(network)!,
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
