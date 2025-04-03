import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      access_token
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      role
      delivery_person {
        telegram_id
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      success
    }
  }
`;

export const VERIFY_2FA_MUTATION = gql`
  mutation VerifyTwoFactor(
    $loginInput: LoginInput!
    $twoFactorInput: TwoFactorVerifyInput!
  ) {
    verifyTwoFactor(loginInput: $loginInput, twoFactorInput: $twoFactorInput) {
      access_token
    }
  }
`;
