import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {IBuildCreateMultisigProposalTransactionParams} from '../transactionsService.api';
import {transactionsQueryKeys} from '../queryKeys';
import {transactionsService} from '../transactionsService';
import {ITransaction} from '../domain/transaction';

export const useCreateMultisigProposalTransaction = (
  params: IBuildCreateMultisigProposalTransactionParams,
  options: UseQueryOptions<ITransaction> = {}
) => {
  return useQuery(
    transactionsQueryKeys.createMultisigProposal(params),
    () => transactionsService.buildCreateMultisigProposalTransaction(params),
    options
  );
};
