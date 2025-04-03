import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { Alert, Button, Space } from "antd";

import { InlineLoadingSpinner } from "../../components/common/LoadingSpinner";

interface PaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({ onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(undefined);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/customer/payment-complete`,
      },
    });

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      {error && (
        <Alert
          type="error"
          message={error}
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      {!isReady && <InlineLoadingSpinner size="default" />}
      <div style={{ visibility: isReady ? "visible" : "hidden" }}>
        <PaymentElement onReady={() => setIsReady(true)} />
      </div>
      {isReady && (
        <Space style={{ marginTop: 24 }} className="w-full justify-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Pay Now
          </Button>
        </Space>
      )}
    </form>
  );
}
