import {useQuery} from '@apollo/client';
import {useEffect, useMemo, useState} from 'react';

import {client} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {DAO_MEMBERS} from 'queries/dao';
import {TokenBalance, HookData} from 'utils/types';

// NOTE: Previously two hooks were used to fetch, but now merging.
// TODO: remove static token holder data, subgraph will have a
// members list as well for token based DAOs.
export type DaoWhitelist = {
  id: string;
};

export type DaoTokenBased = {
  address: string;
  balance: number;
};

export type DaoMembers = {
  members: Array<DaoWhitelist | DaoTokenBased>;
  token?: TokenBalance['token'];
  totalMembers: number;
};

// this type guard will need to evolve when there are more types
export function isWhitelistMember(
  member: DaoTokenBased | DaoWhitelist
): member is DaoWhitelist {
  return Object.prototype.hasOwnProperty.call(member, 'id');
}

/**
 * Hook to fetch DAO members. Fetches token if DAO is token based, and allows
 * for a search term to be passed in to filter the members list.
 * NOTE: the totalMembers included in the response is the total number of members in the DAO,
 * and not the number of members returned when filtering by search term.
 * @param id DAO id
 * @param searchTerm Optional member search term  (e.g. '0x...')
 * @returns A list of DAO members and the total number of members in the DAO
 */
export const useDaoMembers = (
  id: string,
  searchTerm?: string
): HookData<DaoMembers> => {
  const {network} = useNetwork();
  const [totalMemberCount, setTotalMemberCount] = useState<number | null>(null);

  const {
    data,
    error,
    loading: isLoading,
  } = useQuery(DAO_MEMBERS, {
    client: client[network],
    fetchPolicy: 'no-cache',
    variables: {
      id,
      ...(searchTerm ? {filter: {id: searchTerm}} : {}),
    },
  });

  const walletBased =
    data?.dao?.packages[0].pkg.__typename === 'WhitelistPackage';

  /*************************************************
   *                Hooks & handlers               *
   *************************************************/
  // TODO: need to remove later, the sort will be handled within the query
  const sortTokenMembers = (a: DaoTokenBased, b: DaoTokenBased) =>
    b.balance - a.balance;

  const members = useMemo(() => {
    // TODO: Fetch token holders addresses and the balance for each address
    if (data) {
      return walletBased
        ? data?.dao.packages[0].pkg.users
        : MOCK_ADDRESSES.filter(() => Math.random() > 0.4)
            .map(member => {
              return {
                address: member,
                balance: Math.floor(Math.random() * 500 + 1),
              };
            })
            .sort(sortTokenMembers);
    } else return [];
  }, [data, walletBased]);

  // when search term is passed in, only set total on the first time,
  // i.e. when totalMemberCount is null
  useEffect(() => {
    if (data && totalMemberCount === null) {
      setTotalMemberCount(members.length);
    }
  }, [data, members.length, totalMemberCount]);

  return {
    data: {
      members,
      token: data?.dao.token,
      totalMembers: totalMemberCount || 0,
    },
    isLoading,
    error,
  };
};

const MOCK_ADDRESSES = [
  '0x8367dc645e31321CeF3EeD91a10a5b7077e21f70',
  '0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf',
  '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
  'cool.eth',
  'sio.eth',
  'beer.eth',
];
