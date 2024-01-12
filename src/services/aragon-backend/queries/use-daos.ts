import request, {gql} from 'graphql-request';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonBackendQueryKeys} from '../query-keys';
import type {IFetchDaosParams} from '../aragon-backend-service.api';
import {IPaginatedResponse} from '../domain/paginated-response';
import {IDao} from '../domain/dao';

const daosQueryDocument = gql`
  query Dao(
    $direction: OrderDirection!
    $orderBy: DaoOrderField!
    $skip: Float
    $take: Float
    $governanceId: String
    $networks: String
    $memberAddress: String
  ) {
    dao(
      direction: $direction
      orderBy: $orderBy
      skip: $skip
      take: $take
      governanceId: $governanceId
      networks: $networks
      memberAddress: $memberAddress
    ) {
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
      total
      skip
      take
    }
  }
`;

const fetchDaos = async (
  params: IFetchDaosParams
): Promise<IPaginatedResponse<IDao>> => {
  return request(
    `${import.meta.env.VITE_BACKEND_URL}/graphql`,
    daosQueryDocument,
    params
  );
};

export const useDaos = (
  params: IFetchDaosParams,
  options: UseQueryOptions<IPaginatedResponse<IDao>> = {}
) => {
  return useQuery(
    aragonBackendQueryKeys.daos(params),
    () => fetchDaos(params),
    options
  );
};
