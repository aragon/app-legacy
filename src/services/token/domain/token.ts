import {TokenPriceChange} from './token-price-change';

export type Token = {
  id: string;
  name: string;
  symbol: string;
  imgUrl: string;
  address: string;
  price: number;
  priceChange: TokenPriceChange;
};
