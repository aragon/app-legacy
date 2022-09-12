import {useEffect, useState} from 'react';

import {HookData} from 'utils/types';
import {PluginTypes, usePluginClient} from './usePluginClient';

export type DaoWhitelist = {
  id: string;
};

export type MemberBalance = {
  address: string;
  balance: number;
};

export type DaoMembers = {
  members: DaoWhitelist[] | MemberBalance[];
  totalMembers: number;
};

// this type guard will need to evolve when there are more types
export function isWhitelistMember(
  member: MemberBalance | DaoWhitelist
): member is DaoWhitelist {
  return 'id' in member;
}

/**
 * Hook to fetch DAO members. Fetches token if DAO is token based, and allows
 * for a search term to be passed in to filter the members list. NOTE: the
 * totalMembers included in the response is the total number of members in the
 * DAO, and not the number of members returned when filtering by search term.
 * @param pluginAddress plugin from which members will be retrieved
 * @param type plugin type
 * @param searchTerm Optional member search term  (e.g. '0x...')
 * @returns A list of DAO members and the total number of members in the DAO
 */
export const useDaoMembers = (
  pluginAddress: string,
  pluginType?: PluginTypes,
  searchTerm?: string
): HookData<DaoMembers> => {
  const [data, setData] = useState<MemberBalance[] | DaoWhitelist[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const [totalMemberCount, setTotalMemberCount] = useState<number | null>(null);

  const client = usePluginClient(pluginAddress, pluginType);
  console.log('stop annoying me', searchTerm);

  // Fetch the list of members for a this DAO.
  useEffect(() => {
    async function fetchMembers() {
      try {
        setIsLoading(true);

        if (!pluginType) {
          setData([] as MemberBalance[] | DaoWhitelist[]);
          return;
        }
        const rawMembers = await client?.methods.getMembers(pluginAddress);

        if (!rawMembers) {
          setData([] as MemberBalance[] | DaoWhitelist[]);
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
                } as MemberBalance;
              })
            : rawMembers.map(m => {
                return {
                  id: m,
                } as DaoWhitelist;
              });
        members.sort(sortMembers);
        setData(members);
        setTotalMemberCount(members.length);
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

  return {
    data: {
      members: data,
      totalMembers: totalMemberCount || 0,
    },
    isLoading,
    error,
  };
};

function sortMembers<T extends MemberBalance | DaoWhitelist>(a: T, b: T) {
  if (isWhitelistMember(a)) {
    if (a.id === (b as DaoWhitelist).id) return 0;
    return a.id > (b as DaoWhitelist).id ? 1 : -1;
  } else {
    if (a.balance === (b as MemberBalance).balance) return 0;
    return a.balance > (b as MemberBalance).balance ? 1 : -1;
  }
}
