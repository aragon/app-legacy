import {TokenPriceChange} from './token-price-change';

export type Token = {
  name: string;
  symbol: string;
  imgUrl: string;
  address: string;
  price: number;
  priceChange: TokenPriceChange;
  decimals: number;
};
