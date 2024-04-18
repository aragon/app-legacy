import type {QueryKey} from '@tanstack/query-core';

import type {
  IBuildCreateDaoTransactionParams,
  IBuildExecuteMultisigProposalTransactionParams,
  IBuildExecuteTokenVotingProposalTransactionParams,
  IBuildCreateGaslessProposalTransactionParams,
  IBuildCreateMultisigProposalTransactionParams,
  IBuildCreateTokenVotingProposalTransactionParams,
} from './transactionsService.api';

export enum TransactionsQueryItem {
  CREATE_DAO = 'CREATE_DAO',
  CREATE_EXECUTE_MULTISIG_PROPOSAL = 'CREATE_EXECUTE_MULTISIG_PROPOSAL',
  CREATE_EXECUTE_TOKEN_VOTING_PROPOSAL = 'CREATE_EXECUTE_TOKEN_VOTING_PROPOSAL',
  CREATE_MULTISIG_PROPOSAL = 'CREATE_MULTISIG_PROPOSAL',
  CREATE_TOKEN_VOTING_PROPOSAL = 'CREATE_TOKEN_VOTING_PROPOSAL',
  CREATE_GASLESS_PROPOSAL = 'CREATE_GASLESS_PROPOSAL',
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
