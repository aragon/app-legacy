import {SupportedNetworks} from 'utils/constants';

export interface IFetchTokenParams {
  address: string;
  network: SupportedNetworks;
  symbol?: string;
}

export interface IFetchTokenBalancesParams {
  address: string;
  network: SupportedNetworks;
  ignoreZeroBalances?: boolean;
}

export interface IFetchTokenTransfersParams {
  address: string;
  network: SupportedNetworks;
}
