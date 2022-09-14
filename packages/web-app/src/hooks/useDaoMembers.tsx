import {useEffect, useState} from 'react';

import {HookData} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';

export type WalletMember = {
  address: string;
};

export type BalanceMember = WalletMember & {
  balance: number;
};

export type DaoMembers = {
  members: WalletMember[] | BalanceMember[];
  filteredMembers: WalletMember[] | BalanceMember[];
};

// this type guard will need to evolve when there are more types
export function isWalletListMember(
  member: BalanceMember | WalletMember
): member is WalletMember {
  return !('address' in member);
}

export function isBalanceMember(
  member: BalanceMember | WalletMember
): member is BalanceMember {
  return 'balance' in member;
}

/**
 * Hook to fetch DAO members. Fetches token if DAO is token based, and allows
 * for a search term to be passed in to filter the members list. NOTE: the
 * totalMembers included in the response is the total number of members in the
 * DAO, and not the number of members returned when filtering by search term.
 *
 * @param pluginAddress plugin from which members will be retrieved
 * @param pluginType plugin type
 * @param searchTerm Optional member search term  (e.g. '0x...')
 * @returns A list of DAO members and the total number of members in the DAO
 */
export const useDaoMembers = (
  pluginAddress: string,
  pluginType?: PluginTypes,
  searchTerm?: string
): HookData<DaoMembers> => {
  const [data, setData] = useState<BalanceMember[] | WalletMember[]>([]);
  const [filteredData, setFilteredData] = useState<
    BalanceMember[] | WalletMember[]
  >([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const client = usePluginClient(pluginAddress, pluginType);

  // Fetch the list of members for a this DAO.
  useEffect(() => {
    async function fetchMembers() {
      try {
        setIsLoading(true);

        if (!pluginType) {
          setData([] as BalanceMember[] | WalletMember[]);
          return;
        }
        const rawMembers = await client?.methods.getMembers(pluginAddress);

        if (!rawMembers) {
          setData([] as BalanceMember[] | WalletMember[]);
          return;
        }

        const members =
          pluginType === 'erc20voting.dao.eth'
            ? // TODO as soon as the SDK exposes Token information, fetch balances
              // from contract.
              rawMembers.map(m => {
                return {
                  address: m,
                  balance: Math.floor(Math.random() * 500 + 1),
                } as BalanceMember;
              })
            : rawMembers.map(m => {
                return {
                  address: m,
                } as WalletMember;
              });
        members.sort(sortMembers);
        setData(members);
        setError(undefined);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMembers();
  }, [client?.methods, pluginAddress, pluginType]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData([]);
    } else {
      const filtered =
        pluginType === 'erc20voting.dao.eth'
          ? (data as BalanceMember[]).filter(d =>
              d.address.includes(searchTerm)
            )
          : (data as WalletMember[]).filter(d =>
              d.address.includes(searchTerm)
            );
      setFilteredData(filtered);
    }
  }, [data, pluginType, searchTerm]);

  return {
    data: {
      members: data,
      filteredMembers: filteredData,
    },
    isLoading,
    error,
  };
};

function sortMembers<T extends BalanceMember | WalletMember>(a: T, b: T) {
  if (isBalanceMember(a)) {
    if (a.balance === (b as BalanceMember).balance) return 0;
    return a.balance > (b as BalanceMember).balance ? 1 : -1;
  } else {
    if (a.address === (b as WalletMember).address) return 0;
    return a.address > (b as WalletMember).address ? 1 : -1;
  }
}
