import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {JsonRpcSigner, Web3Provider} from '@ethersproject/providers';
import Web3Modal, {IProviderOptions} from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

// Context

/***
 * This is the useSigner component borrowed from use-signer Library
 * This will help use web3modal directly without using use-signer with minimum change
 * in the app
 *
 * For WalletConnect migration V2 this component should be removed!
 */

export type SignerValue = {
  /** An ethers.js Web3Provider (if available) */
  provider: Web3Provider | null;
  /** An ethers.js JsonRpcSigner (if available) */
  signer: JsonRpcSigner | null;
  /** Whether web3modal is connected to a wallet or not */
  status: 'disconnected' | 'connecting' | 'connected';
  /** The address of the currently active wallet (if available) */
  address: string | null;
  /** The chainId of the currently selected network */
  chainId: number;
  methods: {
    /** Opens the Web3 pop up. Throws an Error if something fails */
    selectWallet: (
      cacheProvider?: boolean,
      networkId?: string
    ) => Promise<void>;
    /** Updates the current chainId */
    refreshChainId: () => Promise<void>;
    /** Closes the connection to the currently active connection */
    disconnect: () => Promise<void>;
  };
};
const SignerContext = createContext<SignerValue>({} as SignerValue);

export function UseSignerProvider({
  children,
  providerOptions = {},
  defaultChainId = 1,
}: {
  children: ReactNode;
  providerOptions?: IProviderOptions;
  defaultChainId?: number;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [instance, setInstance] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState(defaultChainId);
  let web3Modal: Web3Modal | undefined;

  /** Opens the Web3 pop up. Throws an Error if something fails. */
  const selectWallet = (cacheProvider = true, networkId?: string) => {
    web3Modal = new Web3Modal({
      network: networkId,
      cacheProvider,
      providerOptions,
    });

    setConnecting(true);

    return web3Modal
      .connect()
      .then(instance => {
        setInstance(instance);

        return new Web3Provider(instance).getSigner().getChainId();
      })
      .then(chainId => {
        setChainId(chainId);
        setConnecting(false);
        setConnected(true);
      })
      .catch(err => {
        setConnecting(false);
        throw err;
      });
  };

  const disconnect = () => {
    setInstance(null);
    setConnected(false);
    setConnecting(false);
    setAddress(null);

    web3Modal?.clearCachedProvider();

    const provider = new Web3Provider(instance)
      .provider as WalletConnectProvider;
    if (!provider.isWalletConnect) {
      return Promise.resolve();
    }
    return provider.close?.();
  };

  const refreshChainId = () => {
    if (!instance) {
      return Promise.resolve();
    }

    return new Web3Provider(instance)
      .getSigner()
      .getChainId()
      .then(chainId => setChainId(chainId));
  };

  useEffect(() => {
    if (!instance) {
      if (connected) setConnected(false);
      return;
    }

    instance.on('accountsChanged', (accounts: string[]) => {
      // Return the new address
      if (accounts[0]) {
        setAddress(accounts[0]);
      } else {
        setAddress(null);
        setConnected(false);
      }
    });

    // chainId is a hex string
    instance.on('chainChanged', () => {
      refreshChainId();
    });

    // chainId is a hex string
    instance.on('connect', () => {
      setConnected(true);
      refreshChainId();
    });

    instance.on('disconnect', (error: {code: number; message: string}) => {
      // @DEV: see https://github.com/MetaMask/metamask-extension/issues/13375
      // 1013 indicates that MetaMask is attempting to reestablish the connection
      // https://github.com/MetaMask/providers/releases/tag/v8.0.0
      if (error.code === 1013) {
        console.warn(
          'MetaMask logged connection error 1013: "Try again later"'
        );
        return;
      }
      console.log(error);
      setAddress(null);
      setConnected(false);
    });

    // Update address
    new Web3Provider(instance)
      .getSigner()
      .getAddress()
      .then((address: string) => setAddress(address));

    return () => {
      instance?.removeAllListeners?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  const provider = instance ? new Web3Provider(instance) : null;
  const signer = provider ? provider.getSigner() : null;

  let status: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  if (connecting) status = 'connecting';
  else if (connected) status = 'connected';

  // VALUE
  const value: SignerValue = {
    status,
    provider,
    signer,
    address,
    chainId,
    methods: {
      selectWallet,
      refreshChainId,
      disconnect,
    },
  };

  return (
    <SignerContext.Provider value={value}>{children}</SignerContext.Provider>
  );
}

export function useSigner() {
  return useContext(SignerContext);
}
