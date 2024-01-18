import {
  LIVE_CONTRACTS,
  SupportedVersion,
  SupportedNetwork as SdkSupportedNetworks,
} from '@aragon/sdk-client-common';
import {JsonRpcProvider, Networkish} from '@ethersproject/providers';
import {
  CHAIN_METADATA,
  NETWORKS_WITH_CUSTOM_REGISTRY,
  SupportedChainID,
  SupportedNetworks,
  getSupportedNetworkByChainId,
  infuraApiKey,
} from './constants';
import {translateToNetworkishName} from './library';

class AragonGateway {
  private rpcVersion = '1.0';

  getRpcClient = (
    chainIdOrNetwork: SupportedChainID | SupportedNetworks
  ): JsonRpcProvider | null => {
    const network =
      typeof chainIdOrNetwork === 'number'
        ? getSupportedNetworkByChainId(chainIdOrNetwork)
        : chainIdOrNetwork;

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

    const rpcUrl = this.buildRpcUrl(network);

    return new JsonRpcProvider(rpcUrl, options);
  };

  buildRpcUrl = (network: SupportedNetworks) => {
    const {gatewayNetwork} = CHAIN_METADATA[network];
    const baseUrl = import.meta.env.VITE_GATEWAY_URL;
    const rpcUrl = `${baseUrl}/v${this.rpcVersion}/rpc/${gatewayNetwork}/${infuraApiKey}`;

    return rpcUrl;
  };
}

export const aragonGateway = new AragonGateway();
