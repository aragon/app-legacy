import {
  LIVE_CONTRACTS,
  SupportedVersion,
  SupportedNetwork as sdkSupportedNetworks,
} from '@aragon/sdk-client-common';
import {
  AlchemyProvider,
  InfuraProvider,
  JsonRpcProvider,
  Networkish,
  Web3Provider,
} from '@ethersproject/providers';
import React, {createContext, useContext, useMemo} from 'react';

import {useWallet} from 'hooks/useWallet';
import {
  CHAIN_METADATA,
  NETWORKS_WITH_CUSTOM_REGISTRY,
  SupportedChainID,
  SupportedNetworks,
  alchemyApiKeys,
  getSupportedNetworkByChainId,
  infuraApiKey,
} from 'utils/constants';
import {translateToNetworkishName} from 'utils/library';
import {Nullable} from 'utils/types';
import {useNetwork} from './network';

/* CONTEXT PROVIDER ========================================================= */

export type ApiProvider = JsonRpcProvider | AlchemyProvider | InfuraProvider;

type Providers = {
  api: ApiProvider;
  web3: Nullable<Web3Provider>;
};

const ProvidersContext = createContext<Nullable<Providers>>(null);

type ProvidersContextProps = {
  children: React.ReactNode;
};

export function ProvidersContextProvider({children}: ProvidersContextProps) {
  const {network} = useNetwork();
  const {provider} = useWallet();
  const apiProvider = useSpecificProvider(network);

  // given that nothing should work on unsupported networks,
  // asserting that apiProvider is always non null.
  const contextValue = useMemo(
    () => ({api: apiProvider!, web3: provider}),
    [apiProvider, provider]
  );

  return (
    <ProvidersContext.Provider value={contextValue}>
      {children}
    </ProvidersContext.Provider>
  );
}

/* CONTEXT CONSUMER ========================================================= */

export function useProviders(): NonNullable<Providers> {
  const context = useContext(ProvidersContext);

  // Check if context is defined
  if (context == null) {
    throw new Error(
      'useProviders must be used within a ProvidersContextProvider'
    );
  }

  return context as Providers;
}

/**
 * React hook that provides a blockchain provider based on the given chain ID or network.
 *
 * @param chainIdOrNetwork - The chain ID or network to get the provider for.
 * @returns A blockchain provider, which may be an AlchemyProvider, InfuraProvider,
 * JsonRpcProvider, or null if no suitable provider can be found.
 */
export function useSpecificProvider(
  chainIdOrNetwork: SupportedChainID | SupportedNetworks
): AlchemyProvider | InfuraProvider | JsonRpcProvider | null {
  const provider = useMemo(
    () => getApiProvider(chainIdOrNetwork),
    [chainIdOrNetwork]
  );
  return provider;
}

/**
 * Returns an AlchemyProvider instance for the given chain ID or network.
 * If the network is unsupported or the API key for the supported network
 * is not available, the function returns `null`.
 *
 * @param chainIdOrNetwork - The numeric chain ID or network string associated
 * with the desired network.
 * @returns An `AlchemyProvider` instance for the specified network or `null`
 * if the API key is not found or the network is unsupported
 */
export function getAlchemyProvider(
  chainIdOrNetwork: SupportedChainID | SupportedNetworks
): AlchemyProvider | null {
  const network = toNetwork(chainIdOrNetwork);

  if (!network || network === 'unsupported') {
    return null;
  }

  const apiKey = alchemyApiKeys[network];
  if (!apiKey) {
    return null;
  }

  const networkishOptions: Networkish = {
    chainId: CHAIN_METADATA[network]?.id,
    name: translateToNetworkishName(network),
  };

  if (NETWORKS_WITH_CUSTOM_REGISTRY.includes(network)) {
    networkishOptions.ensAddress =
      LIVE_CONTRACTS[SupportedVersion.LATEST][
        networkishOptions.name as sdkSupportedNetworks
      ].ensRegistryAddress;
  }

  return new AlchemyProvider(networkishOptions, apiKey);
}

/**
 * Returns an InfuraProvider instance for the given chain ID or network,
 * or `null` if the network is not supported.
 *
 * @param chainIdOrNetwork - The numeric chain ID or network string associated
 *  with the desired network.
 * @returns An `InfuraProvider` instance for the specified network or `null`
 *  if the network is unsupported.
 */
export function getInfuraProvider(
  chainIdOrNetwork: SupportedChainID | SupportedNetworks
): InfuraProvider | null {
  const InfuraUnsupportedNetworks = ['base', 'base-goerli', 'unsupported'];
  const network = toNetwork(chainIdOrNetwork);

  if (!network || InfuraUnsupportedNetworks.includes(network)) {
    return null;
  }

  const networkishOptions: Networkish = {
    chainId: CHAIN_METADATA[network]?.id,
    name: translateToNetworkishName(network),
  };

  if (NETWORKS_WITH_CUSTOM_REGISTRY.includes(network)) {
    networkishOptions.ensAddress =
      LIVE_CONTRACTS[SupportedVersion.LATEST][
        networkishOptions.name as sdkSupportedNetworks
      ].ensRegistryAddress;
  }

  return new InfuraProvider(networkishOptions, infuraApiKey);
}

/**
 * Creates a JSON-RPC provider for the given chain ID or network.
 * @remarks This is mostly intended for networks not supported by Alchemy and Infura
 * @param chainIdOrNetwork - The chain ID or network to create the provider for.
 * @returns The JSON-RPC provider instance or null if the chain or network is unsupported.
 */
export function getJsonRpcProvider(
  chainIdOrNetwork: SupportedChainID | SupportedNetworks
): JsonRpcProvider | null {
  const network = toNetwork(chainIdOrNetwork);

  // return null if the network is not supported or cannot be determined.
  if (!network || network === 'unsupported') {
    return null;
  }

  const networkishOptions: Networkish = {
    chainId: CHAIN_METADATA[network]?.id,
    name: translateToNetworkishName(network),
  };

  if (NETWORKS_WITH_CUSTOM_REGISTRY.includes(network)) {
    networkishOptions.ensAddress =
      LIVE_CONTRACTS[SupportedVersion.LATEST][
        networkishOptions.name as sdkSupportedNetworks
      ].ensRegistryAddress;
  }

  return new JsonRpcProvider(
    CHAIN_METADATA[network]?.rpc?.[0],
    networkishOptions
  );
}

function getApiProvider(
  chainIdOrNetwork: SupportedChainID | SupportedNetworks
): AlchemyProvider | InfuraProvider | JsonRpcProvider | null {
  let provider;

  provider = getInfuraProvider(chainIdOrNetwork);
  if (provider) {
    return provider;
  }

  provider = getAlchemyProvider(chainIdOrNetwork);
  if (provider) {
    return provider;
  }

  provider = getJsonRpcProvider(chainIdOrNetwork);
  return provider;
}

function toNetwork(
  chainIdOrNetwork: SupportedChainID | SupportedNetworks
): SupportedNetworks | null {
  if (typeof chainIdOrNetwork === 'number') {
    return getSupportedNetworkByChainId(chainIdOrNetwork) ?? null;
  } else if (typeof chainIdOrNetwork === 'string') {
    return chainIdOrNetwork;
  } else return null;
}
