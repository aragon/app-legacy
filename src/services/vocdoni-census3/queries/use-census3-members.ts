import {useQuery, UseQueryOptions} from '@tanstack/react-query';
import {useCallback} from 'react';
import {Census3QueryKeys} from '../query-keys';
import {useCensus3Client} from 'hooks/useCensus3';
import {StrategyHolders} from '@vocdoni/sdk';
import {useCensus3Token} from './use-census3-token';

interface useCensus3VotingPowerProps {
  page?: number;
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
