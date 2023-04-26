import {AssetBalance, TokenType} from '@aragon/sdk-client';
import {useEffect, useMemo, useState} from 'react';
import {alchemyApiKeys, CHAIN_METADATA} from 'utils/constants';

import {HookData} from 'utils/types';
import {getTokenInfo} from 'utils/tokens';
import {useSpecificProvider} from 'context/providers';
import {useNetwork} from 'context/network';

export const useDaoBalances = (
  daoAddress: string
): HookData<Array<AssetBalance> | undefined> => {
  const {network} = useNetwork();

  const [data, setData] = useState<Array<AssetBalance>>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  // Construct the Alchemy API URL
  const url = `${CHAIN_METADATA[network].alchemyApi}/${alchemyApiKeys[network]}`;

  // Memoize the options object to prevent unnecessary re-renders
  const options = useMemo(
    () => ({
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [daoAddress],
      }),
    }),
    [daoAddress]
  );

  // Use the useEffect hook to fetch DAO balances
  useEffect(() => {
    async function getBalances() {
      try {
        setIsLoading(true);

        // Fetch the token list using the Alchemy API
        const res = await fetch(url, options);
        const tokenList = await res.json();
        let nativeTokenBalances = [] as Array<AssetBalance>;

        // Filter out tokens with a zero balance
        const nonZeroBalances = tokenList.result.tokenBalances?.filter(
          (token: {tokenBalance: string}) => {
            return BigInt(token.tokenBalance) !== BigInt(0);
          }
        );

        const fetchNativeCurrencyBalance = provider.getBalance(daoAddress);

        // Define a list of promises to fetch ERC20 token balances
        const tokenListPromises = nonZeroBalances.map(
          async ({
            contractAddress,
            tokenBalance,
          }: {
            contractAddress: string;
            tokenBalance: string;
          }) => {
            const {decimals, name, symbol} = await getTokenInfo(
              contractAddress,
              provider,
              CHAIN_METADATA[network].nativeCurrency
            );
            return {
              address: contractAddress,
              name,
              symbol,
              updateDate: new Date(),
              type: TokenType.ERC20,
              balance: BigInt(tokenBalance),
              decimals,
            };
          }
        );

        // Wait for both native currency and ERC20 balances to be fetched
        const [nativeCurrencyBalance, erc20balances] = await Promise.all([
          fetchNativeCurrencyBalance,
          Promise.all(tokenListPromises),
        ]);

        // If the native currency balance is non-zero, add it to the list
        if (!nativeCurrencyBalance.eq(0)) {
          nativeTokenBalances = [
            {
              type: TokenType.NATIVE,
              ...CHAIN_METADATA[network].nativeCurrency,
              updateDate: new Date(),
              balance: BigInt(nativeCurrencyBalance.toString()),
            },
          ];
        }

        if (erc20balances) setData([...nativeTokenBalances, ...erc20balances]);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (daoAddress) getBalances();
  }, [daoAddress, network, options, provider, url]);

  return {data, error, isLoading};
};
