import * as React from 'react';
import {WalletClient, useWalletClient} from 'wagmi';
import {providers} from 'ethers';

function walletClientToSigner(walletClient: WalletClient) {
  const {account, chain, transport} = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner(chainId?: number) {
  const {data: walletClient} = useWalletClient({chainId});
  return React.useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  );
}
