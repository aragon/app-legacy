import type {QueryKey} from '@tanstack/query-core';

import type {
  IBuildCreateDaoTransactionParams,
  IBuildVoteOrApprovalTransactionParams,
} from './transactionsService.api';

export enum TransactionsQueryItem {
  CREATE_DAO = 'CREATE_DAO',
  VOTE_OR_APPROVAL = 'VOTE_OR_APPROVAL',
}

export const transactionsQueryKeys = {
  createDao: (params: IBuildCreateDaoTransactionParams): QueryKey => [
    TransactionsQueryItem.CREATE_DAO,
    params,
  ],
  VoteOrApproval: (params: IBuildVoteOrApprovalTransactionParams): QueryKey => [
    TransactionsQueryItem.VOTE_OR_APPROVAL,
    params,
  ],
};
