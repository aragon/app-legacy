export type TokenItemType = {
  balance: string;
  contractAddress: string;
  contractDecimals: number;
  contractName: string;
  contractTickerSymbol: string;
  logoUrl: string;
  native_token: boolean;
};

export type TokenBalanceResponse = {
  updated_at: string;
  items: Array<TokenItemType>;
};
