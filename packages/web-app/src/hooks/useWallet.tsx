import {useSigner, SignerValue} from 'use-signer';
import {useEffect, useState} from 'react';
import {BigNumber} from 'ethers';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import {useTranslation} from 'react-i18next';
import {useAlertContext} from 'context/alert';

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
  const {chainId, methods, signer, provider, address, status} = useSigner();
  const [balance, setBalance] = useState<BigNumber | null>(null);
  const [ensName, setEnsName] = useState<string>('');
  const [ensAvatarUrl, setEnsAvatarUrl] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const {t} = useTranslation();
  const {alert} = useAlertContext();

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
    if (status === 'connected' && !isConnected)
      alert(t('alert.chip.walletConnected'));
    setIsConnected(status === 'connected');
  }, [alert, isConnected, status, t]);

  const isOnWrongNetwork =
    isConnected && CHAIN_METADATA[network].id !== chainId;

  return {
    provider,
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
