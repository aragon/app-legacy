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
import {
  useCensus3Members,
  useCensus3Token,
  useCensus3VotingPower,
} from '../services/vocdoni-census3/census3-queries';
import {useMemo} from 'react';
import {useWallet} from './useWallet';

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
  const enable = options?.enabled || false;
  const countOnly = options?.countOnly || false;
  const {id: proposalId} = useParams();
  const {data: daoToken} = useDaoToken(pluginAddress);
  const {address} = useWallet();

  // If is not a wrapped token and not on a proposal context we can still get the token holders amount
  const enableCensus3Token = enable && !proposalId;
  const {data: census3Token} = useCensus3Token(daoToken?.address ?? '', {
    enabled: enable && !!(daoToken?.address ?? false) && enableCensus3Token,
  });

  // Get members from censusId
  // Enabled if no holders are provided and not countOnly
  const enableGetMembers = enable && !holders && !countOnly;
  const {
    data: cenus3Members,
    isLoading: census3MembersIsLoading,
    isError: census3MembersIsError,
  } = useCensus3Members({
    tokenId: daoToken?.address,
    page: options?.page,
    options: {
      ...options,
      enabled: enable && enableGetMembers,
    },
  });

  // Get Census id
  const {
    censusId,
    censusSize: nonWrappedCensusSize,
    isLoading: isCensusIdLoading,
    isError: isCensusIdError,
  } = useGaslessCensusId({
    pluginType,
    enable: enable,
  });

  const enableVotingPoweredMembersQueries =
    enable &&
    holders &&
    !enableGetMembers &&
    !countOnly &&
    (!!censusId || !!daoToken?.address);
  const votingPoweredMembersQueries = useCensus3VotingPower(
    holders ?? [],
    censusId,
    daoToken?.address,
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
    if (enableGetMembers && cenus3Members) {
      return cenus3Members.holders.map(member => {
        return {
          address: member.holder,
          balance: Number(member.weight),
          votingPower: Number(member.weight),
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
    cenus3Members,
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
    : sortedData?.filter(member =>
        member.address.toLowerCase().includes(searchTerm.toLowerCase())
      );

  let memberCount = 0;
  if (enableCensus3Token && census3Token !== null) {
    memberCount = census3Token!.size;
  } else if (nonWrappedCensusSize !== null) {
    memberCount = nonWrappedCensusSize;
  }

  const isLoading =
    isCensusIdLoading || votingPowerIsLoading || census3MembersIsLoading;
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
