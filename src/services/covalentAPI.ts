import {QueryClient} from '@tanstack/react-query';

import {
  CHAIN_METADATA,
  COVALENT_API_KEY,
  SupportedNetworks,
} from 'utils/constants';

export interface TokenHolder {
  balance: number;
  address: string;
  total_supply: number;
  contract_decimals: number;
}

export interface Pagination {
  has_more: boolean;
  page_number: number;
  page_size: number;
  total_count: number;
}

export interface TokenHoldersData {
  items: TokenHolder[];
  pagination: Pagination;
}

export interface TokenHoldersResponse {
  data: TokenHoldersData;
  error: boolean;
}

export const getTokenHoldersPaged = async (
  queryClient: QueryClient,
  tokenContractAddress: string,
  network: SupportedNetworks,
  page: number,
  pageSize: 100 | 1000
) => {
  const baseUrl = 'https://api.covalenthq.com/v1/';
  const {networkId} = CHAIN_METADATA[network].covalent ?? {};
  const url = `${baseUrl}${networkId}/tokens/${tokenContractAddress}/token_holders_v2/?page-number=${page}&page-size=${pageSize}`;

  return await queryClient.fetchQuery({
    queryKey: [
      'getTokenHoldersPaged',
      tokenContractAddress,
      network,
      page,
      pageSize,
    ],
    staleTime: 8 * 60 * 60 * 1000, // 8 hours
    queryFn: () => {
      const authString = `${COVALENT_API_KEY}:`;
      const headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa(authString));
      return fetch(url, {method: 'GET', headers: headers}).then(
        res => res.json() as Promise<TokenHoldersResponse>
      );
    },
  });
};

export const getTotalSupply = async (
  queryClient: QueryClient,
  tokenContractAddress: string,
  network: SupportedNetworks
) => {
  const page0 = await getTokenHoldersPaged(
    queryClient,
    tokenContractAddress,
    network,
    0,
    100
  );

  return (
    page0.data.items[0].total_supply /
    10 ** page0.data.items[0].contract_decimals
  );
};

export const getTotalHolders = async (
  queryClient: QueryClient,
  tokenContractAddress: string,
  network: SupportedNetworks
) => {
  const page0 = await getTokenHoldersPaged(
    queryClient,
    tokenContractAddress,
    network,
    0,
    100
  );

  return page0.data.pagination.total_count;
};
