import {gql} from 'graphql-request';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchMemberParams} from '../aragon-sdk-service.api';
import {usePluginClient} from 'hooks/usePluginClient';
import {TokenVotingClient, TokenVotingMember} from '@aragon/sdk-client';
import {invariant} from 'utils/invariant';
import {SubgraphTokenVotingMember} from '@aragon/sdk-client/dist/tokenVoting/internal/types';
import {useNetwork} from 'context/network';

function toTokenVotingMember(
  member: SubgraphTokenVotingMember
): TokenVotingMember {
  return {
    address: member.address,
    votingPower: BigInt(member.votingPower),
    balance: BigInt(member.balance),
    delegatee:
      member.delegatee?.address === member.address || !member.delegatee
        ? null
        : member.delegatee.address,
    delegators: member.delegators
      .filter(delegator => delegator.address !== member.address)
      .map(delegator => {
        return {
          address: delegator.address,
          balance: BigInt(delegator.balance),
        };
      }),
  };
}

// TODO: remove GraphQL query when utility is implemented on the SDK
// (see: https://aragonassociation.atlassian.net/browse/OS-814)
export const tokenMemberQuery = gql`
  query TokenVotingMembers(
    $where: TokenVotingMember_filter!
    $block: Block_height
  ) {
    tokenVotingMembers(where: $where, block: $block) {
      address
      balance
      votingPower
      delegatee {
        address
      }
      delegators {
        address
        balance
      }
    }
  }
`;

const fetchMember = async (
  {pluginAddress, blockNumber, address}: IFetchMemberParams,
  client?: TokenVotingClient
): Promise<TokenVotingMember> => {
  invariant(client != null, 'fetchMember: client is not defined');
  const params = {
    where: {
      plugin: pluginAddress.toLowerCase(),
      address: address.toLowerCase(),
    },
    block: blockNumber ? {number: blockNumber} : null,
  };

  type TResult = {tokenVotingMembers: SubgraphTokenVotingMember[]};
  const {tokenVotingMembers} = await client.graphql.request<TResult>({
    query: tokenMemberQuery,
    params,
  });

  return toTokenVotingMember(tokenVotingMembers[0]);
};

export const useMember = (
  params: IFetchMemberParams,
  options: UseQueryOptions<TokenVotingMember> = {}
) => {
  const client = usePluginClient('token-voting.plugin.dao.eth');
  const {network} = useNetwork();

  const baseParams = {
    network: network,
  };

  if (client == null) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.getMember(baseParams, params),
    () => fetchMember(params, client),
    options
  );
};
