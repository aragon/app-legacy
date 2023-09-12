import request, {gql} from 'graphql-request';
import {useQueryClient} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchTokenHoldersParams} from '../aragon-backend-service.api';
import {useCallback} from 'react';
import {TokenHoldersResponse} from '../domain/token-holders-response';

const tokenHoldersQueryDocument = gql`
  query Holders($network: Network!, $tokenAddress: String!) {
    holders(network: $network, tokenAddress: $tokenAddress) {
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
  return request(
    'https://app-backend.aragon.org/graphql',
    tokenHoldersQueryDocument,
    {
      ...params,
    }
  );
};

export const useTokenHoldersAsync = () => {
  const queryClient = useQueryClient();

  const fetchTokenAsync = useCallback(
    (params: IFetchTokenHoldersParams) =>
      queryClient.fetchQuery({
        queryKey: aragonSdkQueryKeys.tokenHolders(params),
        queryFn: () => fetchTokenHolders(params),
      }),
    [queryClient]
  );

  return fetchTokenAsync;
};
