import { useState } from "react";
import { Typography, Card } from "antd";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

import { LoginForm } from "../../components/auth";

import { LOGIN_MUTATION } from "../../graphql/auth";

import { GqlError } from "../../types/graphql";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const [loginInput, setLoginInput] = useState({});

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: async (data) => {
      if (data.login.success) {
        navigate("/auth/2fa", {
          state: { loginInput },
        });
      }
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
    setLoginInput(values);
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
      <Card style={{ width: 350 }}>
        <LoginForm onSubmit={handleSubmit} error={error} loading={loading} />
      </Card>
    </div>
  );
}
