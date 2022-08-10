import { gql } from "graphql-request";

const GET_TRANSFERS = gql`
  {
    transfers(first: 10) {
      id
      from
      to
      value
    }
  }
`;

export default GET_TRANSFERS;
