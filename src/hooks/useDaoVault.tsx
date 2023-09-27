import {useMemo} from 'react';
import {TimeFilter} from 'utils/constants';
import {formatUnits} from 'utils/library';
import {historicalTokenBalances, timeFilterToMinutes} from 'utils/tokens';

import {PollTokenOptions, VaultToken} from 'utils/types';
import {useDaoBalances} from './useDaoBalances';
import {useDaoDetailsQuery} from './useDaoDetails';
import {useDaoTransfers} from './useDaoTransfers';
import {usePollTokenPrices} from './usePollTokenPrices';
import {usePollTransfersPrices} from './usePollTransfersPrices';
import {useTokenMetadata} from './useTokenMetadata';

/**
 * Hook encapsulating the logic for fetching the assets from the DAO vault, mapping them
 * to their corresponding USD market values, and calculating their treasury share percentage.
 * @param options.filter TimeFilter for market data
 * @param options.interval Refresh interval in milliseconds
 * @returns A list of transfers and of tokens in the DAO treasury,
 * current USD sum value of all assets, and the price change in USD based on the filter.
 */
export const useDaoVault = (
  options: PollTokenOptions = {filter: TimeFilter.day, interval: 300000}
) => {
  const {data: daoDetails, isLoading: isDaoDetailsLoading} =
    useDaoDetailsQuery();

  const {data: balances, isLoading: isBalancesLoading} = useDaoBalances(
    daoDetails?.address ?? ''
  );
  const {data: tokensWithMetadata, isLoading: isTokensMetadataLoading} =
    useTokenMetadata(balances);
  const {data: tokenPrices, isLoading: isTokensPricesLoading} =
    usePollTokenPrices(tokensWithMetadata, options);

  const {data: transfers, isLoading: isCoreTransfersLoading} = useDaoTransfers(
    daoDetails?.address ?? ''
  );
  const {data: transferPrices, isLoading: isTransferPricesLoading} =
    usePollTransfersPrices(transfers);

  const isTransfersLoading =
    isDaoDetailsLoading || isCoreTransfersLoading || isTransferPricesLoading;

  const isCumulativeStatsLoading =
    isDaoDetailsLoading ||
    isBalancesLoading ||
    isTokensMetadataLoading ||
    isTokensPricesLoading;

  const isTokensLoading = isCumulativeStatsLoading || isTransfersLoading;

  const tokens: VaultToken[] = useMemo(() => {
    if (tokenPrices?.tokens?.length === 0) {
      return tokensWithMetadata;
    }

    const actualBalance = (bal: bigint, decimals: number) =>
      Number(formatUnits(bal, decimals));

    const tokenPreviousBalances = historicalTokenBalances(
      transfers,
      tokensWithMetadata,
      timeFilterToMinutes(options.filter)
    );

    tokenPrices.totalAssetChange = 0;

    tokenPrices.tokens.forEach(token => {
      if (token.marketData) {
        const prevBalance =
          tokenPreviousBalances[token.metadata.id]?.balance || BigInt(0);
        const prevPrice =
          token.marketData.price /
          (1 + token.marketData.percentageChangedDuringInterval / 100.0);
        const prevBalanceValue =
          actualBalance(prevBalance, token.metadata.decimals) * prevPrice;

        token.marketData.valueChangeDuringInterval =
          token.marketData.balanceValue - prevBalanceValue;
        tokenPrices.totalAssetChange +=
          token.marketData.valueChangeDuringInterval;
      }
    });

    const values = tokenPrices.tokens.map(token => {
      return {
        ...token,
        ...(token.marketData?.balanceValue !== undefined &&
        tokenPrices.totalAssetValue > 0
          ? {
              treasurySharePercentage:
                (token.marketData.balanceValue / tokenPrices?.totalAssetValue) *
                100,
            }
          : {}),
      };
    });

    return values;
  }, [options.filter, tokenPrices, tokensWithMetadata, transfers]);

  return {
    tokens,
    totalAssetValue: tokenPrices.totalAssetValue,
    totalAssetChange: tokenPrices.totalAssetChange,
    transfers: transferPrices.transfers,
    isDaoBalancePositive: transferPrices.isDaoBalancePositive,
    isTokensLoading,
    isTransfersLoading,
    isCumulativeStatsLoading,
  };
};
