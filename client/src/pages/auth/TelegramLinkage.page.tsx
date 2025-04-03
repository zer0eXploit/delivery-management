import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Typography, Space } from "antd";

import { TelegramLinking } from "../../components/auth";

export default function TelegramLinkagePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate("/");
    }
  }, [userId, navigate]);

  if (!userId) return null;

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
          Link Telegram Account
        </Typography.Title>
        <TelegramLinking userId={userId} />
      </Space>
    </div>
  );
}
