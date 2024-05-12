import {MultisigProposal, TokenVotingProposal} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';
import request, {gql} from 'graphql-request';

import {useNetwork} from 'context/network';
import {
  PluginClient,
  isMultisigClient,
  isTokenVotingClient,
  usePluginClient,
} from 'hooks/usePluginClient';
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
  UNSUPPORTED_PROPOSAL_METADATA_LINK,
  getExtendedProposalId,
} from '@aragon/sdk-client-common';
// import {ipfsService} from 'services/ipfs/ipfsService';

export const QueryMultisigProposal = gql`
  query MultisigProposal($proposalId: ID!) {
    multisigProposal(id: $proposalId) {
      id
      dao {
        id
        subdomain
      }
      creator
      metadata
      createdAt
      startDate
      endDate
      actions {
        to
        value
        data
      }
      executionDate
      executionBlockNumber
      creationBlockNumber
      plugin {
        onlyListed
      }
      minApprovals
      executionTxHash
      executed
      approvalReached
      isSignaling
      approvers(first: 1000) {
        id
      }
    }
  }
`;

export const QueryTokenVotingProposal = gql`
  query TokenVotingProposal($proposalId: ID!) {
    tokenVotingProposal(id: $proposalId) {
      id
      dao {
        id
        subdomain
      }
      creator
      metadata
      createdAt
      creationBlockNumber
      executionDate
      executionBlockNumber
      actions {
        to
        value
        data
      }
      yes
      no
      abstain
      votingMode
      supportThreshold
      startDate
      endDate
      executed
      earlyExecutable
      approvalReached
      isSignaling
      executionTxHash
      voters(first: 1000) {
        voter {
          address
        }
        voteReplaced
        voteOption
        votingPower
      }
      plugin {
        token {
          id
          name
          symbol
          __typename
          ... on ERC20Contract {
            decimals
          }
          ... on ERC20WrapperContract {
            decimals
            underlyingToken {
              id
              name
              symbol
              decimals
            }
          }
        }
      }
      totalVotingPower
      minVotingPower
    }
  }
`;

async function getProposal(
  client: PluginClient,
  propoosalId: string,
  network: SupportedNetworks
): Promise<
  MultisigProposal | TokenVotingProposal | GaslessVotingProposal | null
> {
  const extendedProposalId = getExtendedProposalId(propoosalId);
  let subgraphProposal;

  if (isTokenVotingClient(client)) {
    const {tokenVotingProposal} = await request<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokenVotingProposal: any;
    }>(SUBGRAPH_API_URL[network]!, QueryTokenVotingProposal, {
      proposalId: extendedProposalId,
    });

    subgraphProposal = tokenVotingProposal;

    subgraphProposal = toTokenVotingProposal(
      tokenVotingProposal,
      UNSUPPORTED_PROPOSAL_METADATA_LINK
    );
    console.log('tokenVotingProposalView', tokenVotingProposal);
  } else if (isMultisigClient(client)) {
    const {multisigProposal} = await request<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      multisigProposal: any;
    }>(SUBGRAPH_API_URL[network]!, QueryMultisigProposal, {
      proposalId: extendedProposalId,
    });

    subgraphProposal = toMultisigProposal(
      multisigProposal,
      UNSUPPORTED_PROPOSAL_METADATA_LINK
    );
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
