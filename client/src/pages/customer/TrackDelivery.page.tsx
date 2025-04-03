import { useParams } from "react-router-dom";

import { DeliveryTimeline } from "../../components/customer/DeliveryTimeline";

export default function CustomerPage() {
  const { id } = useParams<{ id: string }>();

  return <DeliveryTimeline deliveryRequestId={id} />;
}
