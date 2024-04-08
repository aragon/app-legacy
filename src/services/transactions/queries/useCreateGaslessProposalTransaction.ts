import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {IBuildCreateGaslessProposalTransactionParams} from '../transactionsService.api';
import {transactionsQueryKeys} from '../queryKeys';
import {transactionsService} from '../transactionsService';
import {ITransaction} from '../domain/transaction';

export const useCreateGaslessProposalTransaction = (
  params: IBuildCreateGaslessProposalTransactionParams,
  options: UseQueryOptions<ITransaction> = {}
) => {
  return useQuery(
    transactionsQueryKeys.createGaslessProposal(params),
    () => transactionsService.buildCreateGaslessProposalTransaction(params),
    options
  );
};
