import type {QueryKey} from '@tanstack/query-core';

import type {
  IBuildCreateDaoTransactionParams,
  IBuildExecuteMultisigProposalTransactionParams,
  IBuildExecuteTokenVotingProposalTransactionParams,
} from './transactionsService.api';

export enum TransactionsQueryItem {
  CREATE_DAO = 'CREATE_DAO',
  CREATE_EXECUTE_MULTISIG_PROPOSAL = 'CREATE_EXECUTE_MULTISIG_PROPOSAL',
  CREATE_EXECUTE_TOKEN_VOTING_PROPOSAL = 'CREATE_EXECUTE_TOKEN_VOTING_PROPOSAL',
}

export const transactionsQueryKeys = {
  createDao: (params: IBuildCreateDaoTransactionParams): QueryKey => [
    TransactionsQueryItem.CREATE_DAO,
    params,
  ],
  createExecuteMultisigProposal: (
    params: IBuildExecuteMultisigProposalTransactionParams
  ): QueryKey => [
    TransactionsQueryItem.CREATE_EXECUTE_MULTISIG_PROPOSAL,
    params,
  ],
  createExecuteTokenVotingProposal: (
    params: IBuildExecuteTokenVotingProposalTransactionParams
  ): QueryKey => [
    TransactionsQueryItem.CREATE_EXECUTE_TOKEN_VOTING_PROPOSAL,
    params,
  ],
};
