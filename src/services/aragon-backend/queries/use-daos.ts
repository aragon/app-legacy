import request, {gql} from 'graphql-request';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonBackendQueryKeys} from '../query-keys';
import type {IFetchDaosParams} from '../aragon-backend-service.api';
import {TokenHoldersResponse} from '../domain/token-holders-response';

const daosQueryDocument = gql`
  query Dao(
    $direction: OrderDirection!
    $orderBy: DaoOrderField!
    $skip: Float!
    $take: Float!
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
      skip
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
): Promise<TokenHoldersResponse> => {
  return request(
    `${import.meta.env.VITE_BACKEND_URL}/graphql`,
    daosQueryDocument,
    params
  );
};

export const useDaos = (
  params: IFetchDaosParams,
  options: UseQueryOptions<TokenHoldersResponse> = {}
) => {
  return useQuery(
    aragonBackendQueryKeys.daos(params),
    () => fetchDaos(params),
    options
  );
};
