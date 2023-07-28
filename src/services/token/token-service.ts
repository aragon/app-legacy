import {
  CHAIN_METADATA,
  SupportedNetworks,
  coingeckoMetadata,
} from 'utils/constants';
import {isNativeToken} from 'utils/tokens';
import {TOP_ETH_SYMBOL_ADDRESSES} from 'utils/constants/topSymbolAddresses';
import {CoingeckoToken, Token, CoingeckoError} from './domain';
import {IFetchTokenParams} from './token-service.api';

class TokenService {
  private baseUrl = {
    coingecko: 'https://api.coingecko.com/api/v3',
    covalent: 'https://api.covalenthq.com/v1',
  };

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

    const processedNetwork = useEthereumMainnet ? 'ethereum' : network;
    const processedAddress = useEthereumMainnet
      ? TOP_ETH_SYMBOL_ADDRESSES[symbol.toLowerCase()]
      : address;

    const token = this.fetchCoingeckoToken(processedNetwork, processedAddress);

    return token;
  };

  private fetchCovalentToken = async (
    network: SupportedNetworks,
    address: string
  ): Promise<Token | null> => {
    // TODO

    return {} as Token;
  };

  private fetchCoingeckoToken = async (
    network: SupportedNetworks,
    address: string
  ): Promise<Token | null> => {
    const {networkId, nativeTokenId} = coingeckoMetadata[network] ?? {};

    if (!networkId || !nativeTokenId) {
      console.error(
        `fetchToken - network ${network} not supported by Coingecko`
      );
      return null;
    }

    const endpoint = isNativeToken(address)
      ? `/coins/${nativeTokenId}`
      : `/coins/${networkId}/contract/${address}`;

    const url = `${this.baseUrl.coingecko}${endpoint}`;
    const res = await fetch(url);
    const data: CoingeckoToken | CoingeckoError = await res.json();

    if (this.isErrorCoingeckoResponse(data)) {
      console.error(`fetchToken - Coingecko returned error: ${data.error}`);
      return null;
    }

    const {nativeCurrency} = CHAIN_METADATA[network];

    return {
      id: data.id,
      name: isNativeToken(address) ? nativeCurrency.name : data.name,
      symbol: isNativeToken(address)
        ? nativeCurrency.symbol
        : data.symbol.toUpperCase(),
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
