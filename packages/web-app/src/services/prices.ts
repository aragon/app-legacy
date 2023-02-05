import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {ApolloClient} from '@apollo/client';

import {
  ASSET_PLATFORMS,
  BASE_URL,
  CHAIN_METADATA,
  DEFAULT_CURRENCY,
  NATIVE_TOKEN_ID,
  SupportedNetworks,
  TimeFilter,
} from 'utils/constants';
import {TOKEN_DATA_QUERY} from 'queries/coingecko/tokenData';
import {isNativeToken} from 'utils/tokens';
import { TOP_ETH_SYMBOL_ADDRESSES } from 'utils/constants/topSymbolAddresses';

export type TokenPrices = {
  [key: string]: {
    price: number;
    percentages: {
      [key in TimeFilter]: number;
    };
  };
};

type APITokenPrice = {
  id: string;
  current_price: number;
  price_change_percentage_24h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  price_change_percentage_1y_in_currency: number;
};

type FetchedTokenMarketData = Promise<TokenPrices | undefined>;

/**
 * Return token USD value along with price changes for 1 day, 1 week, 1 month, 1 year
 *
 * NOTE: Currently **not** fetching maximum data
 *
 * @param id Coingecko id **or** a list of comma separated ids for multiple tokens
 */
async function fetchTokenMarketData(id: string): FetchedTokenMarketData {
  if (!id) return;
  // Note: Does NOT fetch chart data
  // TODO: fetch MAX
  const endPoint = '/coins/markets';
  const url = `${BASE_URL}${endPoint}?vs_currency=${DEFAULT_CURRENCY}&ids=${id}&price_change_percentage=24h%2C7d%2C30d%2C1y`;

  try {
    const res = await fetch(url);
    const parsedResponse: APITokenPrice[] = await res.json();
    const data: TokenPrices = {};

    parsedResponse.forEach(token => {
      data[token.id] = {
        price: token.current_price,
        percentages: {
          day: token.price_change_percentage_24h_in_currency,
          week: token.price_change_percentage_7d_in_currency,
          month: token.price_change_percentage_30d_in_currency,
          year: token.price_change_percentage_1y_in_currency,
        },
      };
    });

    return data;
  } catch (error) {
    console.error('Error fetching token price', error);
  }
}

type TokenData = {
  id: string;
  name: string;
  symbol: string;
  imgUrl: string;
  address: Address;
  price: number;
};

/**
 * Get token data from external api. Ideally, this data should be cached so that
 * the id property can be used when querying for prices.
 * @param address Token contract address
 * @param client Apollo Client instance
 * @param network network name
 * @returns Basic information about the token or undefined if data could not be fetched
 */
async function fetchTokenData(
  address: Address,
  client: ApolloClient<object>,
  network: SupportedNetworks,
  symbol?: string
): Promise<TokenData | undefined> {
  // check if token address is address zero, ie, native token of platform
  const nativeToken = isNativeToken(address);
  let fetchAddress = address;
  let fetchNetwork = network;

  // override test network ERC20 with mainnet token address for top tokens
  if (!nativeToken && symbol
      && network === 'goerli'
      && TOP_ETH_SYMBOL_ADDRESSES[symbol.toLowerCase()]) {
    fetchAddress = TOP_ETH_SYMBOL_ADDRESSES[symbol.toLowerCase()];
    fetchNetwork = 'ethereum';
  }

  // network unsupported, or testnet
  const platformId = ASSET_PLATFORMS[fetchNetwork];
  if (!platformId && !nativeToken) return;

  // build url based on whether token is native token
  const url = nativeToken
    ? `/coins/${getNativeTokenId(fetchNetwork)}`
    : `/coins/${platformId}/contract/${fetchAddress}`;

  const {data, error} = await client.query({
    query: TOKEN_DATA_QUERY,
    variables: {url},
  });

  if (!error && data.tokenData) {
    return {
      id: data.tokenData.id,
      ...(nativeToken
        ? CHAIN_METADATA[network].nativeCurrency
        : {
            name: data.tokenData.name,
            symbol: data.tokenData.symbol.toUpperCase(),
          }),

      imgUrl: data.tokenData.image.large,
      address: address,
      price: data.tokenData.market_data.current_price.usd,
    };
  }

  console.error('Error fetching token data', error);
}

/**
 * Get simple token price
 * @param address Token contract address
 * @param network network name
 * @returns a USD price as a number
 */
async function fetchTokenPrice(
  address: Address,
  network: SupportedNetworks
): Promise<number | undefined> {
  // check if token address is address zero, ie, native token of platform
  const nativeToken = isNativeToken(address);

  // network unsupported, or testnet
  const platformId = ASSET_PLATFORMS[network];
  if (!platformId && !nativeToken) return;

  // build url based on whether token is ethereum
  const endPoint = `/simple/token_price/${platformId}?vs_currencies=usd&contract_addresses=`;
  const url = nativeToken
    ? `${BASE_URL}/simple/price?ids=${getNativeTokenId(
        network
      )}&vs_currencies=usd`
    : `${BASE_URL}${endPoint}${address}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    return Object.values(data as object)[0]?.usd as number;
  } catch (error) {
    console.error('Error fetching token price', error);
  }
}

/**
 * Get native token id for a given platform and network
 *
 * Note: Currently, we are allowing the native token of test networks
 * to be priced.
 * @param platformId platform id
 * @param network network name
 * @returns native token id
 */
function getNativeTokenId(network: SupportedNetworks): string {
  if (network === 'polygon' || network === 'mumbai') {
    return NATIVE_TOKEN_ID.polygon;
  }

  return NATIVE_TOKEN_ID.default;
}
export {fetchTokenMarketData, fetchTokenData, fetchTokenPrice};
