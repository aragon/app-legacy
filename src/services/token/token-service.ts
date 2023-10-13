import {AssetBalance, Deposit, TransferType} from '@aragon/sdk-client';
import {TokenType} from '@aragon/sdk-client-common';
import {AddressZero} from '@ethersproject/constants';
import {BigNumber} from 'ethers';

import {getAlchemyProvider} from 'context/providers';
import {
  CHAIN_METADATA,
  COVALENT_API_KEY,
  SupportedNetworks,
  alchemyApiKeys,
} from 'utils/constants';
import {TOP_ETH_SYMBOL_ADDRESSES} from 'utils/constants/topSymbolAddresses';
import {getTokenInfo, isNativeToken} from 'utils/tokens';
import {CoingeckoError, CoingeckoToken, Token} from './domain';
import {CovalentResponse} from './domain/covalent-response';
import {CovalentToken, CovalentTokenBalance} from './domain/covalent-token';
import {
  IFetchTokenBalancesParams,
  IFetchTokenParams,
  IFetchTokenTransfersParams,
} from './token-service.api';
import {AlchemyTransfer} from './domain/alchemy-transfer';
import {
  CovalentTokenTransfer,
  CovalentTransferInfo,
} from './domain/covalent-transfer';

const REPLACEMENT_BASE_ETHER_LOGO_URL =
  'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880';

type tokenType = TokenType.NATIVE | TokenType.ERC20;

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
        : data.contract_ticker_symbol?.toUpperCase(),
      imgUrl:
        // Please replace once the Covalent API decides to be reasonable
        isNative && (network === 'base' || network === 'base-goerli')
          ? REPLACEMENT_BASE_ETHER_LOGO_URL
          : data.logo_url,
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
      symbol: isNative ? nativeCurrency.symbol : data.symbol?.toUpperCase(),
      imgUrl: data.image?.large,
      address: address,
      price: data.market_data?.current_price.usd,
      priceChange: {
        day: data.market_data?.price_change_percentage_24h_in_currency?.usd,
        week: data.market_data?.price_change_percentage_7d_in_currency?.usd,
        month: data.market_data?.price_change_percentage_30d_in_currency?.usd,
        year: data.market_data?.price_change_percentage_1y_in_currency?.usd,
      },
    };
  };

  // Note: Purposefully not including a function to fetch token balances
  // via Alchemy because we want to slowly remove the Alchemy dependency
  // F.F. [01/01/2023]
  fetchTokenBalances = async ({
    address,
    network,
    ignoreZeroBalances = true,
  }: IFetchTokenBalancesParams): Promise<AssetBalance[] | null> => {
    const {networkId} = CHAIN_METADATA[network].covalent ?? {};

    if (!networkId) {
      console.info(
        `fetchTokenBalances - network ${network} not supported by Covalent`
      );
      return null;
    }

    const {nativeCurrency} = CHAIN_METADATA[network];

    const endpoint = `/${networkId}/address/${address}/balances_v2/?quote-currency=${this.defaultCurrency}`;
    const url = `${this.baseUrl.covalent}${endpoint}`;
    const authToken = window.btoa(`${COVALENT_API_KEY}:`);
    const headers = {Authorization: `Basic ${authToken}`};

    const res = await fetch(url, {headers});
    const parsed: CovalentResponse<CovalentTokenBalance | null> =
      await res.json();
    const data = parsed.data;

    if (parsed.error || data == null) {
      console.info(
        `fetchTokenBalances - Covalent returned error: ${parsed.error_message}`
      );
      return null;
    }

    return data.items.flatMap(({native_token, ...item}) => {
      // ignore zero balances if indicated
      if (ignoreZeroBalances && BigNumber.from(item.balance).isZero())
        return [];

      return {
        id: native_token ? AddressZero : item.contract_address,
        address: native_token ? AddressZero : item.contract_address,
        name: native_token ? nativeCurrency.name : item.contract_name,
        symbol: native_token
          ? nativeCurrency.symbol
          : item.contract_ticker_symbol?.toUpperCase(),
        decimals: native_token
          ? nativeCurrency.decimals
          : item.contract_decimals,
        type: (native_token
          ? TokenType.NATIVE
          : item.nft_data
          ? TokenType.ERC721
          : TokenType.ERC20) as tokenType,
        balance: BigInt(item.balance),
        updateDate: new Date(data.updated_at),
      };
    });
  };

  fetchErc20Deposits = async ({
    address,
    network,
    assets,
  }: IFetchTokenTransfersParams) => {
    return network === 'base' || network === 'base-goerli'
      ? this.fetchCovalentErc20Deposits(address, network, assets)
      : this.fetchAlchemyErc20Deposits(address, network);
  };

  private fetchCovalentErc20Deposits = async (
    address: string,
    network: SupportedNetworks,
    assets: AssetBalance[]
  ): Promise<Deposit[] | null> => {
    const {networkId} = CHAIN_METADATA[network].covalent ?? {};

    // check if network is supported
    if (!networkId) {
      console.info(
        `fetchCovalentErc20Deposits - network ${network} not supported by Covalent`
      );
      return null;
    }
    // fetch all balances
    if (!assets || assets.length === 0) {
      return [];
    }

    // fetch all transfers for the previously fetched assets
    const authToken = window.btoa(`${COVALENT_API_KEY}:`);
    const headers = {Authorization: `Basic ${authToken}`};

    const assetTransfers = await Promise.all(
      assets
        // filter out the native deposit
        .filter(asset => asset.type !== TokenType.NATIVE)
        .map(async asset => {
          // this cast is necessary because filtering native tokens first
          // means we only have tokens with actual addresses left.
          const tokenAddress = (asset as AssetBalance & {address: string})
            .address;

          // fetch and parse transfers
          const endpoint = `/${networkId}/address/${address}/transfers_v2/?contract-address=${tokenAddress}`;
          const url = `${this.baseUrl.covalent}${endpoint}`;
          const response = await fetch(url, {headers});
          const parsed: CovalentResponse<CovalentTokenTransfer> =
            await response.json();
          return parsed;
        })
    );

    // flatten and transform the deposits
    return assetTransfers
      .flatMap(
        t =>
          t.data?.items.flatMap(
            item =>
              item.transfers?.map(t =>
                this.transformCovalentDeposit(address, t)
              ) ?? []
          ) ?? []
      )
      .filter(Boolean) as Deposit[];
  };

  private fetchAlchemyErc20Deposits = async (
    walletAddress: string,
    network: SupportedNetworks
  ): Promise<Deposit[] | null> => {
    const apiKey = alchemyApiKeys[network];

    if (!apiKey) return null;

    const url = `${CHAIN_METADATA[network].alchemyApi}/${apiKey}`;
    const options = {
      method: 'POST',
      headers: {accept: 'application/json', 'content-type': 'application/json'},
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromBlock: '0x0',
            toBlock: 'latest',
            toAddress: walletAddress,
            category: ['erc20'],
            withMetadata: true,
            excludeZeroValue: true,
          },
        ],
      }),
    };

    const res = await fetch(url, options);
    const parsed = await res.json();
    const transfers: AlchemyTransfer[] = parsed?.result?.transfers || [];

    return await Promise.all(
      transfers.map(transfer =>
        this.transformAlchemyDeposit(transfer, network, walletAddress)
      )
    );
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

  private transformCovalentDeposit = (
    address: string,
    deposit: CovalentTransferInfo
  ): Deposit | null => {
    if (deposit.transfer_type === 'OUT') {
      return null;
    }

    return {
      type: TransferType.DEPOSIT,
      tokenType: TokenType.ERC20,
      amount: BigInt(deposit.delta),
      creationDate: new Date(deposit.block_signed_at),
      from: deposit.from_address,
      to: address,
      token: {
        address: deposit.contract_address,
        decimals: deposit.contract_decimals,
        name: deposit.contract_name,
        symbol: deposit.contract_ticker_symbol,
      },
      transactionId: deposit.tx_hash,
    };
  };

  private transformAlchemyDeposit = async (
    transfer: AlchemyTransfer,
    network: SupportedNetworks,
    address: string
  ): Promise<
    Deposit & {
      tokenType: TokenType.ERC20;
    }
  > => {
    const {rawContract, metadata, from, hash} = transfer;
    const provider = getAlchemyProvider(network)!;

    // fetch token info
    const {decimals, name, symbol} = await getTokenInfo(
      rawContract.address,
      provider,
      CHAIN_METADATA[network].nativeCurrency
    );

    return {
      type: TransferType.DEPOSIT,
      tokenType: TokenType.ERC20,
      amount: BigInt(rawContract.value),
      creationDate: new Date(metadata.blockTimestamp),
      from,
      to: address,
      token: {
        address: rawContract.address,
        decimals,
        name,
        symbol,
      },
      transactionId: hash,
    };
  };
}

export const tokenService = new TokenService();
