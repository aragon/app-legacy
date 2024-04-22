import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {IBuildExecuteTokenVotingProposalTransactionParams} from '../transactionsService.api';
import {transactionsQueryKeys} from '../queryKeys';
import {transactionsService} from '../transactionsService';
import {ITransaction} from '../domain/transaction';

export const useCreateExecuteTokenVotingProposalTransaction = (
  params: IBuildExecuteTokenVotingProposalTransactionParams,
  options?: Omit<UseQueryOptions<ITransaction>, 'queryKey'>
) => {
  return useQuery({
    queryKey: transactionsQueryKeys.createExecuteTokenVotingProposal(params),
    queryFn: () =>
      transactionsService.buildExecuteTokenVotingProposalTransaction(params),
    ...options,
  });
};
