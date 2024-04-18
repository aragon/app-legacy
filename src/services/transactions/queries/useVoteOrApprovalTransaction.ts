import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {IBuildVoteOrApprovalTransactionParams} from '../transactionsService.api';
import {transactionsQueryKeys} from '../queryKeys';
import {transactionsService} from '../transactionsService';
import {ITransaction} from '../domain/transaction';

export const useVoteOrApprovalTransaction = (
  params: IBuildVoteOrApprovalTransactionParams,
  options?: Omit<UseQueryOptions<ITransaction>, 'queryKey'>
) => {
  return useQuery({
    queryKey: transactionsQueryKeys.voteOrApproval(params),
    queryFn: () => transactionsService.buildVoteOrApprovalTransaction(params),
    ...options,
  });
};
