import {
  Form,
  Space,
  Input,
  Empty,
  Alert,
  Button,
  Timeline,
  Typography,
} from "antd";
import {
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@apollo/client";

import { LoadingSpinner } from "../common/LoadingSpinner";

import { GET_DELIVERY_TIMELINE } from "../../graphql/timeline";

interface DeliveryTimelineProps {
  deliveryRequestId: string | undefined | null;
}

interface TimelineEvent {
  id: string;
  created_at: string;
  description: string;
  status: DeliveryStatus;
}

enum DeliveryStatus {
  Pending = "PENDING",
  PickupAssigned = "PICKUP_ASSIGNED",
  PickedUp = "PICKED_UP",
  OutForDelivery = "OUT_FOR_DELIVERY",
  Delivered = "DELIVERED",
  Cancelled = "CANCELLED",
}

const getStatusConfig = (status: DeliveryStatus) => {
  switch (status) {
    case DeliveryStatus.Delivered:
      return {
        color: "blue",
        icon: <CheckCircleOutlined style={{ fontSize: "1.5rem" }} />,
      };
    case DeliveryStatus.OutForDelivery:
      return {
        color: "green",
        icon: <ClockCircleOutlined style={{ fontSize: "1.5rem" }} />,
      };
    case DeliveryStatus.PickedUp:
      return {
        color: "blue",
        icon: <TruckOutlined style={{ fontSize: "1.5rem" }} />,
      };
    case DeliveryStatus.PickupAssigned:
      return {
        color: "green",
        icon: <ClockCircleOutlined style={{ fontSize: "1.5rem" }} />,
      };
    case DeliveryStatus.Pending:
      return {
        color: "gray",
        icon: <ClockCircleOutlined style={{ fontSize: "1.5rem" }} />,
      };
    case DeliveryStatus.Cancelled:
      return {
        color: "red",
        icon: <CloseCircleOutlined style={{ fontSize: "1.5rem" }} />,
      };
    default:
      return {
        color: "green",
        icon: <ClockCircleOutlined style={{ fontSize: "1.5rem" }} />,
      };
  }
};

export const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({
  deliveryRequestId,
}) => {
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const effectiveId = deliveryRequestId || trackingCode;

  const { data, loading, error } = useQuery(GET_DELIVERY_TIMELINE, {
    variables: { deliveryRequestId: effectiveId },
  });

  const handleTrackingSubmit = (values: { trackingCode: string }) => {
    setTrackingCode(values.trackingCode);
  };

  if (!effectiveId) {
    return (
      <Space
        direction="vertical"
        style={{ width: "100%", padding: "24px" }}
        align="center"
      >
        <Typography.Title level={3}>Track Your Delivery</Typography.Title>
        <Form onFinish={handleTrackingSubmit} layout="vertical">
          <Form.Item
            name="trackingCode"
            label="Tracking Code"
            rules={[
              { required: true, message: "Please enter your tracking code" },
            ]}
            help="The tracking code looks something like this: LMD-0001-20250101-KMY"
          >
            <Input placeholder="Enter your tracking code" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Track Delivery
            </Button>
          </Form.Item>
        </Form>
      </Space>
    );
  }

  if (loading) return <LoadingSpinner size="large" />;
  if (error)
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          type="error"
          message="Error loading timeline"
          description={error.message ?? "Server could be down"}
        />
      </div>
    );

  if (!data?.getDeliveryTimeline?.length) {
    return (
      <Space
        align="center"
        direction="vertical"
        style={{ width: "100%", paddingTop: "24px" }}
      >
        <Empty
          description={
            <span>
              No delivery information found for the provided tracking code
              {trackingCode && (
                <Button
                  type="link"
                  onClick={() => setTrackingCode(null)}
                  style={{ display: "block", margin: "10px auto" }}
                >
                  Try another tracking code
                </Button>
              )}
            </span>
          }
        />
      </Space>
    );
  }

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Space
        direction="vertical"
        style={{ width: "100%", paddingTop: "24px" }}
        align="center"
      >
        <Typography.Title level={3}>Delivery Timeline</Typography.Title>
        <Timeline
          items={data?.getDeliveryTimeline.map((event: TimelineEvent) => {
            const statusConfig = getStatusConfig(event.status);
            return {
              dot: statusConfig.icon,
              color: statusConfig.color,
              children: (
                <>
                  <Typography.Paragraph>
                    {event.description}
                  </Typography.Paragraph>
                  <Typography.Paragraph
                    type="secondary"
                    style={{ fontSize: 12 }}
                  >
                    {format(new Date(event.created_at), "PPpp")}
                  </Typography.Paragraph>
                </>
              ),
            };
          })}
        />
      </Space>

      <Space
        direction="vertical"
        style={{
          padding: "24px",
          marginTop: "auto",
          borderTop: "1px solid #f3f3f3",
        }}
        align="center"
      >
        <Typography.Title level={5}>Customer Care</Typography.Title>
        <Typography.Text>
          <Typography.Text strong>General Inquiries:</Typography.Text> +95 9 012
          345 678
        </Typography.Text>
        <Typography.Text>
          <Typography.Text strong>Urgent Support:</Typography.Text> +95 9 012
          345 679
        </Typography.Text>
      </Space>
    </div>
  );
};
