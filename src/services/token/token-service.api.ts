import {SupportedNetworks} from 'utils/constants';

export interface IFetchTokenParams {
  address: string;
  network: SupportedNetworks;
  symbol?: string;
}
