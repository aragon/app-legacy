import {useQuery, UseQueryOptions} from '@tanstack/react-query';
import {useCallback} from 'react';
import {Census3QueryKeys} from '../query-keys';
import {useCensus3Client} from 'hooks/useCensus3';
import {useCensus3Token} from './use-census3-token';
import {ICensus3VotingPowerProps} from '../census3-service.api';
import {StrategyHolders} from '@vocdoni/sdk';

export const useCensus3Members = (
  {tokenId, page}: ICensus3VotingPowerProps,
  options?: Omit<UseQueryOptions<StrategyHolders>, 'queryKey'>
) => {
  const hookEnabled = options?.enabled ?? false;
  const enableCensus3Token = hookEnabled && !!tokenId;

  const {data: census3Token} = useCensus3Token(
    {tokenAddress: tokenId ?? ''},
    {
      enabled: enableCensus3Token,
    }
  );

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

  return useQuery({
    queryKey: Census3QueryKeys.holdersList(strategyId ?? 0, page ?? 0),
    queryFn: getHolders,
    enabled: hookEnabled && !!strategyId,
    ...options,
  });
};
