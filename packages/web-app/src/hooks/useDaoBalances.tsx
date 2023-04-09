import {AssetBalance, TokenType} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';
import {alchemyApiKeys, CHAIN_METADATA} from 'utils/constants';

import {HookData} from 'utils/types';
import {getTokenInfo} from 'utils/tokens';
import {useSpecificProvider} from 'context/providers';
import {useNetwork} from 'context/network';
import {formatUnits} from 'ethers/lib/utils';

export const useDaoBalances = (
  daoAddressOrEns: string
): HookData<Array<AssetBalance> | undefined> => {
  const {network} = useNetwork();

  const [data, setData] = useState<Array<AssetBalance>>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  // ALCHEMY URL --> Replace with your API Key at the end
  const url = `${CHAIN_METADATA[network].alchemyApi}/${alchemyApiKeys[network]}`;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'alchemy_getTokenBalances',
      params: [daoAddressOrEns],
    }),
  };

  useEffect(() => {
    async function getBalances() {
      try {
        setIsLoading(true);

        const res = await fetch(url, options);
        const tokenList = await res.json();

        const nonZeroBalances = tokenList.result.tokenBalances.filter(
          (token: {tokenBalance: string}) => {
            return token.tokenBalance !== '0';
          }
        );

        const nativeTokenBalance = await provider.getBalance(daoAddressOrEns);

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

        const NativeTokenBalances = [
          {
            type: TokenType.NATIVE,
            ...CHAIN_METADATA[network].nativeCurrency,
            updateDate: new Date(),
            balance: nativeTokenBalance,
          },
        ];

        const erc20balances = await Promise.all(tokenListPromises);
        if (erc20balances) setData([...NativeTokenBalances, ...erc20balances]);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getBalances();
  }, []);

  return {data, error, isLoading};
};
