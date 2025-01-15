import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Breadcrumb,
  Dropdown,
  theme,
  Switch,
  message,
  Tag,
  Divider,
} from "antd";
import {
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
  LogoutOutlined,
  StockOutlined,
  FileTextOutlined,
  SunOutlined,
  MoonFilled,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  LoadingOutlined,
  YoutubeOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useThemeStore } from "../../store/themeStore";
import {
  Bell,
  BellDotIcon,
  BookCheck,
  CheckCheckIcon,
  FolderCheckIcon,
  GlassWater,
  NewspaperIcon,
  RocketIcon,
  StarsIcon,
  TrendingUp,
  UserCog,
} from "lucide-react";
import AIChatModal from "../../components/AIChatModal";
import { googleLogout, GoogleOAuthProvider } from "@react-oauth/google";
import angelIconTwo from "../../assets/images/angel-icon-two.png";

const { Header, Sider, Content } = Layout;

import { useLocation } from "react-router-dom";

interface AdminInfo {
  adminname: string;
  adminemail: string;
  adminrole: string;
  profilePic?: string;
}

export default function AdminLayout() {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { isDark, toggleTheme } = useThemeStore();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    if (adminInfo?.profilePic) {
      const img = new Image();
      img.src = adminInfo.profilePic;
      img.onload = () => setImageLoading(false);
    }
  }, [adminInfo?.profilePic]);

  const fetchAdminInfo = async () => {
    try {
      const response = await fetch(
        "https://founders-portal-test-server-apii.onrender.com/api/auth/current-user",
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAdminInfo({
          adminname: data.adminname,
          adminemail: data.adminemail,
          adminrole: data.adminrole,
          profilePic: data.profilePic,
        });
        console.log("Admin info:", data);
      }
    } catch (error) {
      console.error("Error fetching admin info:", error);
    }
  };

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      message.loading({ content: "Logging out...", key: "logout" });

      // Google logout
      try {
        googleLogout();
      } catch (error) {
        console.error("Google logout error:", error);
      }

      // Backend logout
      const response = await fetch(
        "https://founders-portal-test-server-apii.onrender.com/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Clear all cookies for your domain
      // document.cookie.split(";").forEach((c) => {
      //   document.cookie = c
      //     .replace(/^ +/, "")
      //     .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      // });

      // Clear any local storage
      // localStorage.clear();
      // sessionStorage.clear();

      message.success({ content: "Logged out successfully", key: "logout" });

      // Navigate and force a page reload to clear all states
      navigate("/admin");
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      message.error({
        content: "Failed to logout. Please try again.",
        key: "logout",
      });
    }
  };

  const getSelectedKey = () => {
    if (location.pathname.includes("/dashboard")) return "1";
    if (location.pathname.includes("/user-settings")) return "2";

    if (location.pathname.includes("/analytics/user-analytics")) return "3-1";
    if (location.pathname.includes("/analytics/trends")) return "3-2";

    if (location.pathname.includes("/adminPortal/features/faqs")) return "4-1";
    if (location.pathname.includes("/adminPortal/features/checklist"))
      return "4-2";

    if (location.pathname.includes("/adminPortal/investors/pre-seed"))
      return "5-1";
    if (location.pathname.includes("/adminPortal/investors/seed")) return "5-2";
    if (location.pathname.includes("/adminPortal/investors/incubators"))
      return "5-3";
    if (location.pathname.includes("/adminPortal/investors/influencers"))
      return "5-4";
    if (
      location.pathname.includes("/adminPortal/investors/startup-influencers")
    )
      return "5-5";
    if (location.pathname.includes("/adminPortal/investors/angel-investors"))
      return "5-6";

    if (
      location.pathname.includes("/adminPortal/resource-management/influencers")
    )
      return "6-1";

    if (
      location.pathname.includes(
        "/adminPortal/notification-management/notifications"
      )
    )
      return "7-1";

    if (location.pathname.includes("/admin-settings")) return "8";

    return "";
  };

  const profileMenu = (
    <Menu
      items={[
        {
          key: "1",
          icon: <LogoutOutlined />,
          label: "Logout",
          onClick: handleLogout,
        },
      ]}
    />
  );

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_ADMIN_GOOGLE_CLIENT_ID}>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Sidebar */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          theme="dark"
          breakpoint="lg"
          width={225}
        >
          <div style={{ padding: "16px", textAlign: "center", color: "#fff" }}>
            {adminInfo?.profilePic ? (
              <div className="flex justify-center">
                <img
                  src={adminInfo.profilePic}
                  alt="Admin"
                  style={{
                    width: collapsed ? "40px" : "64px",
                    height: collapsed ? "40px" : "64px",
                    borderRadius: "50%",
                    marginBottom: 16,
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "";
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            ) : (
              <Avatar
                size={collapsed ? 40 : 64}
                icon={<UserOutlined />}
                style={{ marginBottom: 16 }}
              />
            )}
            {!collapsed && (
              <div>
                <div
                  style={{
                    fontWeight: "normal",
                    fontSize: "16px",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  {adminInfo?.adminname || "Loading..."}
                </div>
                <Tag
                  color={
                    adminInfo?.adminrole === "super_admin" ? "red" : "blue"
                  }
                >
                  {adminInfo?.adminrole === "super_admin"
                    ? "Super Admin"
                    : "Admin"}
                </Tag>
                <Divider className="mb-0" />
              </div>
            )}
          </div>
          <Menu
            theme="dark"
            selectedKeys={[getSelectedKey()]} // Dynamic selection
            mode="inline"
            onClick={({ key }) => {
              if (key === "1") navigate("/adminPortal/dashboard");
              if (key === "2") navigate("/adminPortal/user-settings");

              if (key === "3-1")
                navigate("/adminPortal/analytics/user-analytics");
              if (key === "3-2") navigate("/adminPortal/analytics/trends");

              if (key === "4-1") navigate("/adminPortal/features/faqs");
              if (key === "4-2") navigate("/adminPortal/features/checklist");

              if (key === "5-1") navigate("/adminPortal/investors/pre-seed");
              if (key === "5-2") navigate("/adminPortal/investors/seed");
              if (key === "5-3") navigate("/adminPortal/investors/incubators");
              if (key === "5-4") navigate("/adminPortal/investors/influencers");
              if (key === "5-5")
                navigate("/adminPortal/investors/startup-influencers");
              if (key === "5-6")
                navigate("/adminPortal/investors/angel-investors");

              if (key === "6-1")
                navigate("/adminPortal/resource-management/resources");

              if (key === "7-1")
                navigate("/adminPortal/notification-management/notifications");

              if (key === "8") navigate("/adminPortal/admin-settings");
            }}
            items={[
              {
                key: "1",
                icon: <DashboardOutlined />,
                label: "Dashboard",
              },
              {
                key: "2",
                icon: <UserCog className="w-4 h-4" />,
                label: "User Management",
              },
              {
                key: "3",
                icon: <StockOutlined />,
                label: "Analytics",
                children: [
                  {
                    key: "3-1",
                    icon: <FileTextOutlined />,
                    label: "User-Analytics",
                  },
                  {
                    key: "3-2",
                    icon: <StockOutlined />,
                    label: "Trends",
                  },
                ],
              },
              {
                key: "4",
                icon: <StarsIcon size={14} />,
                label: "Feature Management",
                children: [
                  {
                    key: "4-1",
                    icon: <QuestionCircleOutlined />,
                    label: "FAQ's",
                  },
                  {
                    key: "4-2",
                    icon: <CheckCheckIcon size={14} />,
                    label: "Checklist",
                  },
                ],
              },
              {
                key: "5",
                icon: <TrendingUp size={14} />,
                label: "Investor Management",
                children: [
                  {
                    key: "5-1",
                    icon: <RocketIcon size={14} />,
                    label: "Pre-seed Investors",
                  },
                  {
                    key: "5-2",
                    icon: <ThunderboltOutlined size={14} />,
                    label: "Seed Investors",
                  },
                  {
                    key: "5-3",
                    icon: <GlassWater size={14} />,
                    label: "Incubators",
                  },
                  {
                    key: "5-4",
                    icon: <YoutubeOutlined size={14} />,
                    label: "YT Influencers",
                  },
                  {
                    key: "5-5",
                    icon: <DollarCircleOutlined size={14} />,
                    label: "Startup Influencers",
                  },
                  {
                    key: "5-6",
                    icon: (
                      <img
                        src={angelIconTwo}
                        alt="Angels"
                        className="w-4 h-4"
                      />
                    ),
                    label: "Angel Investors",
                  },
                ],
              },
              {
                key: "6",
                icon: <BookCheck size={14} />,
                label: "Resource Management",
                children: [
                  {
                    key: "6-1",
                    icon: <FolderCheckIcon size={14} />,
                    label: "Resources",
                  },
                ],
              },
              {
                key: "7",
                icon: <BellDotIcon size={14} />,
                label: "Notification Management",
                children: [
                  {
                    key: "7-1",
                    icon: <NewspaperIcon size={14} />,
                    label: "Newsletters + Email",
                  },
                ],
              },
              {
                key: "8",
                icon: <UserCog size={14} />,
                label: "Admin Management",
              },
            ]}
          />
        </Sider>

        {/* Main Layout */}
        <Layout>
          {/* Header */}
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 16px",
              }}
            >
              <div>Admin Dashboard</div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <Switch
                  checked={isDark}
                  onChange={toggleTheme}
                  checkedChildren={<SunOutlined />}
                  unCheckedChildren={<MoonFilled />}
                />

                <Dropdown overlay={profileMenu} placement="bottomRight" arrow>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      gap: "8px",
                    }}
                  >
                    {adminInfo?.profilePic ? (
                      <img
                        src={adminInfo.profilePic}
                        alt="Admin"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          marginRight: "8px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "";
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Avatar
                        icon={<UserOutlined />}
                        style={{ marginRight: "8px" }}
                      />
                    )}
                    <span className="mr-4">
                      {getInitials(adminInfo?.adminname)}
                    </span>
                  </div>
                </Dropdown>
              </div>
            </div>
          </Header>

          {/* Breadcrumb */}
          <Breadcrumb style={{ margin: "16px 16px" }}></Breadcrumb>

          {/* Content */}
          <Content
            style={{
              margin: "0 16px",
              padding: 16,
              background: colorBgContainer,
              borderRadius: "15px",
              marginBottom: "10px",
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </GoogleOAuthProvider>
  );
}
