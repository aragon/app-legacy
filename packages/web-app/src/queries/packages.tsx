import {gql} from '@apollo/client';

export const VOTING_PACKAGE_LIST = gql`
  query packages($dao: ID) {
    daoPackages(where: {dao: $dao}) {
      id
      dao {
        id
      }
      pkg {
        id
        __typename
      }
    }
  }
`;

export const DAO_ERC20VOTING_PACKAGE_BY_ID = gql`
  query erc20VotingPackages($id: ID) {
    erc20VotingPackages(where: {id: $id}) {
      id
      proposals {
        id
      }
      supportRequiredPct
      participationRequiredPct
      minDuration
      votesLength
      token {
        id
        name
        symbol
        decimals
      }
    }
  }
`;

export const DAO_WHITELIST_PACKAGE_BY_ID = gql`
  query whitelistPackages($id: ID) {
    whitelistPackages(where: {id: $id}) {
      id
      proposals {
        id
      }
      supportRequiredPct
      participationRequiredPct
      minDuration
      votesLength
      users {
        id
      }
    }
  }
`;

// TODO: deprecate this query the moment we have multiple packages
// installed on a DAO.
export const DAO_PACKAGE_BY_DAO_ID = gql`
  query package($dao: ID) {
    daoPackages(where: {dao: $dao}) {
      id
      pkg {
        ... on WhitelistPackage {
          supportRequiredPct
          participationRequiredPct
          users {
            id
          }
        }
        ... on ERC20VotingPackage {
          supportRequiredPct
          participationRequiredPct
          token {
            id
            decimals
            symbol
          }
        }
      }
    }
  }
`;
