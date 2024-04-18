import {useMemo} from 'react';
import {useConnectorClient} from 'wagmi';
import {providers} from 'ethers';
import {Client} from 'viem';

function walletClientToSigner(walletClient: Client) {
  const {account, chain, transport} = walletClient;

  const network = {
    chainId: chain?.id ?? 1,
    name: chain?.name ?? 'ethereum',
    ensAddress: chain?.contracts?.ensRegistry?.address,
  };

  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account?.address);

  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner(chainId?: number) {
  const {data: walletClient} = useConnectorClient({chainId});

  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  );
}
