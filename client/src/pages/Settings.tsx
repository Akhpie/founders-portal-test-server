import { Layout, Menu } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined, BellOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Sider, Content } = Layout;

const ResponsiveSettingsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const menuItems = [
    {
      key: "/portal/settings/profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "/portal/settings/security",
      icon: <LockOutlined />,
      label: "Security",
    },
    {
      key: "/portal/settings/notifications",
      icon: <BellOutlined />,
      label: "Notifications",
    },
  ];

  return (
    <Layout className="bg-transparent">
      {isMobile ? (
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="mb-4"
        />
      ) : (
        <Sider width={200} className="bg-transparent">
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
      )}
      <Content className={`${isMobile ? "px-0" : "pl-8"}`}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default ResponsiveSettingsLayout;
