import {
  LIVE_CONTRACTS,
  SupportedVersion,
  SupportedNetwork as SdkSupportedNetworks,
} from '@aragon/sdk-client-common';
import {JsonRpcProvider, Networkish} from '@ethersproject/providers';
import {
  CHAIN_METADATA,
  NETWORKS_WITH_CUSTOM_REGISTRY,
  SupportedNetworks,
  getSupportedNetworkByChainId,
} from './constants';
import {translateToNetworkishName} from './library';

class AragonGateway {
  private rpcVersion = '1.0';
  private ipfsVersion = '1.0';
  private baseUrl = import.meta.env.VITE_GATEWAY_URL;

  public backendUrl = `${this.baseUrl}/graphql`;

  getRpcProvider = (
    chainIdOrNetwork: number | SupportedNetworks
  ): JsonRpcProvider | null => {
    const network = this.parseNetwork(chainIdOrNetwork);

    if (network == null || network === 'unsupported') {
      return null;
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
        LIVE_CONTRACTS[SupportedVersion.LATEST][sdkNetwork]?.ensRegistryAddress;
    }

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
    const gatewayKey = import.meta.env.VITE_GATEWAY_RPC_API_KEY;
    const rpcUrl = `${this.baseUrl}/v${this.rpcVersion}/rpc/${gatewayNetwork}/${gatewayKey}`;

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
