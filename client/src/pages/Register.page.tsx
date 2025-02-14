import { useState } from "react";
import { Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";

import { RegisterForm } from "../components/auth";

import { GqlError } from "../types/graphql";

const REGISTER_MUTATION = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      access_token
    }
  }
`;

import { useAuthStore } from "../stores/auth.store";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      setAccessToken(data.register.access_token);
      navigate("/");
    },
    onError: (error) => {
      const gqlError = error.graphQLErrors[0] as unknown as GqlError;
      const originalError = gqlError.originalError;
      const errorMessage = Array.isArray(originalError.message)
        ? originalError.message.join("\n")
        : originalError.message;
      setError(errorMessage);
    },
  });

  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    setError(undefined);
    await register({ variables: { registerInput: values } });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <Typography.Title level={2} style={{ marginBottom: "2rem" }}>
        Create an Account
      </Typography.Title>
      <Card style={{ width: "100%", maxWidth: 400 }}>
        <RegisterForm onSubmit={handleSubmit} error={error} loading={loading} />
      </Card>
    </div>
  );
}
