import type {SupportedNetworks} from 'utils/constants';
import type {IOrderedRequest} from './domain/ordered-request';
import {IPaginatedRequest} from './domain/paginated-request';

export interface IFetchTokenHoldersParams {
  network: SupportedNetworks;
  tokenAddress: string;
  page?: number;
}

export interface IFetchDaosParams
  extends IOrderedRequest<'CREATED_AT' | 'TVL' | 'MEMBERS' | 'PROPOSALS'>,
    IPaginatedRequest {
  governanceId?: string;
  networks?: SupportedNetworks[];
  memberAddress?: string;
}
