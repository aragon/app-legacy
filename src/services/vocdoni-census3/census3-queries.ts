import {useQueries, useQuery, UseQueryOptions} from '@tanstack/react-query';
import {useCallback} from 'react';
import {TokenDaoMember} from '../../hooks/useDaoMembers';
import {Census3QueryKeys} from './query-keys';
import {useWallet} from '../../hooks/useWallet';
import {useClient} from '@vocdoni/react-providers';
import {useCensus3Client} from '../../hooks/useCensus3';
import {
  getCensus3VotingPowerByCensusId,
  getCensus3VotingPowerByTokenAddress,
} from './census3-service';
import {StrategyHolders, Token} from '@vocdoni/sdk';

/**
 * Get member balance from vocdoni census3. It accepts a census id or a token id to retrieve the voting power
 * @param holders list of members to get the balance
 * @param censusId
 * @param tokenId
 */
export const useCensus3VotingPower = (
  holders: TokenDaoMember[],
  censusId?: string | null,
  tokenId?: string,
  options?: UseQueryOptions<TokenDaoMember>
) => {
  const {chainId} = useWallet();
  const {client: vocdoniClient} = useClient();
  const census3 = useCensus3Client();

  const fetchVotingPower = useCallback(
    async (member: TokenDaoMember) => {
      let votingPower: string | bigint = '0';
      if (censusId) {
        votingPower = await getCensus3VotingPowerByCensusId(
          vocdoniClient,
          member.address,
          censusId
        );
      } else if (tokenId) {
        votingPower = await getCensus3VotingPowerByTokenAddress(
          census3,
          tokenId,
          chainId,
          member.address
        );
      }
      return votingPower;
    },
    [census3, censusId, chainId, tokenId, vocdoniClient]
  );

  const queries = holders.map(holder => ({
    queryKey: Census3QueryKeys.votingPower(holder),
    queryFn: () => {
      const votingPower = fetchVotingPower(holder);
      holder.balance = Number(votingPower);
      holder.votingPower = Number(votingPower);
      return holder;
    },
    ...options,
  }));

  return useQueries({queries});
};

interface useCensus3VotingPowerProps {
  page?: number;
  // censusId?: string | null;
  tokenId?: string;
  options?: UseQueryOptions<StrategyHolders>;
}

export const useCensus3Members = ({
  tokenId,
  page,
  options,
}: useCensus3VotingPowerProps) => {
  const hookEnabled = options?.enabled ?? false;
  const enableCensus3Token = hookEnabled && !!tokenId;

  const {data: census3Token} = useCensus3Token(tokenId ?? '', {
    enabled: enableCensus3Token,
  });

  const census3 = useCensus3Client();

  let strategyId: number | undefined;
  if (enableCensus3Token && census3Token) {
    strategyId = census3Token.defaultStrategy;
  }

  const getHolders = useCallback(async () => {
    return await census3.getStrategyHolders(strategyId!, {
      pageSize: page || -1,
    });
  }, [census3, page, strategyId]);

  return useQuery(
    Census3QueryKeys.holdersList(strategyId ?? 0, page ?? 0),
    getHolders,
    {...options, enabled: hookEnabled && !!strategyId}
  );
};

/**
 * Hook to fetch token information using census3.getToken function
 */
export const useCensus3Token = (
  tokenAddress: string,
  options?: UseQueryOptions<Token>
) => {
  const census3 = useCensus3Client();
  const {chainId} = useWallet();
  return useQuery(
    Census3QueryKeys.token(tokenAddress),
    async () => await census3.getToken(tokenAddress, chainId),
    options
  );
};
