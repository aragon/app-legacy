import type {SupportedNetworks} from 'utils/constants';
import type {IOrderedRequest} from './domain/ordered-request';
import {IPaginatedRequest} from './domain/paginated-request';
import {OrderByValue} from 'containers/daoFilterModal/data';

export interface IFetchTokenHoldersParams {
  network: SupportedNetworks;
  tokenAddress: string;
  page?: number;
}

export interface IFetchDaosParams
  extends IOrderedRequest<OrderByValue>,
    IPaginatedRequest {
  pluginNames?: string[];
  // TODO: Remove this Goerli based network conditions
  networks?: Array<SupportedNetworks | 'arbitrumGoerli' | 'baseGoerli'>;
}
