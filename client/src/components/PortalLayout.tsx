import {
  Layout,
  Menu,
  Input,
  Dropdown,
  Badge,
  Switch,
  message,
  Tooltip,
} from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";
import axios from "axios";
import {
  HomeOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CheckSquareOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  MoonFilled,
  SunOutlined,
  StockOutlined,
  YoutubeFilled,
  DollarCircleOutlined,
  DollarCircleFilled,
} from "@ant-design/icons";
import { Children, useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { ArrowDownCircleIcon, Rocket } from "lucide-react";
import svgbg from "../assets/images/blob-one.svg";
import { useChecklistStore } from "../store/checklistStore";
import angelIcon from "../assets/images/angel-investor.png";
import influencerIcon from "../assets/images/influencer-icon.png";
import "../styles/PortalLayout.css";

const { Header, Sider, Content } = Layout;
const { Search } = Input;

function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, initAuthListener } = useAuthStore();

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, navigate, location]);

  return isAuthenticated ? <>{children}</> : null;
}

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [checklistProgress, setChecklistProgress] = useState<number>(0);
  const { isDark, toggleTheme } = useThemeStore();
  const progress = useChecklistStore((state) => state.progress);
  const fetchProgress = useChecklistStore((state) => state.fetchProgress);

  const { setAuthenticated, logout, initAuthListener } = useAuthStore(
    (state) => ({
      setAuthenticated: state.setAuthenticated,
      logout: state.logout,
      initAuthListener: state.initAuthListener,
    })
  );

  useEffect(() => {
    fetchProgress();

    // Optional: Refresh every minute
    const interval = setInterval(fetchProgress, 60000);
    return () => clearInterval(interval);
  }, [fetchProgress]);

  // Fetch checklist progress
  const fetchChecklistProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://founders-portal-test-server-apii.onrender.com/api/check/getcheck",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const items = response.data.data;
      if (items.length > 0) {
        const progress = Math.round(
          (items.filter((item: any) => item.done).length / items.length) * 100
        );
        setChecklistProgress(progress);
      }
    } catch (error) {
      console.error("Error fetching checklist progress:", error);
    }
  };

  // Initialize auth listener and fetch initial checklist progress
  useEffect(() => {
    initAuthListener();
    fetchChecklistProgress();
  }, [initAuthListener]);

  // Refresh checklist progress periodically
  useEffect(() => {
    const interval = setInterval(fetchChecklistProgress, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const isHomePage = location.pathname === "/portal";

  const menuItems = [
    { key: "/portal", icon: <HomeOutlined />, label: "Home" },
    {
      key: "investors",
      icon: <StockOutlined />,
      label: "Investors",
      children: [
        {
          key: "/portal/pre-seed",
          icon: <RocketOutlined />,
          label: "Pre-seed",
        },
        { key: "/portal/seed", icon: <ThunderboltOutlined />, label: "Seed" },
        {
          key: "/portal/angel-investors",
          icon: <img src={angelIcon} alt="Angels" className="w-4 h-4" />,
          label: "Angels",
        },
      ],
    },
    {
      key: "/portal/incubators",
      icon: <ExperimentOutlined />,
      label: "Incubators",
    },
    {
      key: "influencers",
      icon: (
        <img
          src={influencerIcon}
          alt="startup-influencers"
          className="w-4 h-4"
        />
      ),
      label: "Influencers",
      children: [
        {
          key: "/portal/yt-startup-influencers",
          icon: <YoutubeFilled />,
          label: "Youtube Influencers",
        },
        {
          key: "/portal/startup-influencers",
          icon: <DollarCircleFilled />,
          label: "Startup Influencers",
        },
      ],
    },
  ];

  const profileMenuItems: MenuProps["items"] = [
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/portal/settings/profile"),
    },
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: "Help",
      onClick: () => navigate("/portal/support"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      children: [
        {
          key: "logout-current",
          label: "Logout from this device",
        },
        {
          key: "logout-all",
          label: "Logout from all devices",
        },
      ],
    },
  ];

  const handleProfileMenuClick = async ({ key }: { key: string }) => {
    if (key === "logout-current") {
      try {
        await logout(false);
        navigate("/");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    } else if (key === "logout-all") {
      try {
        await logout(true);
        navigate("/");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
  };

  return (
    <AuthGuard>
      <Layout style={{ minHeight: "100vh" }} className={isDark ? "dark" : ""}>
        {!isHomePage && (
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme={isDark ? "dark" : "light"}
            className="shadow-sm custom-sider"
            width={220}
            collapsedWidth={60}
            breakpoint="lg"
            onBreakpoint={(broken) => setCollapsed(broken)}
          >
            <div className="p-4">
              <div
                className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 cursor-pointer flex items-center gap-2 ${
                  collapsed ? "text-sm" : ""
                }`}
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
                onClick={() => !collapsed && navigate("/")}
              >
                Gandeeva
                {!collapsed && (
                  <Rocket
                    className="w-6 h-6"
                    style={{
                      stroke: "url(#blue-gradient)",
                      strokeWidth: 2,
                    }}
                  />
                )}
              </div>
              <svg width="0" height="0">
                <defs>
                  <linearGradient
                    id="blue-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              theme={isDark ? "dark" : "light"}
            />
          </Sider>
        )}
        <Layout>
          <Header
            className={`flex items-center justify-between shadow-sm ${
              isDark ? "bg-[#001529] text-white" : "bg-white"
            }`}
            style={{
              borderRadius: "15px",
              margin: "10px",
              padding: "0 14px",
              height: "auto",
              minHeight: "64px",
            }}
          >
            {/* Left section with menu */}
            <div className="flex items-center min-w-0 flex-1">
              {!isHomePage && (
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-lg p-0 mr-4 border-0 bg-transparent cursor-pointer flex-shrink-0"
                >
                  {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </button>
              )}
              <Menu
                mode="horizontal"
                selectedKeys={[location.pathname]}
                className="border-0 min-w-0 flex-shrink"
                items={menuItems}
                onClick={({ key }) => navigate(key)}
                theme={isDark ? "dark" : "light"}
                style={{ flex: 1 }}
              />
            </div>

            {/* Right section with actions */}
            <div className="flex gap-6 text-center align-middle items-center">
              {/* Theme Switch */}
              <div className="mb-2">
                <Switch
                  checked={isDark}
                  onChange={toggleTheme}
                  checkedChildren={<SunOutlined />}
                  unCheckedChildren={<MoonFilled />}
                />
              </div>

              {/* Checklist with Custom Progress Badge */}
              <div className="relative group">
                <div className="relative">
                  <Badge
                    count={
                      <div
                        className={`flex items-center justify-center text-white min-w-[40px] h-5 rounded-full shadow-md transform transition-all duration-300 group-hover:scale-90 ${
                          checklistProgress === 100
                            ? "bg-gradient-to-r from-green-400 to-emerald-500"
                            : "bg-gradient-to-r from-blue-500 to-cyan-500"
                        }`}
                      >
                        <span
                          className="text-xs font-semibold cursor-pointer"
                          onClick={() => navigate("/portal/checklist")}
                        >
                          {/* {checklistProgress}% */}
                          {progress}%
                        </span>
                      </div>
                    }
                    offset={[10, 0]}
                  >
                    <div className="p-2 rounded-lg transition-all duration-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                      <CheckSquareOutlined
                        className={`text-xl cursor-pointer transition-colors duration-300 ${
                          checklistProgress === 100
                            ? "group-hover:text-green-500"
                            : "group-hover:text-blue-500"
                        }`}
                        onClick={() => navigate("/portal/checklist")}
                      />
                    </div>
                  </Badge>
                </div>
              </div>

              {/* Profile Dropdown */}
              <div>
                <Dropdown
                  menu={{
                    items: profileMenuItems,
                    onClick: handleProfileMenuClick,
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                  arrow
                >
                  <UserOutlined className="text-xl cursor-pointer" />
                </Dropdown>
              </div>
            </div>
          </Header>

          {/* Main Content */}
          {/* <Content
            className={`m-6 p-6 rounded-lg relative ${
              isDark ? "" : "bg-white"
            }`}
            style={
              isDark
                ? {
                    backgroundImage: `url(${svgbg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }
                : {}
            }
          >
            <Outlet />
          </Content> */}
          <Content
            className={`m-6 p-6 rounded-lg relative ${
              isDark ? "background-image-class" : "bg-white"
            }`}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </AuthGuard>
  );
}
