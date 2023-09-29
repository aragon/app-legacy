import {
  MultisigClient,
  MultisigProposal,
  TokenVotingClient,
  TokenVotingProposal,
} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';

import {useNetwork} from 'context/network';
import {usePluginClient} from 'hooks/usePluginClient';
import {CHAIN_METADATA} from 'utils/constants';
import {invariant} from 'utils/invariant';
import {IFetchProposalParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';
import {transformProposal} from '../selectors';

async function fetchProposal(
  params: IFetchProposalParams,
  client: TokenVotingClient | MultisigClient | undefined
): Promise<MultisigProposal | TokenVotingProposal | null> {
  invariant(!!client, 'fetchProposal: client is not defined');

  const data = await client?.methods.getProposal(params.id);
  return data;
}

export const useProposal = (
  params: IFetchProposalParams,
  options: UseQueryOptions<MultisigProposal | TokenVotingProposal | null> = {}
) => {
  const client = usePluginClient(params.pluginType);

  const {network} = useNetwork();
  const chainId = CHAIN_METADATA[network].id;

  const defaultSelect = (data: TokenVotingProposal | MultisigProposal | null) =>
    transformProposal(chainId, data);

  if (!client || !params.id || !params.pluginType) {
    options.enabled = false;
  }

  return useQuery({
    ...options,
    queryKey: aragonSdkQueryKeys.proposal(params),
    queryFn: () => fetchProposal(params, client),
    select: options.select ?? defaultSelect,
  });
};
