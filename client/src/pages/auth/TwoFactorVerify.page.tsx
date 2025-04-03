import { useState } from "react";
import { Typography, Card } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useApolloClient } from "@apollo/client";

import { TwoFactorForm } from "../../components/auth/TwoFactorForm";

import { useAuthStore } from "../../stores/auth.store";

import { ME_QUERY, VERIFY_2FA_MUTATION } from "../../graphql/auth";

import { GqlError } from "../../types/graphql";

interface TwoFactorFormValues {
  code: string;
}

export default function TwoFactorVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const client = useApolloClient();
  const [error, setError] = useState<string>();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const loginInput = location.state?.loginInput;
  if (!loginInput) {
    navigate("/auth/login");
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [verify2FA, { loading }] = useMutation(VERIFY_2FA_MUTATION, {
    onCompleted: async (data) => {
      setAccessToken(data.verifyTwoFactor.access_token);
      const { data: userData } = await client.query({
        query: ME_QUERY,
        fetchPolicy: "network-only",
      });

      const role = userData.me.role.toLowerCase();
      if (role === "deliverer" && !userData.me.delivery_person?.telegram_id) {
        navigate("/auth/telegram-linkage", {
          state: { userId: userData.me.id },
        });
      } else {
        navigate(`/${role}`);
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

  const handleSubmit = async (values: TwoFactorFormValues) => {
    setError(undefined);
    await verify2FA({
      variables: {
        loginInput,
        twoFactorInput: { code: values.code },
      },
    });
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
        Additional Authentication
      </Typography.Title>
      <Card style={{ width: 350 }}>
        <TwoFactorForm
          onSubmit={handleSubmit}
          error={error}
          loading={loading}
        />
      </Card>
    </div>
  );
}
