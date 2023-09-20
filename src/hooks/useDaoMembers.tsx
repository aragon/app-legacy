import {Erc20TokenDetails, TokenVotingMember} from '@aragon/sdk-client';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {formatUnits} from 'ethers/lib/utils';
import {HookData} from 'utils/types';
import {useDaoToken} from './useDaoToken';
import {
  OFFCHAIN_PLUGIN_NAME,
  PluginTypes,
  usePluginClient,
} from './usePluginClient';
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
  memberCount: number;
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

export interface DaoMembersOptions {
  searchTerm?: string;
  sort?: DaoMemberSort;
  page?: number;
  countOnly?: boolean;
  memberList?: string[];
  enabled?: boolean;
}

/**
 * Hook to fetch DAO members. Fetches token if DAO is token based, and allows
 * for a search term to be passed in to filter the members list.
 *
 * @param pluginAddress plugin from which members will be retrieved
 * @param pluginType plugin type
 * @param options Optional options map
 * @returns A list of DAO members, the total number of members in the DAO and
 * the DAO token (if token-based)
 */
export const useDaoMembers = (
  pluginAddress: string,
  pluginType: PluginTypes,
  options?: DaoMembersOptions
): HookData<DaoMembersData> => {
  const {network} = useNetwork();
  const {api: provider} = useProviders();

  const isTokenBased =
    pluginType === 'token-voting.plugin.dao.eth' ||
    pluginType === OFFCHAIN_PLUGIN_NAME;

  const opts = options ? options : {};
  let memberCount = 0;
  const countOnly = opts?.countOnly || false;
  const enabled = opts?.enabled || true;

  const networkCovalentSupported = !(
    network === 'goerli' ||
    network === 'mumbai' ||
    network === 'base' ||
    network === 'base-goerli'
  );
  const useSubgraph = !isTokenBased || !networkCovalentSupported;
  const {
    data: subgraphData = [],
    isError: isSubgraphError,
    isInitialLoading: isSubgraphLoading,
  } = useMembers( // todo(kon): check 02b5ac84 to se previous rebased code
    {pluginAddress, pluginType},
    {enabled: useSubgraph && enabled}
  );
  const parsedSubgraphData = subgraphData.map(member =>
    sdkToDaoMember(member, daoToken?.decimals)
  );

  const {data: userBalance} = useBalance({
    address: address as Address,
    token: daoToken?.address as Address,
    chainId: CHAIN_METADATA[network as SupportedNetworks].id,
    enabled: address != null && daoToken != null && !countOnly && enabled,
  });
  const userBalanceNumber = Number(
    formatUnits(userBalance?.value ?? '0', daoToken?.decimals)
  );

  const useGraphql =
    !useSubgraph && pluginType != null && daoToken != null && enabled;

  const {
    data: graphqlData,
    isError: isGraphqlError,
    isInitialLoading: isGraphqlLoading,
  } = useTokenHolders(
    {
      network,
      tokenAddress: daoToken?.address as string,
      page: opts?.page,
    },
    {enabled: useGraphql}
  );

  if (!enabled)
    return {
      data: {
        members: [],
        filteredMembers: [],
        memberCount: 0,
      },
      isLoading: false,
      isError: false,
    };

  // token holders data gives us the total holders, so only need to call once
  // and return this number if countOnly === true
  if (countOnly) {
    if (useSubgraph) {
      memberCount = parsedSubgraphData?.length || 0;
    } else {
      memberCount = graphqlData?.holders.totalHolders || 0;
    }
    return {
      data: {
        members: [],
        filteredMembers: [],
        daoToken,
        memberCount,
      },
      isLoading: isSubgraphLoading || isGraphqlLoading,
      isError: isSubgraphError || isGraphqlError,
    };
  }

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

  const sortedData = opts?.sort
    ? [...getCombinedData()].sort(sortDaoMembers(opts.sort, address))
    : getCombinedData();
  memberCount = useSubgraph
    ? sortedData.length
    : graphqlData?.holders.totalHolders || sortedData.length;
  const searchTerm = opts?.searchTerm;
  const filteredData = !searchTerm
    ? sortedData
    : sortedData.filter(member =>
        member.address.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return {
    data: {
      members: sortedData,
      filteredMembers: filteredData,
      daoToken,
      memberCount,
    },
    isLoading: isSubgraphLoading || isGraphqlLoading,
    isError: isSubgraphError || isGraphqlError,
  };
};
