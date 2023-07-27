import {BASE_URL, CHAIN_METADATA, coingeckoMetadata} from 'utils/constants';
import {isNativeToken} from 'utils/tokens';
import {TOP_ETH_SYMBOL_ADDRESSES} from 'utils/constants/topSymbolAddresses';
import {CoingeckoToken, Token} from './domain';
import {IFetchTokenParams} from './token-service.api';
import {CoingeckoError} from './domain/coingecko-error';

class TokenService {
  /**
   * Fetch token data from external api.
   * @param address Address of the token
   * @param network Network of the token
   * @param symbol Symbol of the token (optional)
   * @returns Basic information about the token or undefined if token data cannot be fetched
   */
  fetchToken = async ({
    address,
    network,
    symbol,
  }: IFetchTokenParams): Promise<Token | null> => {
    // Use token data from ethereum mainnet when trying to fetch a testnet
    // token that is one of the top ERC20 tokens
    const useEthereumMainnet =
      CHAIN_METADATA[network].testnet &&
      symbol != null &&
      TOP_ETH_SYMBOL_ADDRESSES[symbol.toLowerCase()] != null;

    const processedAddress = useEthereumMainnet
      ? TOP_ETH_SYMBOL_ADDRESSES[symbol.toLowerCase()]
      : address;

    const processedNetwork = useEthereumMainnet ? 'ethereum' : network;

    const {networkId, nativeTokenId} =
      coingeckoMetadata[processedNetwork] ?? {};

    if (!networkId || !nativeTokenId) {
      console.error(
        `fetchToken - network ${processedNetwork} not supported by Coingecko`
      );
      return null;
    }

    // build url based on whether token is native token
    const endpoint = isNativeToken(address)
      ? `/coins/${nativeTokenId}`
      : `/coins/${networkId}/contract/${processedAddress}`;

    const url = `${BASE_URL}${endpoint}`;
    const res = await fetch(url);
    const data: CoingeckoToken | CoingeckoError = await res.json();

    if (this.isErrorCoingeckoResponse(data)) {
      console.error(`fetchToken - Coingecko returned error: ${data.error}`);
      return null;
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
