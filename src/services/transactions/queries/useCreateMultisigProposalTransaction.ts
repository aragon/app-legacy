import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {IBuildCreateMultisigProposalTransactionParams} from '../transactionsService.api';
import {transactionsQueryKeys} from '../queryKeys';
import {transactionsService} from '../transactionsService';
import {ITransaction} from '../domain/transaction';

export const useCreateMultisigProposalTransaction = (
  params: IBuildCreateMultisigProposalTransactionParams,
  options?: Omit<UseQueryOptions<ITransaction>, 'queryKey'>
) => {
  return useQuery({
    queryKey: transactionsQueryKeys.createMultisigProposal(params),
    queryFn: () =>
      transactionsService.buildCreateMultisigProposalTransaction(params),
    ...options,
  });
};
