import {
  coingeckoPlatforms,
  BASE_URL,
  CHAIN_METADATA,
  DEFAULT_CURRENCY,
  coingeckoNativeTokenId,
  SupportedNetworks,
} from 'utils/constants';
import {isNativeToken} from 'utils/tokens';
import {TOP_ETH_SYMBOL_ADDRESSES} from 'utils/constants/topSymbolAddresses';
import {
  CoingeckoToken,
  Token,
  CoingeckoTokenPrice,
  TokenPrices,
} from './domain';
import {
  IFetchTokenParams,
  IFetchTokenMarketDataParams,
} from './token-service.api';
import {CoingeckoError} from './domain/coingecko-error';

class TokenService {
  /**
   * Returns token USD value along with price changes for 1 day, 1 week, 1 month, 1 year
   * @param id Coingecko id or a list of comma separated ids for multiple tokens
   */
  fetchTokenMarketData = async ({
    tokenIds,
  }: IFetchTokenMarketDataParams): Promise<TokenPrices> => {
    const endPoint = '/coins/markets';
    const url = `${BASE_URL}${endPoint}?vs_currency=${DEFAULT_CURRENCY}&ids=${tokenIds}&price_change_percentage=24h%2C7d%2C30d%2C1y`;

    const response = await fetch(url);
    const data: CoingeckoTokenPrice[] = await response.json();
    const tokenPrices = data.reduce(
      (current, token) => ({
        ...current,
        [token.id]: {
          price: token.current_price,
          percentages: {
            day: token.price_change_percentage_24h_in_currency,
            week: token.price_change_percentage_7d_in_currency,
            month: token.price_change_percentage_30d_in_currency,
            year: token.price_change_percentage_1y_in_currency,
          },
        },
      }),
      {}
    );

    return tokenPrices;
  };

  /**
   * fetch token data from external api.
   * @param address Address of the token
   * @param network Network of the token
   * @returns Basic information about the token or undefined if token data cannot be fetched
   */
  fetchToken = async ({
    address,
    network,
    symbol,
  }: IFetchTokenParams): Promise<Token> => {
    // Use mainnet token network and address for top ERC20 tokens
    const useMainnet =
      !isNativeToken(address) &&
      symbol &&
      ['goerli', 'mumbai'].includes(network) &&
      TOP_ETH_SYMBOL_ADDRESSES[symbol.toLowerCase()];

    const fetchAddress = useMainnet
      ? TOP_ETH_SYMBOL_ADDRESSES[symbol.toLowerCase()]
      : address;
    const fetchNetwork = useMainnet ? 'ethereum' : network;

    // network unsupported, or testnet
    const platformId = coingeckoPlatforms[fetchNetwork];
    if (!platformId && !isNativeToken(address)) {
      throw Error(
        `fetchToken - network ${fetchNetwork} not supported by Coingecko`
      );
    }

    // build url based on whether token is native token
    const endpoint = isNativeToken(address)
      ? `/coins/${this.getNativeTokenId(fetchNetwork)}`
      : `/coins/${platformId}/contract/${fetchAddress}`;

    const url = `${BASE_URL}${endpoint}`;

    const res = await fetch(url);
    const data: CoingeckoToken | CoingeckoError = await res.json();

    if (this.isErrorCoingeckoResponse(data)) {
      throw Error(`fetchToken - Coingecko returned error: ${data.error}`);
    }

    return {
      id: data.id,
      ...(isNativeToken(address)
        ? CHAIN_METADATA[network].nativeCurrency
        : {
            name: data.name,
            symbol: data.symbol.toUpperCase(),
          }),

      imgUrl: data.image.large,
      address: address,
      price: data.market_data.current_price.usd,
      priceChange: {
        day: data.market_data.price_change_percentage_24h_in_currency.usd,
        week: data.market_data.price_change_percentage_7d_in_currency.usd,
        month: data.market_data.price_change_percentage_30d_in_currency.usd,
        year: data.market_data.price_change_percentage_1y_in_currency.usd,
      },
    };
  };

  /**
   * Get the native token ID for a given platform and network
   * @param network Network of the token
   * @returns The native token ID
   */
  private getNativeTokenId = (network: SupportedNetworks): string => {
    if (network === 'polygon' || network === 'mumbai') {
      return coingeckoNativeTokenId.polygon;
    }

    return coingeckoNativeTokenId.default;
  };

  /**
   * Checks if the given object is a Coingecko error object.
   * @param data Result from a Coingecko API request
   * @returns true if the object is an error object, false otherwise
   */
  private isErrorCoingeckoResponse = <TData extends object>(
    data: TData | CoingeckoError
  ): data is CoingeckoError => {
    return Object.hasOwn(data, 'error');
  };
}

export const tokenService = new TokenService();
