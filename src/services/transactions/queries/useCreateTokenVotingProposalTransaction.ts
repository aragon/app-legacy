import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {IBuildCreateTokenVotingProposalTransactionParams} from '../transactionsService.api';
import {transactionsQueryKeys} from '../queryKeys';
import {transactionsService} from '../transactionsService';
import {ITransaction} from '../domain/transaction';

export const useCreateTokenVotingProposalTransaction = (
  params: IBuildCreateTokenVotingProposalTransactionParams,
  options: UseQueryOptions<ITransaction> = {}
) => {
  return useQuery(
    transactionsQueryKeys.createTokenVotingProposal(params),
    () => transactionsService.buildCreateTokenVotingProposalTransaction(params),
    options
  );
};
