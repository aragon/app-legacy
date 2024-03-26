import * as React from 'react';
import {Config, useConnectorClient} from 'wagmi';
import {providers} from 'ethers';
import {Account, Chain, Client, Transport} from 'viem';

function walletClientToSigner(walletClient: Client<Transport, Chain, Account>) {
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
  const {data: walletClient} = useConnectorClient<Config>({chainId});
  return React.useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  );
}
