import { z } from "zod";
import { Form, Input, Button, Alert } from "antd";

const LoginPayload = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof LoginPayload>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export function LoginForm({ onSubmit, error, loading }: LoginFormProps) {
  const [form] = Form.useForm<LoginFormValues>();

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const validatedData = LoginPayload.parse(values);
      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formErrors = error.errors.reduce((acc, curr) => {
          const path = curr.path[0] as keyof LoginFormValues;
          acc[path] = curr.message;
          return acc;
        }, {} as Record<keyof LoginFormValues, string>);

        console.error(formErrors);

        form.setFields(
          Object.entries(formErrors).map(([name, errors]) => ({
            name: name as keyof LoginFormValues,
            errors: [errors],
          }))
        );
      }
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ maxWidth: 400, width: "100%" }}
    >
      {error && (
        <Form.Item>
          <Alert type="error" message={error} showIcon />
        </Form.Item>
      )}

      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: "Please input your email!" }]}
      >
        <Input type="email" placeholder="Enter your email" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password placeholder="Enter your password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Login
        </Button>
      </Form.Item>
    </Form>
  );
}
