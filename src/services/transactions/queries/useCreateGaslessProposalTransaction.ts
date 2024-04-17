import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {IBuildCreateGaslessProposalTransactionParams} from '../transactionsService.api';
import {transactionsQueryKeys} from '../queryKeys';
import {transactionsService} from '../transactionsService';
import {ITransaction} from '../domain/transaction';

export const useCreateGaslessProposalTransaction = (
  params: IBuildCreateGaslessProposalTransactionParams,
  options?: Omit<UseQueryOptions<ITransaction>, 'queryKey'>
) => {
  return useQuery({
    queryKey: transactionsQueryKeys.createGaslessProposal(params),
    queryFn: () =>
      transactionsService.buildCreateGaslessProposalTransaction(params),
    ...options,
  });
};
