import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {IBuildExecuteMultisigProposalTransactionParams} from '../transactionsService.api';
import {transactionsQueryKeys} from '../queryKeys';
import {transactionsService} from '../transactionsService';
import {ITransaction} from '../domain/transaction';

export const useCreateExecuteMultisigProposalTransaction = (
  params: IBuildExecuteMultisigProposalTransactionParams,
  options: UseQueryOptions<ITransaction> = {}
) => {
  return useQuery(
    transactionsQueryKeys.createExecuteMultisigProposal(params),
    () => transactionsService.buildExecuteMultisigProposalTransaction(params),
    options
  );
};
