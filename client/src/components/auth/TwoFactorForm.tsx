import { Form, Input, Button } from "antd";

interface TwoFactorFormProps {
  onSubmit: (values: { code: string }) => void;
  error?: string;
  loading?: boolean;
}

export function TwoFactorForm({
  onSubmit,
  error,
  loading,
}: TwoFactorFormProps) {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    const code = form.getFieldValue("code");
    if (code?.length === 6) {
      onSubmit({ code });
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="code"
        required
        help="Enter the verification code sent to your email"
        label="Verification Code"
      >
        <Input.OTP
          length={6}
          size="large"
          status={error ? "error" : ""}
          separator="-"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Verify
        </Button>
      </Form.Item>
    </Form>
  );
}
