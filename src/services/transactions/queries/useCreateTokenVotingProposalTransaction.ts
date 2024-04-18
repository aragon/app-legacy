import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {IBuildCreateTokenVotingProposalTransactionParams} from '../transactionsService.api';
import {transactionsQueryKeys} from '../queryKeys';
import {transactionsService} from '../transactionsService';
import {ITransaction} from '../domain/transaction';

export const useCreateTokenVotingProposalTransaction = (
  params: IBuildCreateTokenVotingProposalTransactionParams,
  options?: Omit<UseQueryOptions<ITransaction>, 'queryKey'>
) => {
  return useQuery({
    queryKey: transactionsQueryKeys.createTokenVotingProposal(params),
    queryFn: () =>
      transactionsService.buildCreateTokenVotingProposalTransaction(params),
    ...options,
  });
};
