import {useSigner, SignerValue} from 'context/signer';
import {useEffect, useMemo, useState} from 'react';
import {BigNumber} from 'ethers';
import {JsonRpcProvider} from '@ethersproject/providers';

import {useNetwork} from 'context/network';
import {CHAIN_METADATA, translateToSdkNetwork} from 'utils/constants';
import {LIVE_CONTRACTS, SupportedNetworks} from '@aragon/sdk-client';

export interface IUseWallet extends SignerValue {
  balance: BigNumber | null;
  ensAvatarUrl: string;
  ensName: string;
  isConnected: boolean;
  /**
   * Returns true iff the wallet is connected and it is on the wrong network
   * (i.e., the chainId returned by the useSigner context does not agree with
   * the network name returned by the useNetwork context).
   */
  isOnWrongNetwork: boolean;
  network: string;
}

export const useWallet = (): IUseWallet => {
  const {network} = useNetwork();
  const {
    chainId,
    methods,
    signer,
    provider: signerProvider,
    address,
    status,
  } = useSigner();
  const [balance, setBalance] = useState<BigNumber | null>(null);
  const [ensName, setEnsName] = useState<string>('');
  const [ensAvatarUrl, setEnsAvatarUrl] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const provider = useMemo(() => {
    if (!['ethereum', 'goerli'].includes(network)) {
      return new JsonRpcProvider(CHAIN_METADATA[network].rpc[0], {
        chainId: CHAIN_METADATA[network].id,
        name: translateToSdkNetwork(network),
        ensAddress:
          LIVE_CONTRACTS[translateToSdkNetwork(network) as SupportedNetworks]
            .ensRegistry,
      });
    } else return signerProvider;
  }, [signerProvider, network]);

  // Update balance
  useEffect(() => {
    if (address && provider) {
      provider?.getBalance(address).then((newBalance: BigNumber) => {
        setBalance(newBalance);
      });
    }
  }, [provider, address]);

  // Update ENS name and avatar
  useEffect(() => {
    if (provider && address) {
      provider?.lookupAddress(address).then((name: string | null) => {
        name ? setEnsName(name) : setEnsName('');
      });
      provider?.getAvatar(address).then((avatarUrl: string | null) => {
        avatarUrl ? setEnsAvatarUrl(avatarUrl) : setEnsAvatarUrl('');
      });
    }
  }, [address, provider]);

  // update isConnected
  useEffect(() => {
    setIsConnected(status === 'connected');
  }, [status]);

  const isOnWrongNetwork =
    isConnected && CHAIN_METADATA[network].id !== chainId;

  return {
    provider: signerProvider,
    signer,
    status,
    address,
    chainId,
    balance,
    ensAvatarUrl,
    ensName,
    isConnected,
    isOnWrongNetwork,
    methods,
    network,
  };
};
