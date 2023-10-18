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

import {
  CHAIN_METADATA,
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
        url: `${CHAIN_METADATA[network].ipfs}/api/v0`,
        headers: {
          'X-API-KEY': (import.meta.env.VITE_IPFS_API_KEY as string) || '',
        },
      },
    ];

    const contextParams: ContextParams = {
      daoFactoryAddress:
        LIVE_CONTRACTS[SupportedVersion.LATEST][translatedNetwork]
          .daoFactoryAddress,
      network: translatedNetwork,
      signer: signer ?? undefined,
      web3Providers: CHAIN_METADATA[network].rpc[0],
      ipfsNodes,
      graphqlNodes: [{url: SUBGRAPH_API_URL[network]!}],
      ...(translatedNetwork === 'local' && {
        daoFactoryAddress: '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1',
        pluginSetupProcessorAddress:
          '0x59b670e9fA9D0A427751Af201D676719a970857b',
        multisigRepoAddress: '0xD235571A8ED990638699d87c1e7527F576C91aB7',
        adminRepoAddress: '0x8755D348E575Fc4a68EC5d0B609BC7c070ebeA3d',
        addresslistVotingRepoAddress:
          '0x624dC0EcEFD94640D316eE3ACfD147Ed9B764638',
        tokenVotingRepoAddress: '0x94cD1b4DeA480E09A1e0d83f6C92b9A5C6136171',
        multisigSetupAddress: '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690',
        adminSetupAddress: '0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E',
        addresslistVotingSetupAddress:
          '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F',
        tokenVotingSetupAddress: '0x67d269191c92Caf3cD7723F116c85e6E9bf55933',
        ensRegistryAddress: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
      }),
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
