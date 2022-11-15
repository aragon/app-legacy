import {InfuraProvider, Web3Provider} from '@ethersproject/providers';
import React, {createContext, useContext, useEffect, useState} from 'react';

import {useWallet} from 'hooks/useWallet';
import {
  CHAIN_METADATA,
  INFURA_PROJECT_ID,
  SupportedChainID,
} from 'utils/constants';
import {Nullable} from 'utils/types';
import {useNetwork} from './network';

const NW_ARB = {chainId: 42161, name: 'arbitrum'};
const NW_ARB_GOERLI = {chainId: 421613, name: 'arbitrum-goerli'};

/* CONTEXT PROVIDER ========================================================= */

type Providers = {
  infura: InfuraProvider;
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

  const [infuraProvider, setInfuraProvider] = useState(
    new InfuraProvider(NW_ARB, INFURA_PROJECT_ID)
  );

  useEffect(() => {
    const chainId = CHAIN_METADATA[network].id;
    setInfuraProvider(getInfuraProvider(chainId as SupportedChainID));
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

function getInfuraProvider(givenChainId?: SupportedChainID) {
  // NOTE Passing the chainIds from useWallet doesn't work in the case of
  // arbitrum and arbitrum-goerli. They need to be passed as objects.
  // However, I have no idea why this is necessary. Looking at the ethers
  // library, there's no reason why passing the chainId wouldn't work. Also,
  // I've tried it on a fresh project and had no problems there...
  // [VR 07-03-2022]
  if (givenChainId === 42161) {
    return new InfuraProvider(NW_ARB, INFURA_PROJECT_ID);
  } else if (givenChainId === 421613) {
    return new InfuraProvider(NW_ARB_GOERLI, INFURA_PROJECT_ID);
  } else {
    return new InfuraProvider(givenChainId, INFURA_PROJECT_ID);
  }
}

/**
 * Returns provider based on the given chain id
 * @param chainId network chain is
 * @returns infura provider
 */
export function useSpecificProvider(chainId: SupportedChainID): InfuraProvider {
  const [infuraProvider, setInfuraProvider] = useState(
    getInfuraProvider(chainId)
  );

  useEffect(() => {
    setInfuraProvider(getInfuraProvider(chainId));
  }, [chainId]);

  return infuraProvider;
}

/* CONTEXT CONSUMER ========================================================= */

export function useProviders(): NonNullable<Providers> {
  return useContext(ProviderContext) as Providers;
}
