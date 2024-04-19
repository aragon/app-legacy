import {useNetwork} from 'context/network';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {toHex} from 'utils/library';
import {useWallet} from 'hooks/useWallet';
import {useConnectors} from 'wagmi';

type ErrorType = {
  code: number;
};

export const useSwitchNetwork = () => {
  const {network} = useNetwork();
  const {connectorName} = useWallet();
  const connectors = useConnectors();

  const switchWalletNetwork = async () => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      try {
        // check if the chain to connect to is installed
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{chainId: toHex(CHAIN_METADATA[network].id)}], // chainId must be in hexadecimal numbers
        });
      } catch (error) {
        if ((error as ErrorType).code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: CHAIN_METADATA[network].name,
                  chainId: toHex(CHAIN_METADATA[network].id),
                  rpcUrls: CHAIN_METADATA[network].publicRpc,
                  nativeCurrency: CHAIN_METADATA[network].nativeCurrency,
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
        console.error(error);
      }
    } else {
      // if no window.ethereum then MetaMask is not installed
      alert(
        'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html'
      );
    }
    // TODO explore more sturdy ways to handle this in the actual payload and/or a UI flow for network "switching"
    // Update incoming dAppConnect-as-wallet's current chain to the chainId of the app's current req'd network
    // All chains when connecting to the app are pre approved by WalletConnect on connection
    // This is more of a workaround to match chains and unblock existing flows
    // Ex. Aragon DAO connecting to an Aragon DAO, the connecting DAO is on the wrong chain (default chainId of WAGMI config -- was Base)
    if (connectorName === 'WalletConnect') {
      if (connectors[0]?.switchChain) {
        connectors[0]?.switchChain({
          chainId: CHAIN_METADATA[network as SupportedNetworks]?.id,
        });
      }
    }
  };

  return {switchWalletNetwork};
};
