import React, {useContext, useEffect, useMemo} from 'react';
import {UseWalletProvider, useWallet} from 'use-wallet';
import {Wallet} from 'use-wallet/dist/cjs/types';

import {identifyUser} from 'services/analytics';
import {updateAPMContext, useAPM} from './elasticAPM';
import {useNetwork} from './network';
import {Nullable} from 'utils/types';
import {SupportedChainID, SUPPORTED_CHAIN_ID} from 'utils/constants';

export type WalletAugmented = Wallet & {
  isOnCorrectNetwork: boolean;
};

/* CONTEXT PROVIDER ========================================================= */

const WalletAugmentedContext =
  React.createContext<Nullable<WalletAugmented>>(null);

const WalletAugmented: React.FC<unknown> = ({children}) => {
  const wallet = useWallet();
  const {network} = useNetwork();

  const isOnCorrectNetwork = useMemo(() => {
    // This is necessary as long as we're using useWallet. Once we switch to
    // web3modal entirely, we'll no longer need to rely on the chains defined in
    // useWallet. Instead we'll be rely entirely on the data defined in
    // constants/chains.tsx
    if (wallet.networkName === 'main') return network === 'ethereum';
    else return network === wallet.networkName;
  }, [wallet, network]);

  // TODO this should be moved into a separate hook and then called from within
  // the app component. Afterwards, the wallet should no longer need to be
  // augmented and this whole component should be removed.
  useEffect(() => {
    if (
      wallet.status === 'connected' &&
      typeof wallet.account === 'string' &&
      wallet.connector &&
      wallet.networkName
    ) {
      identifyUser(wallet.account, wallet.networkName, wallet.connector);
    }
  }, [wallet.networkName, wallet.connector, wallet.status, wallet.account]);

  const contextValue = useMemo(() => {
    return {
      isOnCorrectNetwork,
      ...wallet,
    };
  }, [wallet, isOnCorrectNetwork]);

  const {apm} = useAPM();
  useEffect(() => {
    updateAPMContext(apm, wallet.networkName!);
  }, [apm, wallet.networkName]);

  return (
    <WalletAugmentedContext.Provider value={contextValue}>
      {children}
    </WalletAugmentedContext.Provider>
  );
};

type NonEmptyArray<T> = [T, ...T[]];

type Connector = {
  id: string;
  properties: {
    chainId: NonEmptyArray<SupportedChainID>;
  };
};

export const connectors: Connector[] = [
  {
    id: 'injected',
    properties: {
      chainId: [...SUPPORTED_CHAIN_ID],
    },
  },
  {
    id: 'frame',
    properties: {
      chainId: [...SUPPORTED_CHAIN_ID],
    },
  },
];

type UseWalletConnector = Record<
  string,
  {
    chaindId: number[];
  }
>;

const useWalletConnectors: UseWalletConnector = connectors.reduce(
  (prev: UseWalletConnector, curr: Connector) => {
    return {
      ...prev,
      [curr.id]: {chainId: curr.properties.chainId},
    } as UseWalletConnector;
  },
  {} as UseWalletConnector
);

const WalletProvider: React.FC<unknown> = ({children}) => {
  return (
    <UseWalletProvider connectors={useWalletConnectors}>
      <WalletAugmented>{children}</WalletAugmented>
    </UseWalletProvider>
  );
};

/* CONTEXT CONSUMERS ======================================================== */

function useWalletAugmented(): WalletAugmented {
  return useContext(WalletAugmentedContext) as WalletAugmented;
}

export {useWalletAugmented as useWallet, WalletProvider};
