export type TokenItemType = {
  balance: string;
  contractAddress: string;
  contractDecimals: number;
  contractName: string;
  contractTickerSymbol: string;
  logoUrl: string;
  nativeToken: boolean;
};

export type TokenBalanceResponse = {
  updated_at: string;
  items: Array<TokenItemType>;
};
