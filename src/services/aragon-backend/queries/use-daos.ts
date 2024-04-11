import {IPaginatedResponse} from 'services/aragon-backend/domain/paginated-response';
import request, {gql} from 'graphql-request';
import {
  InfiniteData,
  UseInfiniteQueryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {aragonBackendQueryKeys} from '../query-keys';
import {IFetchDaosParams} from 'services/aragon-backend/aragon-backend-service.api';
import {IDao} from 'services/aragon-backend/domain/dao';

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
): Promise<IPaginatedResponse<IDao>> => {
  const {daos} = await request<{daos: IPaginatedResponse<IDao>}>(
    `${import.meta.env.VITE_BACKEND_URL}/graphql`,
    daosQueryDocument,
    params
  );

  return daos;
};

export const useDaos = (
  params: IFetchDaosParams,
  options: Omit<
    UseInfiniteQueryOptions<
      IPaginatedResponse<IDao>,
      unknown,
      InfiniteData<IPaginatedResponse<IDao>>
    >,
    'queryKey' | 'getNextPageParam' | 'initialPageParam'
  >
) => {
  return useInfiniteQuery({
    queryKey: aragonBackendQueryKeys.daos(params),
    queryFn: ({pageParam}) => fetchDaos(pageParam as IFetchDaosParams),
    getNextPageParam: (lastPage: IPaginatedResponse<IDao>) => {
      const {skip, total, take} = lastPage;
      const hasNextPage = skip + take < total;

      if (!hasNextPage) {
        return undefined;
      }

      return {...params, skip: skip + take};
    },
    initialPageParam: params,
    ...options,
  });
};
