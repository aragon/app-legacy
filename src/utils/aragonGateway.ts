import {JsonRpcProvider, Networkish} from '@ethersproject/providers';
import {
  CHAIN_METADATA,
  NETWORKS_WITH_CUSTOM_REGISTRY,
  SupportedNetworks,
  getSupportedNetworkByChainId,
} from './constants';
import {translateToNetworkishName} from './library';
import {
  SupportedNetworks as SdkSupportedNetworks,
  getLatestNetworkDeployment,
} from '@aragon/osx-commons-configs';

class AragonGateway {
  private rpcVersion = '1.0';
  private ipfsVersion = '1.0';
  private baseUrl = import.meta.env.VITE_GATEWAY_URL as string;

  getRpcProvider = (
    chainIdOrNetwork: number | SupportedNetworks
  ): JsonRpcProvider => {
    let network = this.parseNetwork(chainIdOrNetwork);

    console.log('chainIdOrNetwork', chainIdOrNetwork);

    // Default provider to ethereum for unsupported networks
    if (network == null || network === 'unsupported') {
      network = 'ethereum';
    }

    const sdkNetwork = translateToNetworkishName(
      network
    ) as SdkSupportedNetworks;

    const options: Networkish = {
      chainId: CHAIN_METADATA[network].id,
      name: sdkNetwork,
    };

    if (NETWORKS_WITH_CUSTOM_REGISTRY.includes(network)) {
      options.ensAddress =
        getLatestNetworkDeployment(sdkNetwork)?.ENSRegistry?.address;
    }

    console.log('viewview', options);

    const rpcUrl = this.buildRpcUrl(network)!;
    return new JsonRpcProvider(rpcUrl, options);
  };

  buildRpcUrl = (
    chainIdOrNetwork: number | SupportedNetworks
  ): string | null => {
    const network = this.parseNetwork(chainIdOrNetwork);

    if (network == null || network === 'unsupported') {
      return null;
    }

    const {gatewayNetwork} = CHAIN_METADATA[network];
    const gatewayKey =
      network === 'zksyncSepolia' || network === 'zksync'
        ? import.meta.env.VITE_GATEWAY_RPC_API_KEY_ALCHEMY
        : import.meta.env.VITE_GATEWAY_RPC_API_KEY;

    const baseUrl =
      network === 'zksyncSepolia' || network === 'zksync'
        ? this.baseUrl.replace('app', 'alchemy')
        : this.baseUrl;

    const rpcUrl = `${baseUrl}/v${this.rpcVersion}/rpc/${gatewayNetwork}/${gatewayKey}`;
    return rpcUrl;
  };

  buildIpfsUrl = (
    chainIdOrNetwork: number | SupportedNetworks
  ): string | null => {
    const network = this.parseNetwork(chainIdOrNetwork);

    if (network == null || network === 'unsupported') {
      return null;
    }

    const {isTestnet} = CHAIN_METADATA[network];
    const ipfsEnv = isTestnet ? 'test' : 'prod';
    const ipfsUrl = `${this.baseUrl}/v${this.ipfsVersion}/ipfs/${ipfsEnv}/api/v0`;

    return ipfsUrl;
  };

  private parseNetwork = (
    chainIdOrNetwork: number | SupportedNetworks
  ): SupportedNetworks | undefined => {
    const network =
      typeof chainIdOrNetwork === 'number'
        ? getSupportedNetworkByChainId(chainIdOrNetwork)
        : chainIdOrNetwork;

    return network;
  };
}

export const aragonGateway = new AragonGateway();
