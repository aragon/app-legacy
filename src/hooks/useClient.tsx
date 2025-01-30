import {Client, Context as SdkContext, ContextParams} from '@aragon/sdk-client';
import {
  getNetworkDeploymentForVersion,
  SupportedNetworks as SdkSupportedNetworks,
  SupportedVersions,
} from '@aragon/osx-commons-configs';

import {useNetwork} from 'context/network';
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
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
      !Object.values(SdkSupportedNetworks).includes(translatedNetwork)
    ) {
      return;
    }

    // Set fixed 1.3 version for DaoFactory address as versions
    // 1.4 and above are not supported by this application. The
    // TokenVotingRepoProxy and MultisigRepoProxy addresses are
    // instead already set as fixed on the SDK, see:
    // TokenVoting: https://github.com/aragon/sdk/blob/develop/modules/client/src/tokenVoting/internal/client/encoding.ts#L61
    // Multisig: https://github.com/aragon/sdk/blob/develop/modules/client/src/multisig/internal/client/encoding.ts#L65
    const daoFactoryAddress =
      getNetworkDeploymentForVersion(
        translatedNetwork,
        SupportedVersions.V1_3_0
      )?.DAOFactory.address ?? '';

    const contextParams: ContextParams = {
      DAOFactory: daoFactoryAddress,
      network: translatedNetwork,
      signer: signer ?? undefined,
      web3Providers: aragonGateway.buildRpcUrl(network)!,
      ipfsNodes: [],
      graphqlNodes: [{url: SUBGRAPH_API_URL[network]!}],
    };

    const sdkContext = new SdkContext(contextParams);

    setClient(new Client(sdkContext));
    setContext(sdkContext);
  }, [network, signer]);

  const value: ClientContext = useMemo(
    () => ({
      client,
      context,
    }),
    [client, context]
  );

  return (
    <UseClientContext.Provider value={value}>
      {children}
    </UseClientContext.Provider>
  );
};
