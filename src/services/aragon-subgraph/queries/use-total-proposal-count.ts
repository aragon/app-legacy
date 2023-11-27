import {MultisigClient, TokenVotingClient} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {GaslessVotingClient} from '@vocdoni/gasless-voting';
import {gql} from 'graphql-request';

import {usePluginClient} from 'hooks/usePluginClient';
import {invariant} from 'utils/invariant';
import {IFetchTotalProposalCountParams} from '../aragon-subgraph-service.api';
import {aragonSubgraphQueryKeys} from '../query-keys';

type ProposalCount = {
  proposalCount: number;
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
  client: TokenVotingClient
): Promise<number> => {
  type TResult = {tokenVotingPlugin: ProposalCount};

  const data = await client.graphql.request<TResult>({
    query: tokenVotingProposalCountQuery,
    params: {pluginAddress: params.pluginAddress},
  });

  return data.tokenVotingPlugin.proposalCount ?? 0;
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
  client: MultisigClient
): Promise<number> => {
  type TResult = {multisigPlugin: ProposalCount};

  const data = await client.graphql.request<TResult>({
    query: multisigProposalCountQuery,
    params: {pluginAddress: params.pluginAddress},
  });

  return data.multisigPlugin.proposalCount ?? 0;
};

// Gasless voting query and fetch
export const gaslessVotingProposalCountQuery = gql`
  query GaslessVotingProposalCount($pluginAddress: ID!) {
    gaslessVotingPlugin(id: $pluginAddress) {
      proposalCount
    }
  }
`;

const fetchGaslessVotingProposalCount = async (
  params: IFetchTotalProposalCountParams,
  client: GaslessVotingClient
): Promise<number> => {
  type TResult = {multisigPlugin: ProposalCount};

  const data = await client.graphql.request<TResult>({
    query: gaslessVotingProposalCountQuery,
    params: {pluginAddress: params.pluginAddress},
  });

  return data.multisigPlugin.proposalCount ?? 0;
};

const fetchTotalProposalCount = async (
  params: IFetchTotalProposalCountParams,
  client: TokenVotingClient | MultisigClient | GaslessVotingClient | undefined
): Promise<number> => {
  invariant(client != null, 'fetchTotalProposalCount: client is not defined');

  switch (params.pluginType) {
    case 'multisig.plugin.dao.eth':
      return await fetchMultisigProposalCount(params, client as MultisigClient);
    case 'token-voting.plugin.dao.eth':
      return await fetchTokenVotingProposalCount(
        params,
        client as TokenVotingClient
      );
    case 'vocdoni-gasless-voting-poc.plugin.dao.eth':
      return await fetchGaslessVotingProposalCount(
        params,
        client as GaslessVotingClient
      );
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
