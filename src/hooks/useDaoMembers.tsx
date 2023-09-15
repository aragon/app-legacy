import {Erc20TokenDetails, TokenVotingMember} from '@aragon/sdk-client';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {formatUnits} from 'ethers/lib/utils';
import {HookData} from 'utils/types';
import {useDaoToken} from './useDaoToken';
import {PluginTypes} from './usePluginClient';
import {useWallet} from './useWallet';
import {useTokenHolders} from 'services/aragon-backend/queries/use-token-holders';
import {useMembers} from 'services/aragon-sdk/queries/use-members';
import {Address, useBalance} from 'wagmi';

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

export type DaoMemberSort = 'delegations' | 'votingPower';

export type DaoMembersData = {
  members: DaoMember[];
  filteredMembers: DaoMember[];
  daoToken?: Erc20TokenDetails;
};

const compareAddresses = (addressA?: string | null, addressB?: string | null) =>
  addressA?.toLowerCase() === addressB?.toLowerCase();

export const isTokenDaoMember = (member: DaoMember): member is TokenDaoMember =>
  'balance' in member;

const sortDaoMembers =
  (sort?: DaoMemberSort, userAddress?: string | null) =>
  (a: DaoMember, b: DaoMember) => {
    const isConnectedUserA = compareAddresses(a.address, userAddress);
    const isConnectedUserB = compareAddresses(b.address, userAddress);

    // Always move the connected user to the top position
    if (isConnectedUserA || isConnectedUserB) {
      return isConnectedUserA ? -1 : 1;
    }

    if (isTokenDaoMember(a) && isTokenDaoMember(b)) {
      const isDelegatorA = a.delegators.some(delegator =>
        compareAddresses(delegator, userAddress)
      );
      const isDelegatorB = b.delegators.some(delegator =>
        compareAddresses(delegator, userAddress)
      );

      // Always move the delegator to the top position
      if (isDelegatorA || isDelegatorB) {
        return isDelegatorA ? -1 : 1;
      }

      const delegatorsResult = b.delegators.length - a.delegators.length;
      const votingPowerResult = b.votingPower - a.votingPower;

      if (sort === 'delegations') {
        return delegatorsResult === 0 ? votingPowerResult : delegatorsResult;
      }

      return votingPowerResult;
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
  searchTerm?: string,
  sort?: DaoMemberSort
): HookData<DaoMembersData> => {
  const {network} = useNetwork();
  const {address} = useWallet();

  const {data: daoToken} = useDaoToken(pluginAddress);

  const isTokenBased = pluginType === 'token-voting.plugin.dao.eth';

  const useSubgraph =
    !isTokenBased ||
    network === 'goerli' ||
    network === 'base' ||
    network === 'base-goerli';
  const {
    data: subgraphData = [],
    isError: isSugraphError,
    isInitialLoading: isSubgraphLoading,
  } = useMembers({pluginAddress, pluginType}, {enabled: useSubgraph});
  const parsedSubgraphData = subgraphData.map(member =>
    sdkToDaoMember(member, daoToken?.decimals)
  );

  const {data: userBalance} = useBalance({
    address: address as Address,
    token: daoToken?.address as Address,
    chainId: CHAIN_METADATA[network as SupportedNetworks].id,
    enabled: address != null && daoToken != null,
  });
  const userBalanceNumber = Number(
    formatUnits(userBalance?.value ?? '0', daoToken?.decimals)
  );

  const useGraphql = !useSubgraph && pluginType != null && daoToken != null;

  const {
    data: graphqlData,
    isError: isGraphqlError,
    isInitialLoading: isGraphqlLoading,
  } = useTokenHolders(
    {
      network,
      tokenAddress: daoToken?.address as string,
    },
    {enabled: useGraphql}
  );

  const parsedGraphqlData = (graphqlData?.holders.holders ?? []).map(member => {
    const {address, balance, votes, delegates} = member;
    const tokenDecimals = daoToken?.decimals;

    const delegators = graphqlData?.holders.holders
      .filter(
        holder =>
          !compareAddresses(holder.address, address) &&
          compareAddresses(holder.delegates, address)
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

  const getCombinedData = (): DaoMember[] => {
    if (useSubgraph) {
      if (subgraphData.length === 0 && userBalanceNumber > 0) {
        return [
          {
            address: address as string,
            balance: userBalanceNumber,
            delegatee: address as string,
            delegators: [],
            votingPower: userBalanceNumber,
          },
        ];
      } else {
        return parsedSubgraphData;
      }
    } else {
      return parsedGraphqlData;
    }
  };

  const sortedData = [...getCombinedData()].sort(sortDaoMembers(sort, address));
  const filteredData =
    searchTerm == null || searchTerm === ''
      ? sortedData
      : sortedData.filter(member =>
          member.address.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return {
    data: {
      members: sortedData,
      filteredMembers: filteredData,
      daoToken,
    },
    isLoading: isSubgraphLoading || isGraphqlLoading,
    isError: isSugraphError || isGraphqlError,
  };
};
