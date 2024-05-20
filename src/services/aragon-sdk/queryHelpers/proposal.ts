import {gql} from 'graphql-request';

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
      approvals(first: 1000) {
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
