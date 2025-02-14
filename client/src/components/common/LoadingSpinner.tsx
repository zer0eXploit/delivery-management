import { Spin } from "antd";

type SpinnerProps = { size: "large" | "small" | "default" };

export const LoadingSpinner = ({ size = "large" }: SpinnerProps) => {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Spin size={size} />
    </div>
  );
};
