export type CoingeckoTokenData = {
  id: string;
  name: string;
  symbol: string;
  image: {
    large: string;
    small: string;
    thumb: string;
  };
  market_data: {
    current_price: {
      usd: number;
    };
  };
};
