import request, {gql} from 'graphql-request';
import {UseInfiniteQueryOptions, useInfiniteQuery} from '@tanstack/react-query';
import {aragonBackendQueryKeys} from '../query-keys';
import type {IFetchDaosParams} from '../aragon-backend-service.api';
import {IPaginatedResponse} from '../domain/paginated-response';
import {IDao} from '../domain/dao';
import {useState} from 'react';

const daosQueryDocument = gql`
  query Dao(
    $direction: String!
    $orderBy: String!
    $networks: [Network!]
    $take: Float
    $skip: Float
  ) {
    daos(
      direction: $direction
      orderBy: $orderBy
      networks: $networks
      take: $take
      skip: $skip
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
  options: UseInfiniteQueryOptions<IPaginatedResponse<IDao>> = {}
) => {
  return useInfiniteQuery(
    aragonBackendQueryKeys.daos(params),
    ({pageParam}) => fetchDaos({...params, ...pageParam}),
    {
      ...options,
      getNextPageParam: (lastPage: IPaginatedResponse<IDao>) => {
        const {skip, total, take} = lastPage;
        const hasNextPage = skip < total;

        if (!hasNextPage) {
          return undefined;
        }

        return {...params, skip: skip + take};
      },
    }
  );
};
