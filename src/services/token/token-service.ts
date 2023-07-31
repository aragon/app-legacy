import {
  CHAIN_METADATA,
  COVALENT_API_KEY,
  SupportedNetworks,
} from 'utils/constants';
import {isNativeToken} from 'utils/tokens';
import {TOP_ETH_SYMBOL_ADDRESSES} from 'utils/constants/topSymbolAddresses';
import {CoingeckoToken, Token, CoingeckoError} from './domain';
import {IFetchTokenParams} from './token-service.api';
import {CovalentToken} from './domain/covalent-token';
import {CovalentResponse} from './domain/covalent-response';

class TokenService {
  private defaultCurrency = 'USD';
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
      CHAIN_METADATA[network].isTestnet &&
      symbol != null &&
      TOP_ETH_SYMBOL_ADDRESSES[symbol.toLowerCase()] != null;

    // Fetch the price from the mainnet when network is a testnet for native tokens
    const useNativeMainnet =
      CHAIN_METADATA[network].isTestnet && isNativeToken(address);

    const processedNetwork = useEthereumMainnet
      ? 'ethereum'
      : useNativeMainnet
      ? CHAIN_METADATA[network].mainnet!
      : network;
    const processedAddress = useEthereumMainnet
      ? TOP_ETH_SYMBOL_ADDRESSES[symbol.toLowerCase()]
      : address;

    const token =
      processedNetwork === 'base' || processedNetwork === 'base-goerli'
        ? this.fetchCovalentToken(processedNetwork, processedAddress)
        : this.fetchCoingeckoToken(processedNetwork, processedAddress);

    return token;
  };

  private fetchCovalentToken = async (
    network: SupportedNetworks,
    address: string
  ): Promise<Token | null> => {
    const {networkId, nativeTokenId} = CHAIN_METADATA[network].covalent ?? {};
    const {nativeCurrency} = CHAIN_METADATA[network];
    const isNative = isNativeToken(address);

    if (!networkId || !nativeTokenId) {
      console.info(`fetchToken - network ${network} not supported by Covalent`);
      return null;
    }

    const processedAddress = isNative ? nativeTokenId : address;
    const endpoint = `/pricing/historical_by_addresses_v2/${networkId}/${this.defaultCurrency}/${processedAddress}/`;

    const url = `${this.baseUrl.covalent}${endpoint}`;
    const authToken = window.btoa(`${COVALENT_API_KEY}:`);
    const headers = {Authorization: `Basic ${authToken}`};

    const res = await fetch(url, {headers});
    const parsed: CovalentResponse<CovalentToken[] | null> = await res.json();
    const data = parsed.data?.[0];

    if (parsed.error || data == null) {
      console.info(
        `fetchToken - Covalent returned error: ${parsed.error_message}`
      );
      return null;
    }

    return {
      id: address,
      name: isNative ? nativeCurrency.name : data.contract_name,
      symbol: isNative
        ? nativeCurrency.symbol
        : data.contract_ticker_symbol.toUpperCase(),
      imgUrl: data.logo_url,
      address: address,
      price: data.prices[0].price,
      priceChange: {
        day: 0,
        week: 0,
        month: 0,
        year: 0,
      },
    };
  };

  private fetchCoingeckoToken = async (
    network: SupportedNetworks,
    address: string
  ): Promise<Token | null> => {
    const {networkId, nativeTokenId} = CHAIN_METADATA[network].coingecko ?? {};
    const {nativeCurrency} = CHAIN_METADATA[network];
    const isNative = isNativeToken(address);

    if (!networkId || !nativeTokenId) {
      console.info(
        `fetchToken - network ${network} not supported by Coingecko`
      );
      return null;
    }

    const endpoint = isNative
      ? `/coins/${nativeTokenId}`
      : `/coins/${networkId}/contract/${address}`;
    const url = `${this.baseUrl.coingecko}${endpoint}`;

    const res = await fetch(url);
    const data: CoingeckoToken | CoingeckoError = await res.json();

    if (this.isErrorCoingeckoResponse(data)) {
      console.info(`fetchToken - Coingecko returned error: ${data.error}`);
      return null;
    }

    return {
      id: data.id,
      name: isNative ? nativeCurrency.name : data.name,
      symbol: isNative ? nativeCurrency.symbol : data.symbol.toUpperCase(),
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
