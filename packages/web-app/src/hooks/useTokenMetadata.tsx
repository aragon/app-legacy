import {useApolloClient} from '@apollo/client';
import {AssetBalance, TokenType} from '@aragon/sdk-client';
import {constants} from 'ethers';
import {useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
import {fetchTokenData} from 'services/prices';
import {CHAIN_METADATA} from 'utils/constants';
import {HookData, TokenWithMetadata} from 'utils/types';

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

        // TODO fix cases below for ERC721

        // fetch token metadata from external api
        const metadata = await Promise.all(
          assets?.map(asset => {
            return fetchTokenData(
              asset.type !== TokenType.NATIVE
                ? asset.address
                : constants.AddressZero,
              client,
              network,
              asset.type !== TokenType.NATIVE ? asset.symbol : undefined
            );
          })
        );

        // map metadata to token balances
        const tokensWithMetadata = assets?.map((asset, index) => ({
          balance: asset.type !== TokenType.ERC721 ? asset.balance : BigInt(0),
          metadata: {
            ...(asset.type === TokenType.ERC20
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
