import { Typography, Card } from "antd";
import { CustomerLayout } from "../../components/customer/CustomerLayout";
import { DeliveryRequestList } from "../../components/delivery/DeliveryRequestList";

export default function RequestsPage() {
  return (
    <CustomerLayout>
      <Card>
        <Typography.Title level={3}>My Delivery Requests</Typography.Title>
        <DeliveryRequestList />
      </Card>
    </CustomerLayout>
  );
}
