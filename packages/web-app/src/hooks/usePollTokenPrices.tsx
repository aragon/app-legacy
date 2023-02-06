import {useCallback, useState} from 'react';

import type {
  PollTokenOptions,
  TokenWithMarketData,
  TokenWithMetadata,
} from 'utils/types';

import useInterval from 'hooks/useInterval';
import useIsMounted from 'hooks/useIsMounted';
import {TimeFilter} from 'utils/constants';
import {formatUnits} from 'utils/library';
import {fetchTokenMarketData, TokenPrices} from 'services/prices';

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
) => {
  const isMounted = useIsMounted();
  const [data, setData] = useState<PolledTokenPricing>({
    tokens: tokenList as TokenWithMarketData[],
    totalAssetChange: 0,
    totalAssetValue: 0,
  });
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const transformData = useCallback(
    (fetchedMarketData: TokenPrices) => {
      let sum = 0;
      let balanceValue: number;
      let tokenMarketData;

      // map tokens
      const tokens: TokenWithMarketData[] = tokenList.map(token => {
        if (!token.metadata.apiId) return token;

        tokenMarketData = fetchedMarketData[token.metadata.apiId];

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
              tokenMarketData.percentages[options.filter],
          },
        } as TokenWithMarketData;
      });

      if (isMounted()) {
        setData({
          tokens,
          totalAssetValue: sum,
          totalAssetChange: 0,
        } as PolledTokenPricing);
      }
    },
    [isMounted, options.filter, tokenList]
  );

  // fetch token market data and calculate changes over time period
  const calculatePricing = useCallback(async () => {
    setIsLoading(true);

    try {
      const tokenIds = tokenList.map(token => token.metadata.apiId).join(',');
      const tokenMarketData = await fetchTokenMarketData(tokenIds);

      if (tokenMarketData) transformData(tokenMarketData);
    } catch (error) {
      setError(error as Error);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [tokenList, transformData]);

  useInterval(() => calculatePricing(), options.interval, tokenList.length > 0);

  return {
    data,
    error,
    isLoading,
  };
};
