import {MultisigProposal, TokenVotingProposal} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';
import request from 'graphql-request';

import {
  InvalidCidError,
  UNAVAILABLE_PROPOSAL_METADATA,
  UNSUPPORTED_PROPOSAL_METADATA_LINK,
  getExtendedProposalId,
} from '@aragon/sdk-client-common';
import {useNetwork} from 'context/network';
import {
  PluginClient,
  isMultisigClient,
  isTokenVotingClient,
  usePluginClient,
} from 'hooks/usePluginClient';
import {ipfsService} from 'services/ipfs/ipfsService';
import {
  CHAIN_METADATA,
  SUBGRAPH_API_URL,
  SupportedNetworks,
} from 'utils/constants';
import {invariant} from 'utils/invariant';
import {IFetchProposalParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';
import {
  syncProposalData,
  toMultisigProposal,
  toTokenVotingProposal,
  transformProposal,
} from '../selectors';
import {
  QueryTokenVotingProposal,
  QueryMultisigProposal,
} from '../queryHelpers/proposal';

export async function getProposal(
  client: PluginClient,
  proposalId: string,
  network: SupportedNetworks
): Promise<
  MultisigProposal | TokenVotingProposal | GaslessVotingProposal | null
> {
  const extendedProposalId = getExtendedProposalId(proposalId);

  let subgraphProposal;

  if (isTokenVotingClient(client)) {
    const {tokenVotingProposal} = await request<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokenVotingProposal: any;
    }>(SUBGRAPH_API_URL[network]!, QueryTokenVotingProposal, {
      proposalId: extendedProposalId,
    });

    try {
      const metadata = await ipfsService.getData(tokenVotingProposal.metadata);
      subgraphProposal = toTokenVotingProposal(tokenVotingProposal, metadata);
    } catch (err) {
      if (err instanceof InvalidCidError) {
        return toTokenVotingProposal(
          tokenVotingProposal,
          UNSUPPORTED_PROPOSAL_METADATA_LINK
        );
      }
      return toTokenVotingProposal(
        tokenVotingProposal,
        UNAVAILABLE_PROPOSAL_METADATA
      );
    }

    const metadata = await ipfsService.getData(tokenVotingProposal.metadata);
    subgraphProposal = toTokenVotingProposal(tokenVotingProposal, metadata);
  } else if (isMultisigClient(client)) {
    const {multisigProposal} = await request<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      multisigProposal: any;
    }>(SUBGRAPH_API_URL[network]!, QueryMultisigProposal, {
      proposalId: extendedProposalId,
    });

    try {
      const metadata = await ipfsService.getData(multisigProposal.metadata);
      subgraphProposal = toMultisigProposal(multisigProposal, metadata);
    } catch (err) {
      if (err instanceof InvalidCidError) {
        return toMultisigProposal(
          multisigProposal,
          UNSUPPORTED_PROPOSAL_METADATA_LINK
        );
      }
      return toMultisigProposal(
        multisigProposal,
        UNAVAILABLE_PROPOSAL_METADATA
      );
    }
  }

  return subgraphProposal as TokenVotingProposal | MultisigProposal;
}

async function fetchProposal(
  params: IFetchProposalParams,
  client: PluginClient | undefined,
  network: SupportedNetworks
): Promise<
  MultisigProposal | TokenVotingProposal | GaslessVotingProposal | null
> {
  invariant(!!client, 'fetchProposal: client is not defined');

  const data = await getProposal(client, params.id, network);
  return data;
}

export const useProposal = (
  params: IFetchProposalParams,
  options: Omit<
    UseQueryOptions<
      MultisigProposal | TokenVotingProposal | GaslessVotingProposal | null
    >,
    'queryKey'
  > = {}
) => {
  const client = usePluginClient(params.pluginType);

  if (!client || !params.id || !params.pluginType) {
    options.enabled = false;
  }

  const {network} = useNetwork();
  const chainId = CHAIN_METADATA[network].id;

  const defaultSelect = (
    data: TokenVotingProposal | MultisigProposal | GaslessVotingProposal | null
  ) => transformProposal(chainId, data);

  return useQuery({
    queryKey: aragonSdkQueryKeys.proposal(params),
    queryFn: async () => {
      const serverData = await fetchProposal(params, client, network);
      return syncProposalData(chainId, params.id, serverData);
    },
    select: options.select ?? defaultSelect,
    ...options,
  });
};
