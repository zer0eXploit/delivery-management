import { Result, Button } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectStatus = searchParams.get("redirect_status");

  const isSuccess = redirectStatus === "succeeded";

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Result
        status={isSuccess ? "success" : "error"}
        title={isSuccess ? "Payment Successful!" : "Payment Failed"}
        extra={[
          <Button
            type="primary"
            key="console"
            onClick={() => navigate("/customer/requests")}
          >
            View My Requests
          </Button>,
          <Button key="home" onClick={() => navigate("/customer")}>
            Create New Request
          </Button>,
        ]}
      />
    </div>
  );
}
