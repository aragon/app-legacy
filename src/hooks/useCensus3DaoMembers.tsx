import {useGaslessCensusId} from './useCensus3';
import {
  DaoMembersData,
  DaoMembersOptions,
  sortDaoMembers,
  TokenDaoMember,
} from './useDaoMembers';
import {HookData} from '../utils/types';
import {useParams} from 'react-router-dom';
import {PluginTypes} from './usePluginClient';
import {useDaoToken} from './useDaoToken';
import {useMemo} from 'react';
import {useWallet} from './useWallet';
import {formatUnits} from 'ethers/lib/utils';
import {useCensus3Members} from 'services/vocdoni-census3/queries/use-census3-members';
import {useCensus3Token} from 'services/vocdoni-census3/queries/use-census3-token';
import {useCensus3VotingPower} from 'services/vocdoni-census3/queries/use-census3-voting-power';

const REFETCH_INTERVAL_MS = 5000;

interface UseCensus3DaoMembersProps {
  holders?: TokenDaoMember[];
  pluginAddress: string;
  pluginType: PluginTypes;
  options?: DaoMembersOptions;
}

export const useCensus3DaoMembers = ({
  holders,
  pluginAddress,
  pluginType,
  options,
}: UseCensus3DaoMembersProps): HookData<DaoMembersData> => {
  const enable = options?.enabled ?? false;
  const countOnly = options?.countOnly ?? false;
  const {id: proposalId} = useParams();
  const {data: daoToken} = useDaoToken(pluginAddress);
  const {address} = useWallet();

  // If is not a wrapped token and not on a proposal context we can still get the token holders amount
  const enableCensus3Token = enable && !!daoToken?.address && !proposalId;
  const {data: census3Token} = useCensus3Token(
    {tokenAddress: daoToken?.address ?? ''},
    {
      enabled: enableCensus3Token,
      refetchInterval: query =>
        query.state.data?.status.synced ? false : REFETCH_INTERVAL_MS,
    }
  );

  // Get members from censusId
  // Enabled if no holders are provided and not countOnly
  const enableGetMembers = enable && !countOnly;
  const {
    data: census3Members,
    isLoading: census3MembersIsLoading,
    isError: census3MembersIsError,
  } = useCensus3Members(
    {
      tokenId: daoToken?.address,
      page: options?.page,
    },
    {
      ...options,
      enabled: enableGetMembers,
      refetchInterval: !census3Token?.status.synced
        ? REFETCH_INTERVAL_MS
        : false,
    }
  );

  // Get Census id
  const {
    censusId,
    censusSize: nonWrappedCensusSize,
    isLoading: isCensusIdLoading,
    isError: isCensusIdError,
  } = useGaslessCensusId({
    pluginType,
    enable: enable && !!proposalId,
  });

  const enableVotingPoweredMembersQueries =
    enable &&
    holders &&
    !enableGetMembers &&
    !countOnly &&
    (!!censusId || !!daoToken?.address);
  const votingPoweredMembersQueries = useCensus3VotingPower(
    {holders: holders ?? [], censusId, tokenId: daoToken?.address},
    {
      enabled: enableVotingPoweredMembersQueries,
    }
  );

  const votingPowerIsLoading = useMemo(
    () => votingPoweredMembersQueries.some(result => result.isLoading),
    [votingPoweredMembersQueries]
  );
  const votingPowerIsError = useMemo(
    () => votingPoweredMembersQueries.some(result => result.isError),
    [votingPoweredMembersQueries]
  );

  const holdersWithBalance = useMemo(() => {
    if (enableGetMembers && census3Members) {
      return census3Members.holders.map(member => {
        return {
          address: member.holder,
          balance: Number(formatUnits(member.weight, daoToken?.decimals)),
          votingPower: Number(formatUnits(member.weight, daoToken?.decimals)),
          delegatee: '',
          delegators: [],
        } as TokenDaoMember;
      });
    }
    if (enableVotingPoweredMembersQueries) {
      return votingPoweredMembersQueries.map(result => result.data!);
    }
    return holders ?? [];
  }, [
    census3Members,
    daoToken?.decimals,
    enableGetMembers,
    enableVotingPoweredMembersQueries,
    holders,
    votingPoweredMembersQueries,
  ]);

  const sortedData = options?.sort
    ? holdersWithBalance?.sort(sortDaoMembers(options.sort, address))
    : holdersWithBalance;

  const searchTerm = options?.searchTerm;
  const filteredMembers = !searchTerm
    ? sortedData
    : sortedData?.filter(
        member =>
          member?.address.toLowerCase().includes(searchTerm.toLowerCase())
      );

  let memberCount = 0;
  if (enableCensus3Token && census3Token) {
    memberCount = census3Token.size;
  } else if (nonWrappedCensusSize) {
    memberCount = nonWrappedCensusSize;
  }

  const isLoading =
    (isCensusIdLoading && !!proposalId) ||
    (votingPowerIsLoading && enableVotingPoweredMembersQueries) ||
    (census3MembersIsLoading && enableGetMembers);
  const isError =
    isCensusIdError || votingPowerIsError || census3MembersIsError;

  return {
    data: {
      members: sortedData,
      filteredMembers,
      daoToken,
      memberCount,
    },
    isLoading: isLoading,
    isError: isError,
  };
};
