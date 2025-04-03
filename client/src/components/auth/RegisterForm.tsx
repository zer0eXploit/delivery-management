import { z } from "zod";
import { Form, Input, Button, Alert } from "antd";
import { useSearchParams } from "react-router-dom";

const RegisterPayload = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["customer", "deliverer"]),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one symbol"
    ),
});

type RegisterFormValues = Omit<z.infer<typeof RegisterPayload>, "role">;

interface RegisterFormProps {
  onSubmit: (values: z.infer<typeof RegisterPayload>) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export function RegisterForm({ onSubmit, error, loading }: RegisterFormProps) {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm<RegisterFormValues>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateField = (_: any, value: string) => {
    try {
      if (_.field === "name") {
        RegisterPayload.shape.name.parse(value);
      } else if (_.field === "email") {
        RegisterPayload.shape.email.parse(value);
      } else if (_.field === "password") {
        RegisterPayload.shape.password.parse(value);
      }
      return Promise.resolve();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Promise.reject(error.errors[0].message);
      }
      return Promise.reject("Validation failed");
    }
  };

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      const role =
        searchParams.get("as") === "deliverer" ? "deliverer" : "customer";
      const validatedData = RegisterPayload.parse({
        ...values,
        role,
      });
      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formErrors = error.errors.reduce((acc, curr) => {
          const path = curr.path[0] as keyof RegisterFormValues;
          acc[path] = curr.message;
          return acc;
        }, {} as Record<keyof RegisterFormValues, string>);

        form.setFields(
          Object.entries(formErrors).map(([name, errors]) => ({
            name: name as keyof RegisterFormValues,
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
      validateTrigger="onChange"
      style={{ maxWidth: 400, width: "100%" }}
    >
      {error && (
        <Form.Item>
          <Alert type="error" message={error} showIcon />
        </Form.Item>
      )}

      <Form.Item
        label="Name"
        name="name"
        validateFirst
        rules={[
          { required: true, message: "Please input your name!" },
          { validator: validateField },
        ]}
      >
        <Input placeholder="Enter your name" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        validateFirst
        rules={[
          { required: true, message: "Please input your email!" },
          { validator: validateField },
        ]}
      >
        <Input type="email" placeholder="Enter your email" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        validateFirst
        rules={[
          { required: true, message: "Please input your password!" },
          { validator: validateField },
        ]}
      >
        <Input.Password placeholder="Enter your password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Register
        </Button>
      </Form.Item>
    </Form>
  );
}
