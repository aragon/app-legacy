import request, {gql} from 'graphql-request';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonBackendQueryKeys} from '../query-keys';
import type {IFetchTokenHoldersParams} from '../aragon-backend-service.api';
import {TokenHoldersResponse} from '../domain/token-holders-response';
import {aragonGateway} from 'utils/aragonGateway';
import {supportedNetworksToBackendMap} from 'utils/constants';

const tokenHoldersQueryDocument = gql`
  query Holders($network: Network!, $tokenAddress: String!, $page: Int!) {
    holders(network: $network, tokenAddress: $tokenAddress, page: $page) {
      contractAddress
      contractDecimals
      contractName
      contractTickerSymbol
      hasMore
      holders {
        address
        balance
        delegates
        votes
      }
      logoUrl
      network
      supportsErc
      totalHolders
      totalSupply
      updatedAt
    }
  }
`;

const fetchTokenHolders = async (
  params: IFetchTokenHoldersParams
): Promise<TokenHoldersResponse> => {
  return request(aragonGateway.backendUrl, tokenHoldersQueryDocument, {
    ...params,
    network: supportedNetworksToBackendMap[params.network],
    page: params.page ?? 0,
  });
};

export const useTokenHolders = (
  params: IFetchTokenHoldersParams,
  options: UseQueryOptions<TokenHoldersResponse> = {}
) => {
  params.page = params.page || 0; // otherwise undefined & 0 are different query keys
  return useQuery(
    aragonBackendQueryKeys.tokenHolders(params),
    () => fetchTokenHolders(params),
    options
  );
};
