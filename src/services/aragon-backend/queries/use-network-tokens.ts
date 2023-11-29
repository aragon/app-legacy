import {
  NetworkTokenResponse,
  NetworkTokensResponse,
} from '../domain/token-response';
import {useQuery} from '@tanstack/react-query';
import {aragonBackendQueryKeys} from '../query-keys';
import {SupportedNetworks} from 'utils/constants';

const fetchNetworkTokens = async (
  network: SupportedNetworks
): Promise<NetworkTokenResponse[]> => {
  const resp = await fetch(
    'https://aragon.restspace.io/rs-data/allTokens/network-tokens.json'
  );
  const allToks = (await resp.json()) as NetworkTokensResponse;
  const toks = allToks[network];
  return toks;
};

export const useNetworkTokens = (network: SupportedNetworks) => {
  return useQuery(aragonBackendQueryKeys.tokens(network), () =>
    fetchNetworkTokens(network)
  );
};
