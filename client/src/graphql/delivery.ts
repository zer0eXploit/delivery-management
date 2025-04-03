import { gql } from "@apollo/client";

export const CREATE_DELIVERY_REQUEST = gql`
  mutation CreateDeliveryRequest($input: CreateDeliveryRequestInput!) {
    createDeliveryRequest(createDeliveryRequestInput: $input) {
      id
      tracking_code
      weight
      pickup_cost
      delivery_cost
      total_cost
      status
      created_at
      pickup_address {
        address_line
        township {
          name
        }
      }
      delivery_address {
        address_line
        township {
          name
        }
      }
    }
  }
`;

export const GET_MY_DELIVERY_REQUESTS = gql`
  query GetMyDeliveryRequests {
    findMyDeliveryRequests {
      id
      tracking_code
      weight
      pickup_cost
      delivery_cost
      total_cost
      status
      created_at
      pickup_address {
        address_line
        township {
          name
        }
      }
      delivery_address {
        address_line
        township {
          name
        }
      }
    }
  }
`;

export const GET_MY_ADDRESSES = gql`
  query GetMyAddresses {
    myAddresses {
      id
      address_line
      township {
        name
        pickup_cost
        delivery_cost
      }
    }
  }
`;

export const GET_TOWNSHIPS = gql`
  query Townships {
    townships {
      code
      delivery_cost
      id
      name
      pickup_cost
      zipcode
    }
  }
`;

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($createAddressInput: CreateAddressInput!) {
    createAddress(createAddressInput: $createAddressInput) {
      address_line
      created_at
      deleted_at
      id
      updated_at
      latitude
      longitude
      contact_number
      township {
        code
        delivery_cost
        id
        name
        pickup_cost
        zipcode
      }
    }
  }
`;

export const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent($deliveryRequestId: String!) {
    createPaymentIntent(deliveryRequestId: $deliveryRequestId) {
      amount
      client_secret
      created_at
      id
      status
      stripe_payment_intent_id
      updated_at
    }
  }
`;
