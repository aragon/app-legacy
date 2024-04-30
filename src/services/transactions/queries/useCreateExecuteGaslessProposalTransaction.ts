import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {IBuildExecuteGaslessProposalTransactionParams} from '../transactionsService.api';
import {transactionsQueryKeys} from '../queryKeys';
import {transactionsService} from '../transactionsService';
import {ITransaction} from '../domain/transaction';

export const useCreateExecuteGaslessProposalTransaction = (
  params: IBuildExecuteGaslessProposalTransactionParams,
  options?: Omit<UseQueryOptions<ITransaction>, 'queryKey'>
) => {
  return useQuery({
    queryKey: transactionsQueryKeys.createExecuteGaslessProposal(params),
    queryFn: () =>
      transactionsService.buildExecuteGaslessProposalTransaction(params),
    ...options,
  });
};
