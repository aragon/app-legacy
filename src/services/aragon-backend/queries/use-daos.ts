import {
  IDaoPages,
  IPaginatedResponse,
} from 'services/aragon-backend/domain/paginated-response';
import request, {gql} from 'graphql-request';
import {UseInfiniteQueryOptions, useInfiniteQuery} from '@tanstack/react-query';
import {aragonBackendQueryKeys} from '../query-keys';
import {IFetchDaosParams} from 'services/aragon-backend/aragon-backend-service.api';

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
): Promise<IPaginatedResponse<IDaoPages>> => {
  const {daos} = await request<{daos: IPaginatedResponse<IDaoPages>}>(
    `${import.meta.env.VITE_BACKEND_URL}/graphql`,
    daosQueryDocument,
    params
  );

  return daos;
};

export const useDaos = (
  initialParams: IFetchDaosParams,
  options: Omit<
    UseInfiniteQueryOptions<IPaginatedResponse<IDaoPages>>,
    'queryKey' | 'getNextPageParam' | 'initialPageParam'
  >
) => {
  return useInfiniteQuery({
    queryKey: aragonBackendQueryKeys.daos(initialParams),
    queryFn: ({pageParam = initialParams}) =>
      fetchDaos(pageParam as IFetchDaosParams),
    getNextPageParam: (lastPage: IPaginatedResponse<IDaoPages>) => {
      const {skip, total, take} = lastPage;
      const hasNextPage = skip + take < total;

      if (!hasNextPage) {
        return undefined;
      }

      return {...initialParams, skip: skip + take};
    },
    initialPageParam: initialParams,
    ...options,
  });
};
