import {useQuery} from '@apollo/client';

import {client} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {DAO_TOKEN} from 'queries/dao';
import {HookData} from 'utils/types';

type DaoToken = {
  id: string;
  name: string;
  symbol: string;
  decimals: string;
};

export function useDaoToken(dao: string): HookData<DaoToken> {
  const {network} = useNetwork();

  // TODO: This needs to be more fleshed out to return members properly
  const {data, error, loading} = useQuery(DAO_TOKEN, {
    variables: {id: dao},
    client: client[network],
    fetchPolicy: 'no-cache',
  });

  return {
    data: {
      id: data?.dao?.token?.id,
      name: data?.dao?.token?.name,
      symbol: data?.dao?.token?.symbol,
      decimals: data?.dao?.token?.decimals,
    },
    error,
    isLoading: loading,
  };
}
