import { useState } from "react";
import { Typography, Card, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useMutation, useApolloClient } from "@apollo/client";

import { RegisterForm } from "../../components/auth";

import { useAuthStore } from "../../stores/auth.store";

import { GqlError } from "../../types/graphql";
import { ME_QUERY, REGISTER_MUTATION } from "../../graphql/auth";

type UserData = {
  me: {
    id: string;
    role: string;
    delivery_person?: {
      telegram_id?: string;
    };
  };
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const client = useApolloClient();
  const [error, setError] = useState<string>();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: async (data) => {
      setAccessToken(data.register.access_token);
      const { data: userData } = await client.query<UserData>({
        query: ME_QUERY,
        fetchPolicy: "network-only",
      });

      if (userData.me.role.toLowerCase() === "deliverer") {
        navigate("/auth/telegram-linkage", {
          state: { userId: userData.me.id },
        });
      } else {
        navigate(`/${userData.me.role.toLowerCase()}`);
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
      <Space direction="vertical" align="center" style={{ width: "100%" }}>
        <Typography.Title level={2} style={{ marginBottom: "2rem" }}>
          Create an Account
        </Typography.Title>
        <Card style={{ width: 350 }}>
          <RegisterForm
            onSubmit={handleSubmit}
            error={error}
            loading={loading}
          />
        </Card>
      </Space>
    </div>
  );
}
