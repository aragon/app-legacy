export type CovalentToken = {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  logo_url: string;
  prices: CovalentTokenPrice[];
};

export type CovalentTokenPrice = {
  date: string;
  price: number;
};
