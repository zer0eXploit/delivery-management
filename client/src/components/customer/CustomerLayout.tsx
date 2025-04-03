import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { Flex, Menu, theme, Space, Layout, Avatar, Typography } from "antd";

import { InlineLoadingSpinner } from "../common/LoadingSpinner";

import { useAuthStore } from "../../stores/auth.store";

import { ME_QUERY } from "../../graphql/user";

const { Text } = Typography;
const { Header, Sider, Content } = Layout;

interface CustomerLayoutProps {
  children?: ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { data: meQuery, loading, error } = useQuery(ME_QUERY);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { key: "home", icon: <HomeOutlined />, label: "Home" },
    { key: "requests", icon: <HistoryOutlined />, label: "My Requests" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          background: colorBgContainer,
          justifyContent: "space-between",
        }}
      >
        <Text strong style={{ fontSize: "18px" }}>
          Delivery Management
        </Text>
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Flex vertical>
            <Text strong>{meQuery?.me?.name}</Text>
            <Text type="secondary">{meQuery?.me?.email}</Text>
          </Flex>
        </Space>
      </Header>
      <Layout>
        <Sider
          collapsed
          theme="light"
          breakpoint="lg"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Menu
            theme="light"
            selectedKeys={[location.pathname.split("/").pop() || "home"]}
            mode="inline"
            items={menuItems}
            onSelect={({ key }) => {
              if (key === "logout") return handleLogout();

              if (key === location.pathname.split("/").pop()) return;

              navigate(`/customer/${key === "home" ? "" : key}`);
            }}
          />
        </Sider>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 8,
          }}
        >
          {loading ? (
            <InlineLoadingSpinner size="small" />
          ) : error ? (
            <div>Error: {error.message}</div>
          ) : (
            children
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
