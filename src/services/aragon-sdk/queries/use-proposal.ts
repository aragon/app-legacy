import {
  MultisigClient,
  MultisigProposal,
  TokenVotingClient,
  TokenVotingProposal,
} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';

import {usePluginClient} from 'hooks/usePluginClient';
import {invariant} from 'utils/invariant';
import {recalculateStatus} from 'utils/proposals';
import {IFetchProposalParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';

async function fetchProposalAsync(
  params: IFetchProposalParams,
  client: TokenVotingClient | MultisigClient | undefined
): Promise<MultisigProposal | TokenVotingProposal | null> {
  invariant(!!client, 'fetchProposalAsync: client is not defined');

  const data = await client?.methods.getProposal(params.id);
  return data;
}

export const useProposal = (
  params: IFetchProposalParams,
  options: UseQueryOptions<MultisigProposal | TokenVotingProposal | null> = {}
) => {
  const client = usePluginClient(params.pluginType);

  if (!client || !params.id || !params.pluginType) {
    options.enabled = false;
  }

  return useQuery({
    queryKey: aragonSdkQueryKeys.proposal(params),
    queryFn: () => fetchProposalAsync(params, client),
    select: transformData,
    ...options,
  });
};

function transformData<T extends MultisigProposal | TokenVotingProposal | null>(
  data: T
): T {
  return {...recalculateStatus(data)} as T;
}
