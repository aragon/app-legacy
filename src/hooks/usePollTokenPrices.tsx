import {useCallback, useMemo} from 'react';

import type {
  PollTokenOptions,
  TokenWithMarketData,
  TokenWithMetadata,
} from 'utils/types';
import {TimeFilter} from 'utils/constants';
import {formatUnits} from 'utils/library';
import {TokenPrices} from 'services/token';
import {useTokenMarketData} from 'services/token/queries/use-token-market-data';

type PolledTokenPricing = {
  tokens: TokenWithMarketData[];
  totalAssetValue: number;
  totalAssetChange: number;
};

export interface IUsePollTokenPricesResult {
  data: PolledTokenPricing;
  isLoading: boolean;
  error: unknown;
}

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
): IUsePollTokenPricesResult => {
  const tokenIds = tokenList
    .filter(token => token.metadata.apiId != null)
    .map(token => token.metadata.apiId!);
  const {
    error,
    isLoading,
    data: marketData,
  } = useTokenMarketData(
    {tokenIds},
    {refetchInterval: options.interval, enabled: tokenIds.length > 0}
  );

  const transformData = useCallback(
    (fetchedMarketData: TokenPrices | undefined) => {
      let sum = 0;
      let balanceValue: number;

      // map tokens
      const tokens: TokenWithMarketData[] = tokenList.map(token => {
        const tokenMarketData = fetchedMarketData?.[token.metadata.apiId ?? ''];

        if (!token.metadata.apiId || !tokenMarketData) return token;

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

      return {tokens, totalAssetValue: sum, totalAssetChange: 0};
    },
    [options.filter, tokenList]
  );

  const processedData = useMemo(
    () => transformData(marketData),
    [transformData, marketData]
  );

  return {
    data: processedData,
    error,
    isLoading,
  };
};
