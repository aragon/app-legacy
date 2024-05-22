import {gql} from 'graphql-request';

export const QueryTokenVotingProposals = gql`
  query TokenVotingProposals(
    $where: TokenVotingProposal_filter!
    $limit: Int!
    $skip: Int!
    $direction: OrderDirection!
    $sortBy: TokenVotingProposal_orderBy!
  ) {
    tokenVotingProposals(
      where: $where
      first: $limit
      skip: $skip
      orderDirection: $direction
      orderBy: $sortBy
    ) {
      id
      dao {
        id
        subdomain
      }
      creator
      metadata
      yes
      no
      abstain
      startDate
      endDate
      executed
      earlyExecutable
      approvalReached
      isSignaling
      votingMode
      supportThreshold
      minVotingPower
      totalVotingPower
      actions {
        to
        value
        data
      }
      voters {
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
    }
  }
`;

export const QueryMultisigProposals = gql`
  query MultisigProposals(
    $where: MultisigProposal_filter!
    $limit: Int!
    $skip: Int!
    $direction: OrderDirection!
    $sortBy: MultisigProposal_orderBy!
  ) {
    multisigProposals(
      where: $where
      first: $limit
      skip: $skip
      orderDirection: $direction
      orderBy: $sortBy
    ) {
      id
      dao {
        id
        subdomain
      }
      creator
      metadata
      executed
      approvalReached
      isSignaling
      approvalCount
      startDate
      endDate
      executionDate
      executionBlockNumber
      creationBlockNumber
      approvals {
        id
        approver {
          address
        }
      }
      actions {
        to
        value
        data
      }
      minApprovals
      plugin {
        onlyListed
      }
    }
  }
`;
