import {useMemo} from 'react';

import type {
  HookData,
  PollTokenOptions,
  TokenWithMarketData,
  TokenWithMetadata,
} from 'utils/types';
import {TimeFilter} from 'utils/constants';
import {formatUnits} from 'utils/library';
import {useTokenList} from 'services/token/queries/use-token';
import {useNetwork} from 'context/network';

type PolledTokenPricing = {
  tokens: TokenWithMarketData[];
  totalAssetValue: number;
  totalAssetChange: number;
};

/**
 * Hook for fetching token prices at specified intervals
 * @param tokenList List of token ids to fetch USD  value for
 * @param options.filter TimeFilter for market data
 * @param options.interval Delay in milliseconds
 * @returns Object with key value pairs corresponding to token address and USD value respectively.
 * If USD value isn't found, returns null for token price.
 */
export const usePollTokenPrices = (
  tokenList: TokenWithMetadata[],
  options: PollTokenOptions = {filter: TimeFilter.day, interval: 300000}
): HookData<PolledTokenPricing> => {
  const {network} = useNetwork();

  const tokenListParams = tokenList.map(({metadata}) => ({
    address: metadata.id,
    network,
    symbol: metadata.symbol,
  }));

  const tokenResults = useTokenList(tokenListParams, {
    refetchInterval: options.interval,
  });

  const isLoading = tokenResults.some(result => result.isLoading);
  const isError = tokenResults.some(result => result.isError);
  const fetchedTokens = tokenResults.map(result => result.data);

  const processedTokens = useMemo(() => {
    let sum = 0;
    let balanceValue: number;

    // map tokens
    const tokens: TokenWithMarketData[] = tokenList.map((token, index) => {
      const tokenMarketData = fetchedTokens[index];

      if (tokenMarketData?.price == null) {
        return token;
      }

      // calculate current balance value
      balanceValue =
        tokenMarketData.price *
        Number(formatUnits(token.balance, token.metadata.decimals));

      sum += balanceValue;

      return {
        ...token,
        marketData: {
          price: tokenMarketData.price,
          balanceValue,
          percentageChangedDuringInterval:
            tokenMarketData.priceChange[options.filter],
        },
      } as TokenWithMarketData;
    });

    return {tokens, totalAssetValue: sum, totalAssetChange: 0};
  }, [fetchedTokens, options.filter, tokenList]);

  return {
    data: processedTokens,
    isError,
    isLoading,
  };
};
