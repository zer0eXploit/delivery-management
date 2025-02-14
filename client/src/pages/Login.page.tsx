import { useState } from "react";
import { Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";

import { LoginForm } from "../components/auth";

import { useAuthStore } from "../stores/auth.store";

import { GqlError } from "../types/graphql";

const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      access_token
    }
  }
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      setAccessToken(data.login.access_token);
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

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError(undefined);
    await login({ variables: { loginInput: values } });
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
        Login to Your Account
      </Typography.Title>
      <Card style={{ width: "100%", maxWidth: 400 }}>
        <LoginForm onSubmit={handleSubmit} error={error} loading={loading} />
      </Card>
    </div>
  );
}
