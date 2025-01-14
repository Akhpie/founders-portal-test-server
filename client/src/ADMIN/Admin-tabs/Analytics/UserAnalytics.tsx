import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Tabs,
  Space,
  Button,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  UserOutlined,
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import axios from "axios";
import LoggedInUsersCard from "../../admin-components/LoggedInUsersCard";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface UserActivity {
  userId: string;
  fullName: string;
  email: string;
  userType: string;
  deviceInfo?: string;
  lastActive: Date;
}

interface GrowthData {
  date: string;
  founders: number;
  visitors: number;
  total: number;
}

interface GrowthDataResponse {
  _id: string;
  count: number;
}

interface RawGrowthData {
  founders: GrowthDataResponse[];
  visitors: GrowthDataResponse[];
}

const UserAnalytics = () => {
  const [activeUsers, setActiveUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);

  useEffect(() => {
    fetchActiveUsers();
    fetchGrowthData();
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchGrowthData = async () => {
    setChartLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/user/user-growth"
      );
      if (response.data.success) {
        const processedData = processGrowthData(response.data.data);
        setGrowthData(processedData);
      }
    } catch (error) {
      console.error("Error fetching growth data:", error);
      message.error("Failed to fetch user growth data");
    } finally {
      setChartLoading(false);
    }
  };

  const processGrowthData = (data: RawGrowthData): GrowthData[] => {
    const combined: GrowthData[] = data.founders.map(
      (item: GrowthDataResponse) => ({
        date: item._id,
        founders: item.count,
        visitors: 0,
        total: item.count,
      })
    );

    data.visitors.forEach((item: GrowthDataResponse) => {
      const existingEntry = combined.find(
        (d: GrowthData) => d.date === item._id
      );
      if (existingEntry) {
        existingEntry.visitors = item.count;
        existingEntry.total = existingEntry.founders + item.count;
      } else {
        combined.push({
          date: item._id,
          founders: 0,
          visitors: item.count,
          total: item.count,
        });
      }
    });

    return combined.sort((a: GrowthData, b: GrowthData) =>
      a.date.localeCompare(b.date)
    );
  };

  const fetchActiveUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/logged-in-users"
      );
      if (response.data.success) {
        setActiveUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching active users:", error);
      message.error("Failed to fetch active users");
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceInfo?: string) => {
    if (!deviceInfo) return <LaptopOutlined style={{ color: "#722ed1" }} />;

    const device = deviceInfo.toLowerCase();
    if (device.includes("mobile")) {
      return <MobileOutlined style={{ color: "#1890ff" }} />;
    } else if (device.includes("tablet")) {
      return <TabletOutlined style={{ color: "#52c41a" }} />;
    }
    return <LaptopOutlined style={{ color: "#722ed1" }} />;
  };

  const columns = [
    {
      title: "User",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "userType",
      key: "userType",
      render: (type: string) => (
        <Tag color={type === "founder" ? "purple" : "green"}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Device",
      dataIndex: "deviceInfo",
      key: "deviceInfo",
      render: (deviceInfo?: string) => (
        <Tooltip title={deviceInfo || "Unknown Device"}>
          <Space>
            {getDeviceIcon(deviceInfo)}
            {deviceInfo || "Unknown Device"}
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Last Active",
      dataIndex: "lastActive",
      key: "lastActive",
      render: (date: string) => {
        try {
          return new Date(date).toLocaleString();
        } catch {
          return "Invalid Date";
        }
      },
    },
  ];

  const getDeviceStats = () => {
    const stats = {
      mobile: 0,
      tablet: 0,
      desktop: 0,
    };

    activeUsers.forEach((user) => {
      if (!user.deviceInfo) {
        stats.desktop++;
        return;
      }

      const device = user.deviceInfo.toLowerCase();
      if (device.includes("mobile")) stats.mobile++;
      else if (device.includes("tablet")) stats.tablet++;
      else stats.desktop++;
    });

    return stats;
  };

  const deviceStats = getDeviceStats();

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2}>User Analytics</Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <LoggedInUsersCard />

              <Card title="Device Distribution">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Space>
                      <LaptopOutlined style={{ color: "#722ed1" }} />
                      <Text>Desktop: {deviceStats.desktop}</Text>
                    </Space>
                  </div>
                  <div>
                    <Space>
                      <MobileOutlined style={{ color: "#1890ff" }} />
                      <Text>Mobile: {deviceStats.mobile}</Text>
                    </Space>
                  </div>
                  <div>
                    <Space>
                      <TabletOutlined style={{ color: "#52c41a" }} />
                      <Text>Tablet: {deviceStats.tablet}</Text>
                    </Space>
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>

          <Col xs={24} md={16} lg={16}>
            <Card
              title={
                <Space>
                  <LineChartOutlined />
                  User Growth Trends (Last 30 Days)
                </Space>
              }
              loading={chartLoading}
            >
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={growthData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value: number, name: string) => [
                      value,
                      name.charAt(0).toUpperCase() + name.slice(1),
                    ]}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString()
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="founders"
                    stroke="#722ed1"
                    name="Founders"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="green"
                    name="Visitors"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#1890ff"
                    name="Total Users"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Card>
          <Table
            columns={columns}
            dataSource={activeUsers}
            loading={loading}
            rowKey="userId"
            pagination={{ pageSize: 10 }}
            title={() => <Text strong>Currently Active Users</Text>}
            scroll={{ x: 1000 }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default UserAnalytics;
