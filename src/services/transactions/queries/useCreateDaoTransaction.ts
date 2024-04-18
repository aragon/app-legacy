import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {IBuildCreateDaoTransactionParams} from '../transactionsService.api';
import {transactionsQueryKeys} from '../queryKeys';
import {transactionsService} from '../transactionsService';
import {ITransaction} from '../domain/transaction';

export const useCreateDaoTransaction = (
  params: IBuildCreateDaoTransactionParams,
  options: Omit<UseQueryOptions<ITransaction>, 'queryKey'>
) => {
  return useQuery({
    queryKey: transactionsQueryKeys.createDao(params),
    queryFn: () => transactionsService.buildCreateDaoTransaction(params),
    ...options,
  });
};
