import {useQueries, UseQueryOptions} from '@tanstack/react-query';
import {useCallback} from 'react';
import {TokenDaoMember} from 'hooks/useDaoMembers';
import {Census3QueryKeys} from '../query-keys';
import {useWallet} from 'hooks/useWallet';
import {useClient} from '@vocdoni/react-providers';
import {useCensus3Client} from 'hooks/useCensus3';
import {
  fetchVotingPowerByCensusId,
  fetchVotingPowerByTokenAddress,
} from '../census3-service';
import {IFetchCensus3VotingPowerParams} from '../census3-service.api';

/**
 * Get member balance from vocdoni census3. It accepts a census id or a token id to retrieve the voting power
 * @param holders list of members to get the balance
 * @param censusId
 * @param tokenId
 */
export const useCensus3VotingPower = (
  {holders, censusId, tokenId}: IFetchCensus3VotingPowerParams,
  options: Omit<UseQueryOptions<TokenDaoMember>, 'queryKey'>
) => {
  const {chainId} = useWallet();
  const {client: vocdoniClient} = useClient();
  const census3Client = useCensus3Client();

  const fetchVotingPower = useCallback(
    async (member: TokenDaoMember) => {
      let votingPower: string | bigint = '0';
      if (censusId) {
        votingPower = await fetchVotingPowerByCensusId({
          vocdoniClient,
          holderAddress: member.address,
          censusId,
        });
      } else if (tokenId) {
        votingPower = await fetchVotingPowerByTokenAddress({
          census3Client,
          tokenId,
          chainId,
          holderId: member.address,
        });
      }
      return votingPower;
    },
    [census3Client, censusId, chainId, tokenId, vocdoniClient]
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
