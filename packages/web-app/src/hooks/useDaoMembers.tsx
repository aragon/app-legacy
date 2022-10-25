import {Erc20TokenDetails} from '@aragon/sdk-client';
import {useNetwork} from 'context/network';
import {useSpecificProvider} from 'context/providers';
import {useEffect, useState} from 'react';
import {CHAIN_METADATA} from 'utils/constants';
import {fetchBalance} from 'utils/tokens';

import {HookData} from 'utils/types';
import {useDaoToken} from './useDaoToken';
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
  daoToken?: Erc20TokenDetails;
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
 * @returns A list of DAO members, the total number of members in the DAO and
 * the DAO token (if token-based)
 */
export const useDaoMembers = (
  pluginAddress: string,
  pluginType?: PluginTypes,
  searchTerm?: string
): HookData<DaoMembers> => {
  const [data, setData] = useState<BalanceMember[] | WalletMember[]>([]);
  const [rawMembers, setRawMembers] = useState<string[]>();
  const [filteredData, setFilteredData] = useState<
    BalanceMember[] | WalletMember[]
  >([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  const isTokenBased = pluginType === 'erc20voting.dao.eth';
  const {data: daoToken} = useDaoToken(pluginAddress);

  const client = usePluginClient(pluginType);

  // Fetch the list of members for a this DAO.
  useEffect(() => {
    async function fetchMembers() {
      try {
        setIsLoading(true);

        if (!pluginType) {
          setData([] as BalanceMember[] | WalletMember[]);
          return;
        }
        const response = await client?.methods.getMembers(pluginAddress);

        if (!response) {
          setData([] as BalanceMember[] | WalletMember[]);
          return;
        }
        setRawMembers(response);
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

  // map the members to the desired structure
  // Doing this separately to get rid of duplicate calls
  // when raw members present, but no token details yet
  useEffect(() => {
    async function mapMembers() {
      if (!rawMembers) return;

      let members;

      if (isTokenBased && daoToken?.address) {
        const balances = await Promise.all(
          rawMembers.map(m =>
            fetchBalance(
              daoToken?.address,
              m,
              provider,
              CHAIN_METADATA[network].nativeCurrency
            )
          )
        );

        members = rawMembers.map(
          (m, index) =>
            ({
              address: m,
              balance: Number(balances[index]),
            } as BalanceMember)
        );
      } else {
        members = rawMembers.map(m => ({address: m} as WalletMember));
      }

      members.sort(sortMembers);
      setData(members);
    }

    mapMembers();
  }, [daoToken?.address, isTokenBased, network, provider, rawMembers]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData([]);
    } else {
      isTokenBased
        ? setFilteredData(
            (data as BalanceMember[]).filter(d =>
              d.address.includes(searchTerm)
            )
          )
        : setFilteredData(
            (data as WalletMember[]).filter(d => d.address.includes(searchTerm))
          );
    }
  }, [data, isTokenBased, searchTerm]);

  return {
    data: {
      members: data,
      filteredMembers: filteredData,
      daoToken,
    },
    isLoading: isLoading,
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
