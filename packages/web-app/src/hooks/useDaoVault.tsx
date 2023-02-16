import {useEffect, useState} from 'react';
import {TimeFilter} from 'utils/constants';
import {formatUnits} from 'utils/library';
import {historicalTokenBalances, timeFilterToMinutes} from 'utils/tokens';

import {PollTokenOptions, VaultToken} from 'utils/types';
import {useDaoBalances} from './useDaoBalances';
import {useDaoTransfers} from './useDaoTransfers';
import {usePollTokenPrices} from './usePollTokenPrices';
import {usePollTransfersPrices} from './usePollTransfersPrices';
import {useTokenMetadata} from './useTokenMetadata';

/**
 * Hook encapsulating the logic for fetching the assets from the DAO vault, mapping them
 * to their corresponding USD market values, and calculating their treasury share percentage.
 * @param daoAddress Dao address
 * @param options.filter TimeFilter for market data
 * @param options.interval Refresh interval in milliseconds
 * @returns A list of transfers and of tokens in the DAO treasury,
 * current USD sum value of all assets, and the price change in USD based on the filter.
 */
export const useDaoVault = (
  daoAddress: string,
  options: PollTokenOptions = {filter: TimeFilter.day, interval: 300000}
) => {
  const {data: balances} = useDaoBalances(daoAddress);
  const {data: tokensWithMetadata} = useTokenMetadata(balances || []);
  const {data} = usePollTokenPrices(tokensWithMetadata, options);

  const {data: transfers} = useDaoTransfers(daoAddress);
  const {data: transferPrices} = usePollTransfersPrices(transfers);
  const [tokens, setTokens] = useState<VaultToken[]>([]);

  useEffect(() => {
    if (data?.tokens?.length === 0) {
      setTokens(tokensWithMetadata as VaultToken[]);
      return;
    }

    const actualBalance = (bal: bigint, decimals: number) =>
      Number(formatUnits(bal, decimals));
    const tokenPreviousBalances = historicalTokenBalances(
      transfers,
      tokensWithMetadata,
      timeFilterToMinutes(options.filter)
    );
    data.totalAssetChange = 0;
    data.tokens.forEach(token => {
      if (token.marketData) {
        const prevBalance = tokenPreviousBalances[token.metadata.id].balance;
        const prevPrice =
          token.marketData.price /
          (1 + token.marketData.percentageChangedDuringInterval / 100.0);
        const prevBalanceValue =
          actualBalance(prevBalance, token.metadata.decimals) * prevPrice;
        token.marketData.valueChangeDuringInterval =
          token.marketData.balanceValue - prevBalanceValue;
        data.totalAssetChange += token.marketData.valueChangeDuringInterval;
      }
    });

    const values = data.tokens.map(token => {
      return {
        ...token,
        ...(token.marketData?.balanceValue
          ? {
              treasurySharePercentage:
                (token.marketData.balanceValue / data?.totalAssetValue) * 100,
            }
          : {}),
      };
    });

    setTokens(values);
  }, [
    data.tokens,
    data?.totalAssetValue,
    tokensWithMetadata,
    data,
    options.filter,
    transfers,
  ]);

  return {
    tokens,
    totalAssetValue: data.totalAssetValue,
    totalAssetChange: data.totalAssetChange,
    transfers: transferPrices.transfers,
  };
};
