import type {SupportedNetworks} from 'utils/constants';

export interface IFetchTokenHoldersParams {
  network: SupportedNetworks;
  tokenAddress: string;
}
