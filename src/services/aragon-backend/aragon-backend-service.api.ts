import type {SupportedNetworks} from 'utils/constants';
import type {IOrderedRequest} from './domain/ordered-request';
import {IPaginatedRequest} from './domain/paginated-request';
import {SortByValue} from 'containers/daoFilterModal/data';

export interface IFetchTokenHoldersParams {
  network: SupportedNetworks;
  tokenAddress: string;
  page?: number;
}

export interface IFetchDaosParams
  extends IOrderedRequest<SortByValue>,
    IPaginatedRequest {
  pluginNames?: string[];
  networks?: SupportedNetworks[];
}
