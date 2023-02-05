import {useApolloClient} from '@apollo/client';
import {AssetBalance} from '@aragon/sdk-client';
import {constants} from 'ethers';
import {useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
import {fetchTokenData} from 'services/prices';
import {CHAIN_METADATA} from 'utils/constants';
import {HookData, TokenWithMetadata} from 'utils/types';
import { TOP_ETH_SYMBOL_ADDRESSES } from 'utils/constants/topSymbolAddresses';

export const useTokenMetadata = (
  assets: AssetBalance[]
): HookData<TokenWithMetadata[]> => {
  const client = useApolloClient();
  const {network} = useNetwork();
  const [data, setData] = useState<TokenWithMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);

        // fetch token metadata from external api
        const metadata = await Promise.all(
          assets?.map(asset => {
            return fetchTokenData(
              asset.type === 'erc20' ? asset.address : constants.AddressZero,
              client,
              network,
              asset.type === 'erc20' ? asset.symbol : undefined
            );
          })
        );

        // map metadata to token balances
        const tokensWithMetadata = assets?.map((asset, index) => ({
          balance: asset.balance,
          metadata: {
            ...(asset.type === 'erc20'
              ? {
                  id: asset.address,
                  decimals: asset.decimals,
                  name: metadata[index]?.name || asset.name,
                  symbol: metadata[index]?.symbol || asset.symbol,
                }
              : {
                  id: constants.AddressZero,
                  decimals: CHAIN_METADATA[network].nativeCurrency.decimals,
                  name:
                    metadata[index]?.name ||
                    CHAIN_METADATA[network].nativeCurrency.name,
                  symbol:
                    metadata[index]?.symbol ||
                    CHAIN_METADATA[network].nativeCurrency.symbol,
                }),

            price: metadata[index]?.price,
            apiId: metadata[index]?.id,
            imgUrl: metadata[index]?.imgUrl || '',
          },
        }));

        setData(tokensWithMetadata);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    if (assets) fetchMetadata();
  }, [assets, network, client]);

  return {data, isLoading: loading, error};
};
