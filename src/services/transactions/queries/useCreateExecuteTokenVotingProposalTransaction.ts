import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {IBuildExecuteTokenVotingProposalTransactionParams} from '../transactionsService.api';
import {transactionsQueryKeys} from '../queryKeys';
import {transactionsService} from '../transactionsService';
import {ITransaction} from '../domain/transaction';

export const useCreateExecuteTokenVotingProposalTransaction = (
  params: IBuildExecuteTokenVotingProposalTransactionParams,
  options: UseQueryOptions<ITransaction> = {}
) => {
  return useQuery(
    transactionsQueryKeys.createExecuteTokenVotingProposal(params),
    () =>
      transactionsService.buildExecuteTokenVotingProposalTransaction(params),
    options
  );
};
