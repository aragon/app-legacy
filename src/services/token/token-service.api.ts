import {SupportedNetworks} from 'utils/constants';

export interface IFetchTokenMarketDataParams {
  tokenIds: string[];
}

export interface IFetchTokenParams {
  address: string;
  network: SupportedNetworks;
  symbol?: string;
}
