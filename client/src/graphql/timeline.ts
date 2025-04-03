import { gql } from "@apollo/client";

export const GET_DELIVERY_TIMELINE = gql`
  query GetDeliveryTimeline($deliveryRequestId: String!) {
    getDeliveryTimeline(deliveryRequestId: $deliveryRequestId) {
      id
      status
      description
      created_at
    }
  }
`;