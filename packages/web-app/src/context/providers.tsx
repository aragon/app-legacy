import {
  AlchemyProvider,
  InfuraProvider,
  JsonRpcProvider,
  Web3Provider,
} from '@ethersproject/providers';
import React, {createContext, useContext, useEffect, useState} from 'react';

import {
  LIVE_CONTRACTS,
  SupportedNetworks as sdkSupportedNetworks,
} from '@aragon/sdk-client';
import {useWallet} from 'hooks/useWallet';
import {
  alchemyApiKeys,
  CHAIN_METADATA,
  getSupportedNetworkByChainId,
  infuraApiKey,
  SupportedChainID,
  SupportedNetworks,
} from 'utils/constants';
import {Nullable} from 'utils/types';
import {useNetwork} from './network';
import {translateToNetworkishName} from 'utils/library';

const NW_ARB = {chainId: 42161, name: 'arbitrum'};
const NW_ARB_GOERLI = {chainId: 421613, name: 'arbitrum-goerli'};

/* CONTEXT PROVIDER ========================================================= */

type Providers = {
  infura: InfuraProvider | JsonRpcProvider;
  web3: Nullable<Web3Provider>;
};

const ProviderContext = createContext<Nullable<Providers>>(null);

type ProviderProviderProps = {
  children: React.ReactNode;
};

/**
 * Returns two blockchain providers.
 *
 * The infura provider is always available, regardless of whether or not a
 * wallet is connected.
 *
 * The web3 provider, however, is based on the conencted and wallet and will
 * therefore be null if no wallet is connected.
 */
export function ProvidersProvider({children}: ProviderProviderProps) {
  const {provider} = useWallet();
  const {network} = useNetwork();

  const [infuraProvider, setInfuraProvider] = useState<Providers['infura']>(
    new InfuraProvider(NW_ARB, infuraApiKey)
  );

  useEffect(() => {
    setInfuraProvider(getInfuraProvider(network));
  }, [network]);

  return (
    <ProviderContext.Provider
      // TODO: remove casting once useSigner has updated its version of the ethers library
      value={{infura: infuraProvider, web3: (provider as Web3Provider) || null}}
    >
      {children}
    </ProviderContext.Provider>
  );
}

function getInfuraProvider(network: SupportedNetworks) {
  // NOTE Passing the chainIds from useWallet doesn't work in the case of
  // arbitrum and arbitrum-goerli. They need to be passed as objects.
  // However, I have no idea why this is necessary. Looking at the ethers
  // library, there's no reason why passing the chainId wouldn't work. Also,
  // I've tried it on a fresh project and had no problems there...
  // [VR 07-03-2022]
  if (network === 'arbitrum') {
    return new InfuraProvider(NW_ARB, infuraApiKey);
  } else if (network === 'arbitrum-test') {
    return new InfuraProvider(NW_ARB_GOERLI, infuraApiKey);
  } else if (network === 'mumbai' || network === 'polygon') {
    return new JsonRpcProvider(CHAIN_METADATA[network].rpc[0], {
      chainId: CHAIN_METADATA[network].id,
      name: translateToNetworkishName(network),
      ensAddress:
        LIVE_CONTRACTS[
          translateToNetworkishName(network) as sdkSupportedNetworks
        ].ensRegistry,
    });
  } else {
    return new InfuraProvider(CHAIN_METADATA[network].id, infuraApiKey);
  }
}

/**
 * Returns an AlchemyProvider instance for the given chain ID
 * or null if the API key is not available.
 * @param chainId - The numeric chain ID associated with the desired network.
 * @returns An AlchemyProvider instance for the specified network or null if the API key is not found.
 */
export function getAlchemyProvider(chainId: number): AlchemyProvider | null {
  const network = getSupportedNetworkByChainId(chainId) as SupportedNetworks;
  const apiKey = alchemyApiKeys[network];
  const translatedNetwork = translateToNetworkishName(network);

  return apiKey && translatedNetwork !== 'unsupported'
    ? new AlchemyProvider(translatedNetwork, apiKey)
    : null;
}

/**
 * Returns provider based on the given chain id
 * @param chainId network chain is
 * @returns infura provider
 */
export function useSpecificProvider(
  chainId: SupportedChainID
): Providers['infura'] {
  const network = getSupportedNetworkByChainId(chainId) as SupportedNetworks;

  const [infuraProvider, setInfuraProvider] = useState(
    getInfuraProvider(network)
  );

  useEffect(() => {
    setInfuraProvider(getInfuraProvider(network));
  }, [chainId, network]);

  return infuraProvider;
}

/* CONTEXT CONSUMER ========================================================= */

export function useProviders(): NonNullable<Providers> {
  return useContext(ProviderContext) as Providers;
}
