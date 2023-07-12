import {gql} from '@apollo/client';

export const TOKEN_DATA_QUERY = gql`
  query TokenData {
    tokenData(url: $url)
      @rest(type: "TokenData", path: "{args.url}", method: "GET") {
      id
      name
      symbol
      image {
        large
      }
      market_data {
        current_price {
          usd
        }
      }
    }
  }
`;
