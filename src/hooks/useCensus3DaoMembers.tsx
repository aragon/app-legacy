import {useCensus3Token, useGaslessCensusId} from './useCensus3';
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
import {useCensus3VotingPower} from '../services/vocdoni-census3/census3-queries';
import {useMemo} from 'react';
import {useWallet} from './useWallet';

interface UseCensus3DaoMembersProps {
  holders: TokenDaoMember[];
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
  const enableHoldersBalance = enable && !(options?.countOnly ?? false);
  const {id: proposalId} = useParams();
  const {data: daoToken} = useDaoToken(pluginAddress);
  const {address} = useWallet();

  const {
    censusId,
    censusSize: nonWrappedCensusSize,
    isLoading: isCensusIdLoading,
    isError: isCensusIdError,
  } = useGaslessCensusId({
    pluginType,
    enable: enable,
  });

  const votingPoweredMembersQueries = useCensus3VotingPower(
    holders,
    censusId,
    daoToken?.address,
    {
      enabled:
        enable && enableHoldersBalance && (!!censusId || !!daoToken?.address),
    }
  );

  // If is not a wrapped token and not on a proposal context we can still get the token holders amount
  const enableCensus3Token = enable && !proposalId;
  const {token: census3Token} = useCensus3Token({
    pluginType,
    daoToken,
    enable: enableCensus3Token,
  });

  const votingPowerIsLoading = useMemo(
    () => votingPoweredMembersQueries.some(result => result.isLoading),
    [votingPoweredMembersQueries]
  );
  const votingPowerIsError = useMemo(
    () => votingPoweredMembersQueries.some(result => result.isError),
    [votingPoweredMembersQueries]
  );

  const holdersWithBalance = useMemo(() => {
    if (!enableHoldersBalance) return holders;
    return votingPoweredMembersQueries.map(result => result.data!);
  }, [votingPoweredMembersQueries, enableHoldersBalance, holders]);

  const sortedData = options?.sort
    ? holdersWithBalance.sort(sortDaoMembers(options.sort, address))
    : holdersWithBalance;

  const searchTerm = options?.searchTerm;
  const filteredMembers = !searchTerm
    ? sortedData
    : sortedData.filter(member =>
        member.address.toLowerCase().includes(searchTerm.toLowerCase())
      );

  let memberCount = 0;
  if (enableCensus3Token && census3Token !== null) {
    memberCount = census3Token!.size;
  } else if (nonWrappedCensusSize !== null) {
    memberCount = nonWrappedCensusSize;
  }

  const isLoading = isCensusIdLoading || votingPowerIsLoading;
  const isError = isCensusIdError || votingPowerIsError;

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
