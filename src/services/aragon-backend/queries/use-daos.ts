import request, {gql} from 'graphql-request';
import {UseInfiniteQueryOptions, useInfiniteQuery} from '@tanstack/react-query';
import {aragonBackendQueryKeys} from '../query-keys';
import type {IFetchDaosParams} from '../aragon-backend-service.api';
import {IPaginatedResponse} from '../domain/paginated-response';
import {IDao} from '../domain/dao';

const daosQueryDocument = gql`
  query Dao(
    $direction: OrderDirection!
    $orderBy: DaoOrderField!
    $take: Float
    $skip: Float
    $governanceIds: [String!]
    $networks: [Network!]
    $memberAddress: String
  ) {
    dao(
      direction: $direction
      orderBy: $orderBy
      take: $take
      skip: $skip
      governanceIds: $governanceIds
      networks: $networks
      memberAddress: $memberAddress
    ) {
      total
      skip
      take
      data {
        address
        ens
        network
        name
        description
        logo
        createdAt
        governanceId
        stats {
          tvl
          proposalsCreated
          proposalsExecuted
          members
        }
      }
    }
  }
`;

const fetchDaos = async (
  params: IFetchDaosParams
): Promise<IPaginatedResponse<IDao>> => {
  const {dao} = await request<{dao: IPaginatedResponse<IDao>}>(
    `${import.meta.env.VITE_BACKEND_URL}/graphql`,
    daosQueryDocument,
    params
  );

  return dao;
};

export const useDaos = (
  params: IFetchDaosParams,
  options: UseInfiniteQueryOptions<IPaginatedResponse<IDao>> = {}
) => {
  return useInfiniteQuery(
    aragonBackendQueryKeys.daos(params),
    () => fetchDaos(params),
    {
      ...options,
      getNextPageParam: (lastPage: IPaginatedResponse<IDao>) => {
        const skip = params.skip ?? 0;
        const take = params.take ?? 20;
        const hasNextPage = skip < lastPage.total;

        if (!hasNextPage) {
          return undefined;
        }

        return {...params, skip: skip + take};
      },
    }
  );
};
