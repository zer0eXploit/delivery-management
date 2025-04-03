import { Typography, Card } from "antd";
import { CustomerLayout } from "../../components/customer/CustomerLayout";
import { DeliveryRequestForm } from "../../components/delivery/DeliveryRequestForm";

export default function CustomerPage() {
  return (
    <CustomerLayout>
      <Card>
        <Typography.Title level={3}>Create Delivery Request</Typography.Title>
        <DeliveryRequestForm />
      </Card>
    </CustomerLayout>
  );
}
