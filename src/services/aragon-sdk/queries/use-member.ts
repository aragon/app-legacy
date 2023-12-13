import {gql} from 'graphql-request';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchMemberParams} from '../aragon-sdk-service.api';
import {usePluginClient} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {SupportedNetworks} from 'utils/constants';
import {
  MultisigClient,
  TokenVotingClient,
  TokenVotingMember,
} from '@aragon/sdk-client';
import {invariant} from 'utils/invariant';
import {SubgraphTokenVotingMember} from '@aragon/sdk-client/dist/tokenVoting/internal/types';
import {MemberDAOsType, SubgraphMembers} from 'utils/types';

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

function toMemberDAOs(members: SubgraphMembers[]): MemberDAOsType {
  return members.map(member => ({
    address: member.plugin.dao.id,
    pluginAddress: member.plugin.dao.id,
  }));
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

export const tokenMemberDAOsQuery = gql`
  query TokenVotingMembers(
    $where: TokenVotingMember_filter!
    $block: Block_height
  ) {
    tokenVotingMembers(where: $where, block: $block) {
      address
      plugin {
        dao {
          id
        }
      }
    }
  }
`;

export const multisigApproverDAOsQuery = gql`
  query MultisigApprovers(
    $where: TokenVotingMember_filter!
    $block: Block_height
  ) {
    multisigApprovers(where: $where, block: $block) {
      address
      plugin {
        dao {
          id
        }
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
      plugin: pluginAddress!.toLowerCase(),
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

const fetchMemberDAOs = async (
  {blockNumber, address}: IFetchMemberParams,
  tokenVotingclient?: TokenVotingClient,
  multisigClient?: MultisigClient
): Promise<MemberDAOsType> => {
  invariant(
    tokenVotingclient != null || multisigClient != null,
    'fetchMember: client is not defined'
  );
  const params = {
    where: {
      address: address.toLowerCase(),
    },
    block: blockNumber ? {number: blockNumber} : null,
  };

  type TResult = {tokenVotingMembers: SubgraphMembers[]};
  type MResult = {multisigApprovers: SubgraphMembers[]};

  const {tokenVotingMembers} =
    await tokenVotingclient!.graphql.request<TResult>({
      query: tokenMemberDAOsQuery,
      params,
    });

  const {multisigApprovers} = await multisigClient!.graphql.request<MResult>({
    query: multisigApproverDAOsQuery,
    params,
  });

  console.log(
    'multisigApprovers',
    (tokenVotingMembers ?? []).concat(multisigApprovers)
  );

  console.log(
    'multisigApprovers',
    (tokenVotingMembers ?? []).concat(multisigApprovers),
    multisigApprovers,
    tokenVotingMembers
  );

  return toMemberDAOs((tokenVotingMembers ?? []).concat(multisigApprovers));
};

export const useMember = (
  params: IFetchMemberParams,
  options: UseQueryOptions<TokenVotingMember> = {}
) => {
  const client = usePluginClient('token-voting.plugin.dao.eth');
  const {address, network} = useWallet();
  const baseParams = {
    address: address as string,
    network: network as SupportedNetworks,
  };

  if (client == null || address == null || network == null) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.getMember(baseParams, params),
    () => fetchMember(params, client),
    options
  );
};

export const useMemberDAOs = (
  params: IFetchMemberParams,
  options: UseQueryOptions<MemberDAOsType> = {}
) => {
  const tokenVotingclient = usePluginClient('token-voting.plugin.dao.eth');
  const multisigclient = usePluginClient('token-voting.plugin.dao.eth');
  const {network} = useWallet();
  const baseParams = {
    address: params.address as string,
    network: network as SupportedNetworks,
  };

  if (tokenVotingclient == null || multisigclient == null || network == null) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.getMemberDAOs(baseParams),
    () => fetchMemberDAOs(params, tokenVotingclient, multisigclient),
    options
  );
};
