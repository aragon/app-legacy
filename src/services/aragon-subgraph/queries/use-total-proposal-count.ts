import {MultisigClient, TokenVotingClient} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {GaslessVotingClient} from '@vocdoni/gasless-voting';
import {gql} from 'graphql-request';

import {GaslessPluginName, usePluginClient} from 'hooks/usePluginClient';
import {invariant} from 'utils/invariant';
import {IFetchTotalProposalCountParams} from '../aragon-subgraph-service.api';
import {aragonSubgraphQueryKeys} from '../query-keys';

type ProposalCount = {
  proposalCount: bigint;
};

// Token voting query and fetch
export const tokenVotingProposalCountQuery = gql`
  query TokenVotingProposalCount($pluginAddress: ID!) {
    tokenVotingPlugin(id: $pluginAddress) {
      proposalCount
    }
  }
`;

const fetchTokenVotingProposalCount = async (
  params: IFetchTotalProposalCountParams,
  gqlClient: TokenVotingClient['graphql']
): Promise<number> => {
  type TResult = {tokenVotingPlugin: ProposalCount};
  const data = await gqlClient.request<TResult>({
    query: tokenVotingProposalCountQuery,
    params: {pluginAddress: params.pluginAddress},
  });

  return Number(data.tokenVotingPlugin.proposalCount ?? 0);
};

// Multisig query and fetch
export const multisigProposalCountQuery = gql`
  query MultisigProposalCount($pluginAddress: ID!) {
    multisigPlugin(id: $pluginAddress) {
      proposalCount
    }
  }
`;

const fetchMultisigProposalCount = async (
  params: IFetchTotalProposalCountParams,
  gqlClient: MultisigClient['graphql']
): Promise<number> => {
  type TResult = {multisigPlugin: ProposalCount};

  const data = await gqlClient.request<TResult>({
    query: multisigProposalCountQuery,
    params: {pluginAddress: params.pluginAddress},
  });

  return Number(data.multisigPlugin.proposalCount ?? 0);
};

// Gasless voting query and fetch
export const gaslessVotingProposalCountQuery = gql`
  query GaslessVotingProposalCount($pluginAddress: String!) {
    plugins(where: {address: $pluginAddress}) {
      dao {
        proposalsCount
      }
    }
  }
`;

const fetchGaslessVotingProposalCount = async (
  params: IFetchTotalProposalCountParams,
  gqlClient: GaslessVotingClient['graphql']
): Promise<number> => {
  type TResult = {
    plugins: Array<{
      dao: {
        proposalsCount: bigint;
      };
    }>;
  };

  const data = await gqlClient.request<TResult>({
    query: gaslessVotingProposalCountQuery,
    params: {pluginAddress: params.pluginAddress},
  });

  return Number(data.plugins[0].dao?.proposalsCount) || 0;
};

const fetchTotalProposalCount = async (
  params: IFetchTotalProposalCountParams,
  client: TokenVotingClient | MultisigClient | GaslessVotingClient | undefined
): Promise<number> => {
  invariant(client != null, 'fetchTotalProposalCount: client is not defined');

  switch (params.pluginType) {
    case 'multisig.plugin.dao.eth':
      return await fetchMultisigProposalCount(params, client.graphql);
    case 'token-voting.plugin.dao.eth':
      return await fetchTokenVotingProposalCount(params, client.graphql);
    case GaslessPluginName:
      return await fetchGaslessVotingProposalCount(params, client.graphql);
    default:
      throw new Error('Invalid pluginType');
  }
};

export const useTotalProposalCount = (
  params: IFetchTotalProposalCountParams,
  options: UseQueryOptions<number> = {}
) => {
  const client = usePluginClient(params.pluginType);

  if (client == null || params.pluginAddress == null) {
    options.enabled = false;
  }

  return useQuery(
    aragonSubgraphQueryKeys.totalProposalCount(params),
    () => fetchTotalProposalCount(params, client),
    options
  );
};
