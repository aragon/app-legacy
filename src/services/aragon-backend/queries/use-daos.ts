import request, {gql} from 'graphql-request';
import {UseInfiniteQueryOptions, useInfiniteQuery} from '@tanstack/react-query';
import {aragonBackendQueryKeys} from '../query-keys';
import type {IFetchDaosParams} from '../aragon-backend-service.api';
import {IPaginatedDaoResponse} from '../domain/paginated-response';

const daosQueryDocument = gql`
  query Daos(
    $pluginNames: [String!]
    $orderBy: String
    $skip: Float
    $direction: OrderDirection
    $networks: [Network!]
    $take: Float
    $memberAddress: String
  ) {
    daos(
      pluginNames: $pluginNames
      direction: $direction
      orderBy: $orderBy
      networks: $networks
      take: $take
      skip: $skip
      memberAddress: $memberAddress
    ) {
      data {
        createdAt
        creatorAddress
        daoAddress
        description
        ens
        logo
        name
        network
        pluginName
        stats {
          members
          proposalsCreated
          proposalsExecuted
          tvl
          votes
          uniqueVoters
        }
      }
      skip
      total
      take
    }
  }
`;

const fetchDaos = async (
  params: IFetchDaosParams
): Promise<IPaginatedDaoResponse> => {
  const {daos} = await request<{daos: IPaginatedDaoResponse}>(
    `${import.meta.env.VITE_BACKEND_URL}/graphql`,
    daosQueryDocument,
    params
  );

  return daos;
};

export const useDaos = (
  params: IFetchDaosParams,
  options: Omit<
    UseInfiniteQueryOptions<IPaginatedDaoResponse>,
    'queryKey' | 'getNextPageParam' | 'initialPageParam'
  >
) => {
  return useInfiniteQuery({
    queryKey: aragonBackendQueryKeys.daos(params),
    queryFn: ({pageParam}) =>
      fetchDaos({...params, ...(pageParam as IFetchDaosParams)}),
    getNextPageParam: (lastPage: IPaginatedDaoResponse) => {
      const {skip, total, take} = lastPage;
      const hasNextPage = skip + take < total;

      if (!hasNextPage) {
        return undefined;
      }

      return {...params, skip: skip + take};
    },
    initialPageParam: 0,
    ...options,
  });
};
