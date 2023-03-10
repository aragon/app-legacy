import {JsonRpcSigner, Web3Provider} from '@ethersproject/providers';
import {
  useAccount,
  useSigner,
  useDisconnect,
  useBalance,
  useEnsName,
  useEnsAvatar,
  useNetwork as useWagmiNetwork,
} from 'wagmi';
import {BigNumber} from 'ethers';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';

import {useWeb3Modal} from '@web3modal/react';

export interface IUseWallet {
  balance: BigNumber | null;
  ensAvatarUrl: string;
  ensName: string;
  isConnected: boolean;
  isOnWrongNetwork: boolean;
  network: string;
  provider: Web3Provider | null;
  signer: JsonRpcSigner | null;
  status: 'connecting' | 'reconnecting' | 'connected' | 'disconnected';
  address: string | null;
  chainId: number;
  methods: {
    selectWallet: (
      cacheProvider?: boolean,
      networkId?: string
    ) => Promise<void>;
    disconnect: () => Promise<void>;
  };
}

export const useWallet = (): IUseWallet => {
  const {network} = useNetwork();

  const {data: signer} = useSigner();
  const {chain} = useWagmiNetwork();
  const {address, status: wagmiStatus, isConnected} = useAccount();
  const {disconnect} = useDisconnect();
  const {open: openWeb3Modal} = useWeb3Modal();

  const {data: wagmiBalance} = useBalance({
    address,
  });

  const {data: ensName} = useEnsName({
    address,
  });

  const {data: ensAvatarUrl} = useEnsAvatar({
    address,
  });

  const provider: Web3Provider = signer?.provider as Web3Provider;
  const chainId: number = chain?.id || 0;
  const balance: BigNumber | null = wagmiBalance?.value || null;
  const isOnWrongNetwork: boolean =
    isConnected && CHAIN_METADATA[network].id !== chainId;

  const methods = {
    selectWallet: async (cacheProvider?: boolean, networkId?: string) => {
      await new Promise(resolve => {
        openWeb3Modal();
        resolve({
          networkId,
          cacheProvider,
        });
      });
    },
    disconnect: async () => {
      await new Promise(resolve => {
        disconnect();
        resolve(true);
      });
    },
  };

  return {
    provider: provider as Web3Provider,
    signer: signer as JsonRpcSigner,
    status: wagmiStatus,
    address: address as string,
    chainId,
    balance,
    ensAvatarUrl: ensAvatarUrl as string,
    ensName: ensName as string,
    isConnected,
    isOnWrongNetwork,
    methods,
    network,
  };
};
