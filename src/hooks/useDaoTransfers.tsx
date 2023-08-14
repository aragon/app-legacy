import {
  Client,
  Deposit,
  Transfer,
  TransferQueryParams,
  TransferSortBy,
  TransferType,
} from '@aragon/sdk-client';
import {SortDirection, TokenType} from '@aragon/sdk-client-common';
import {useQuery} from '@tanstack/react-query';
import {useMemo} from 'react';

import {useNetwork} from 'context/network';
import {useErc20Deposits} from 'services/token/queries/use-token';
import {HookData} from 'utils/types';
import {useClient} from './useClient';

export type IAssetTransfers = Transfer[];

// fetch transfers from Subgraph
async function fetchTransfers(
  client: Client | undefined,
  params: TransferQueryParams
) {
  return client
    ? client.methods.getDaoTransfers(params)
    : Promise.reject(new Error('Client not defined'));
}

function sortByCreatedAt(a: Transfer, b: Transfer): number {
  return b.creationDate.getTime() - a.creationDate.getTime();
}

/**
 * React hook to retrieve and sort the list of transfers associated with a given DAO address or ENS name.
 * Fetches the Withdraws and Native deposit transfers from the subgraph
 * and the other transfers from external APIs
 * @param daoAddressOrEns - The address or ENS name of the DAO.
 *
 * @returns An object containing:
 * - `data`: A list of transfers associated with the DAO, or an empty list if no such transfers exist. The list is sorted according to the creation date of each transfer.
 * - `isLoading`: A boolean value indicating whether the data is currently being fetched.
 * - `error`: An error that occurred during the data fetching process, or null if no error occurred.
 */
export const useDaoTransfers = (
  daoAddressOrEns: string
): HookData<Transfer[]> => {
  const {network} = useNetwork();

  const {
    data: erc20Deposits,
    error: erc20DepositsQueryError,
    isLoading: isErc20DepositsLoading,
  } = useErc20Deposits(
    {address: daoAddressOrEns, network},
    {enabled: !!daoAddressOrEns}
  );

  const {
    data: subgraphTransfers,
    error: subgraphQueryError,
    isLoading: isSubgraphQueryLoading,
  } = useSubgraphDaoTransfersQuery(daoAddressOrEns);

  const error = (erc20DepositsQueryError || subgraphQueryError) as Error;
  const isLoading = isErc20DepositsLoading || isSubgraphQueryLoading;

  const memoizedTransfers = useMemo(
    () => filterAndSortTransfers(erc20Deposits, subgraphTransfers),
    [erc20Deposits, subgraphTransfers]
  );

  return {data: memoizedTransfers ?? [], isLoading, error};
};

/**
 * useSubgraphDaoTransfersQuery is a React hook that uses the useQuery hook from the React Query library.
 * It fetches transfers of DAO tokens from the subgraph endpoint and returns the query results.
 *
 * @param daoAddressOrEns - The DAO address or ENS name for which to fetch transfers.
 * @param options - An optional object containing parameters for the transfers query.
 * @param options.sortBy - The parameter by which to sort the fetched transfers. The default is 'CREATED_AT'.
 * @param options.direction - The direction in which to sort the fetched transfers. The default is 'DESC'.
 * @param options.limit - The maximum number of transfers to fetch.
 *
 * @returns A query result object that contains the status of the query ('isLoading', 'isError', etc.) and the data.
 */
const useSubgraphDaoTransfersQuery = (
  daoAddressOrEns: string,
  {
    sortBy = TransferSortBy.CREATED_AT,
    direction = SortDirection.DESC,
    limit = 1000,
  }: Partial<Pick<TransferQueryParams, 'direction' | 'limit' | 'sortBy'>> = {}
) => {
  const {client, network: clientNetwork} = useClient();

  return useQuery({
    queryKey: ['Subgraph Transfers', daoAddressOrEns, clientNetwork],
    queryFn: () =>
      fetchTransfers(client, {daoAddressOrEns, sortBy, direction, limit}),
    enabled: Boolean(daoAddressOrEns),
  });
};

/**
 * Filters and sorts arrays of ERC20 deposits and subgraph transfers.
 *
 * This function filters the subgraph transfers to include native transfers and
 * withdraws only, merges it with ERC20 deposits and sorts the resulting array.
 * The sorting is done based on the 'createdAt' field of the transfers.
 *
 * @param erc20Deposits - An array of ERC20 deposits,
 * @param subgraphTransfers - An array of subgraph transfers,
 *
 * @return - An array of filtered and sorted transfers.
 */
const filterAndSortTransfers = (
  erc20Deposits: Deposit[] | null | undefined,
  subgraphTransfers: Transfer[] | null | undefined
): Transfer[] => {
  const parsedSubgraphTx = subgraphTransfers?.filter(
    t =>
      t.type === TransferType.WITHDRAW ||
      (t.type === TransferType.DEPOSIT && t.tokenType === TokenType.NATIVE)
  );

  return [...(erc20Deposits ?? []), ...(parsedSubgraphTx ?? [])].sort(
    sortByCreatedAt
  );
};
