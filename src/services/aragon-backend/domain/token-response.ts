import {SupportedNetworks} from 'utils/constants';

export type NetworkTokensResponse = Record<
  SupportedNetworks,
  NetworkTokenResponse[]
>;
export type NetworkTokenResponse = {
  symbol: string;
  name: string;
  address: string;
};
