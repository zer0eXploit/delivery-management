import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Space,
  Typography,
  QRCode,
  Result,
  Spin,
  Flex,
} from "antd";

import { ME_QUERY } from "../../graphql/auth";

type TelegramLinkingProps = {
  userId: string;
};

export function TelegramLinking({ userId }: TelegramLinkingProps) {
  const navigate = useNavigate();
  const [isLinked, setIsLinked] = useState(false);

  const { data } = useQuery(ME_QUERY, {
    fetchPolicy: "network-only",
    pollInterval: 5000,
  });

  useEffect(() => {
    if (data?.me?.delivery_person?.telegram_id) {
      setIsLinked(true);
    }
  }, [data]);

  return (
    <Card style={{ width: "100%", maxWidth: 400 }}>
      <Space direction="vertical" align="center" style={{ width: "100%" }}>
        {!isLinked ? (
          <>
            <Typography.Paragraph>
              Scan this QR code with your phone to link your account with
              Telegram
            </Typography.Paragraph>
            <div style={{ margin: "24px 0" }}>
              <QRCode
                type="svg"
                value={`${
                  import.meta.env.VITE_TELEGRAM_BOT_URL
                }?start=${userId}`}
                size={200}
              />
            </div>
            <Flex align="center" justify="center" gap={5}>
              <Spin indicator={<LoadingOutlined spin />} />
              <Typography.Text type="secondary">
                Waiting for account linkage...
              </Typography.Text>
            </Flex>
          </>
        ) : (
          <>
            <Result
              status="success"
              title="Telegram Linked"
              subTitle="You will now receive notifications from the bot about the delivery jobs."
              extra={
                <Button type="primary" onClick={() => navigate("/deliverer")}>
                  Go to Dashboard
                </Button>
              }
            />
          </>
        )}
      </Space>
    </Card>
  );
}
