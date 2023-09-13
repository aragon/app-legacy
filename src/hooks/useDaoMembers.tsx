import {Erc20TokenDetails, TokenVotingMember} from '@aragon/sdk-client';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {useEffect, useState} from 'react';
import {CHAIN_METADATA} from 'utils/constants';
import {fetchBalance} from 'utils/tokens';

import {formatUnits} from 'ethers/lib/utils';
import {HookData} from 'utils/types';
import {useDaoToken} from './useDaoToken';
import {PluginTypes, usePluginClient} from './usePluginClient';
import {useWallet} from './useWallet';
import {useTokenHoldersAsync} from 'services/aragon-backend/queries/use-token-holders';

export type MultisigDaoMember = {
  address: string;
};

export type TokenDaoMember = MultisigDaoMember & {
  balance: number;
  votingPower: number;
  delegatee: string;
  delegators: string[];
};

export type DaoMember = MultisigDaoMember | TokenDaoMember;

export type DaoMembersData = {
  members: DaoMember[];
  filteredMembers: DaoMember[];
  daoToken?: Erc20TokenDetails;
};

export const isTokenDaoMember = (member: DaoMember): member is TokenDaoMember =>
  'balance' in member;

const sortDaoMembers = (a: DaoMember, b: DaoMember) => {
  if (isTokenDaoMember(a) && isTokenDaoMember(b)) {
    return a.balance > b.balance ? -1 : 1;
  } else {
    return a.address > b.address ? 1 : -1;
  }
};

const sdkToDaoMember = (
  member: string | TokenVotingMember,
  tokenDecimals = 0
): DaoMember => {
  if (typeof member === 'string') {
    return {address: member};
  }

  const {address, balance, delegatee, delegators, votingPower} = member;

  return {
    address,
    balance: Number(formatUnits(balance, tokenDecimals)),
    votingPower: Number(formatUnits(votingPower, tokenDecimals)),
    delegatee: delegatee === null ? address : delegatee,
    delegators: delegators.map(delegator => delegator.address),
  };
};

/**
 * Hook to fetch DAO members. Fetches token if DAO is token based, and allows
 * for a search term to be passed in to filter the members list.
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
): HookData<DaoMembersData> => {
  const [data, setData] = useState<DaoMember[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const {network} = useNetwork();
  const {api: provider} = useProviders();
  const {address} = useWallet();

  const {data: daoToken} = useDaoToken(pluginAddress);
  const client = usePluginClient(pluginType);
  const fetchTokenHoldersAsync = useTokenHoldersAsync();

  const isTokenBased = pluginType === 'token-voting.plugin.dao.eth';

  useEffect(() => {
    const fetchMembers = async () => {
      if (pluginType == null || (isTokenBased && daoToken == null)) {
        setData([]);
        return;
      }

      setIsLoading(true);

      try {
        // Fetch members from the subgraph for the multisig plugin and for
        // the goerli, base and base-goerli networks.
        if (
          !isTokenBased ||
          network === 'goerli' ||
          network === 'base' ||
          network === 'base-goerli'
        ) {
          const response = await client?.methods.getMembers(pluginAddress);

          if (!response) {
            setData([]);
            return;
          }

          const parsedReponse: DaoMember[] = response.map(member =>
            sdkToDaoMember(member, daoToken?.decimals)
          );

          if (parsedReponse.length === 0 && address && daoToken) {
            const balance = await fetchBalance(
              daoToken.address,
              address,
              provider,
              CHAIN_METADATA[network].nativeCurrency,
              false
            );

            const balanceFormatted = formatUnits(balance, daoToken.decimals);
            const balanceNumber = Number(balanceFormatted);

            if (balanceNumber > 0) {
              parsedReponse.push({
                address,
                balance: balanceNumber,
                delegatee: address,
                delegators: [],
                votingPower: balanceNumber,
              });
            }
          }

          parsedReponse.sort(sortDaoMembers);
          setData(parsedReponse);
        } else {
          const data = await fetchTokenHoldersAsync({
            tokenAddress: daoToken?.address as string,
            network,
          });

          const members = data.holders.holders.map(member => {
            const {address, balance, votes, delegates} = member;
            const tokenDecimals = daoToken?.decimals;

            const delegators = data.holders.holders
              .filter(
                holder =>
                  holder.address !== address && holder.delegates === address
              )
              .map(delegator => delegator.address);

            return {
              address,
              balance: Number(formatUnits(balance, tokenDecimals)),
              votingPower: Number(formatUnits(votes, tokenDecimals)),
              delegatee: delegates,
              delegators,
            };
          });

          members.sort(sortDaoMembers);
          setData(members);
        }

        setError(undefined);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [
    address,
    client?.methods,
    daoToken,
    fetchTokenHoldersAsync,
    network,
    pluginAddress,
    pluginType,
    provider,
    isTokenBased,
  ]);

  const filteredData =
    searchTerm == null || searchTerm === ''
      ? data
      : data.filter(member =>
          member.address.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return {
    data: {
      members: data,
      filteredMembers: filteredData,
      daoToken,
    },
    isLoading,
    error,
  };
};
