import {
  MultisigClient,
  MultisigProposal,
  TokenVotingClient,
  TokenVotingProposal,
} from '@aragon/sdk-client';

import {invariant} from 'utils/invariant';
import {IFetchProposalParams} from '../aragon-sdk-service.api';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {usePluginClient} from 'hooks/usePluginClient';
import {aragonSdkQueryKeys} from '../query-keys';

async function fetchProposalAsync(
  params: IFetchProposalParams,
  client: TokenVotingClient | MultisigClient | undefined
): Promise<MultisigProposal | TokenVotingProposal | null | undefined> {
  invariant(!!client, 'fetchProposalAsync: client is not defined');

  const data = await client?.methods.getProposal(params.id);
  return data;
}

export const useProposal = (
  params: IFetchProposalParams,
  options: UseQueryOptions<
    MultisigProposal | TokenVotingProposal | null | undefined
  > = {}
) => {
  const client = usePluginClient(params.pluginType);

  if (!client || !params.id || !params.pluginType) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.proposal(params),
    () => fetchProposalAsync(params, client),
    options
  );
};
