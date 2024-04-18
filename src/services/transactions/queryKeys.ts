import type {QueryKey} from '@tanstack/query-core';

import type {
  IBuildCreateDaoTransactionParams,
  IBuildCreateGaslessProposalTransactionParams,
  IBuildCreateMultisigProposalTransactionParams,
  IBuildCreateTokenVotingProposalTransactionParams,
} from './transactionsService.api';

export enum TransactionsQueryItem {
  CREATE_DAO = 'CREATE_DAO',
  CREATE_MULTISIG_PROPOSAL = 'CREATE_MULTISIG_PROPOSAL',
  CREATE_TOKEN_VOTING_PROPOSAL = 'CREATE_TOKEN_VOTING_PROPOSAL',
  CREATE_GASLESS_PROPOSAL = 'CREATE_GASLESS_PROPOSAL',
}

export const transactionsQueryKeys = {
  createDao: (params: IBuildCreateDaoTransactionParams): QueryKey => [
    TransactionsQueryItem.CREATE_DAO,
    params,
  ],
  createMultisigProposal: (
    params: IBuildCreateMultisigProposalTransactionParams
  ): QueryKey => [TransactionsQueryItem.CREATE_MULTISIG_PROPOSAL, params],
  createTokenVotingProposal: (
    params: IBuildCreateTokenVotingProposalTransactionParams
  ): QueryKey => [TransactionsQueryItem.CREATE_TOKEN_VOTING_PROPOSAL, params],
  createGaslessProposal: (
    params: IBuildCreateGaslessProposalTransactionParams
  ): QueryKey => [TransactionsQueryItem.CREATE_GASLESS_PROPOSAL, params],
};
