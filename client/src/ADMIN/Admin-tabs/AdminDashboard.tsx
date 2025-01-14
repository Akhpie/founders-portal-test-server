import React, { useEffect, useState } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  message,
  Tag,
  Progress,
  theme,
} from "antd";
import { ArrowUpOutlined, UserOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import twoFAicon from "../../assets/images/2fa-shield.png";
import LoggedInUserCard from "../admin-components/LoggedInUsersCard";

const { Content } = Layout;
const { Title, Text } = Typography;

interface User {
  fullName: string;
  email: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  phone: string;
  companyName: string;
  companyDescription?: string;
  foundedYear: number;
  linkedinUrl: string;
  industry: string;
  location: string;
  createdAt: string;
  userType?: "founder" | "visitor";
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = theme.useToken();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/user/all-users"
      );
      if (response.data.success) {
        setData(response.data.data);
      } else {
        message.error(response.data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getIndustryData = () => {
    const founders = data.filter((user) => user.userType === "founder");
    const industryCount = founders.reduce((acc, founder) => {
      acc[founder.industry] = (acc[founder.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(industryCount).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getLocationData = () => {
    const locationCount = data.reduce((acc, user) => {
      acc[user.location] = (acc[user.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locationCount)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const getMostCommonIndustries = () => {
    const industryData = getIndustryData();
    return industryData.sort((a, b) => b.value - a.value).slice(0, 5);
  };

  const cardStyle = {
    background: token.colorBgContainer,
    borderRadius: "8px",
  };

  const statCardStyle = (borderColor: string) => ({
    ...cardStyle,
    borderColor,
  });

  const getCompanyAgeDistribution = () => {
    const currentYear = new Date().getFullYear();
    const founders = data.filter((user) => user.userType === "founder");
    const ageRanges = {
      "0-2 years": 0,
      "3-5 years": 0,
      "6-10 years": 0,
      "10+ years": 0,
    };

    founders.forEach((founder) => {
      const age = currentYear - founder.foundedYear;
      if (age <= 2) ageRanges["0-2 years"]++;
      else if (age <= 5) ageRanges["3-5 years"]++;
      else if (age <= 10) ageRanges["6-10 years"]++;
      else ageRanges["10+ years"]++;
    });

    return Object.entries(ageRanges).map(([range, count]) => ({
      name: range,
      value: count,
    }));
  };

  const getAverageAgeByIndustry = () => {
    const currentYear = new Date().getFullYear();
    const founders = data.filter((user) => user.userType === "founder");
    const industryAges: Record<string, number[]> = {};

    founders.forEach((founder) => {
      const age = currentYear - founder.foundedYear;
      if (!industryAges[founder.industry]) {
        industryAges[founder.industry] = [];
      }
      industryAges[founder.industry].push(age);
    });

    return Object.entries(industryAges).map(([industry, ages]) => ({
      industry,
      averageAge: Math.round(
        ages.reduce((sum, age) => sum + age, 0) / ages.length
      ),
    }));
  };

  return (
    <Content style={{ margin: "16px" }}>
      <Title level={3} style={{ marginBottom: 16, color: token.colorText }}>
        Dashboard Overview
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[14, 14]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            style={{
              width: "100%",
              borderRadius: "8px",
              borderColor: "#1890ff",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#1890ff" }}>Total Verified Users</span>
              }
              value={data.filter((user) => user.isVerified).length}
              valueStyle={{ color: "#1890ff" }}
              prefix={
                <ArrowUpOutlined
                  style={{ color: "#1890ff" }}
                  className="bounce-icon"
                />
              }
              suffix="↑"
              valueRender={(node) => (
                <CountUp
                  start={0}
                  end={data.filter((user) => user.isVerified).length}
                  duration={1.5}
                  separator=","
                  decimals={0}
                  decimal="."
                />
              )}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            style={{
              width: "100%",
              borderRadius: "8px",
              borderColor: "#00aa63",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#00aa63" }}>2FA Enabled Users</span>
              }
              value={data.filter((user) => user.twoFactorEnabled).length}
              precision={0}
              valueStyle={{ color: "#00aa63" }}
              prefix={
                <img
                  src={twoFAicon}
                  alt="Custom Icon"
                  style={{
                    width: "24px",
                    height: "24px",
                    marginRight: "5px",
                  }}
                />
              }
              valueRender={(node) => (
                <CountUp
                  start={0}
                  end={data.filter((user) => user.twoFactorEnabled).length}
                  duration={1.5}
                  separator=","
                  decimals={0}
                  decimal="."
                />
              )}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            style={{
              width: "100%",
              borderRadius: "8px",
              borderColor: "#722ed1",
            }}
          >
            <Statistic
              title={<span style={{ color: "#722ed1" }}>Total Founders</span>}
              value={data.filter((user) => user.userType === "founder").length}
              precision={0}
              valueStyle={{ color: "#722ed1" }}
              prefix={<UserOutlined style={{ color: "#722ed1" }} />}
              valueRender={(node) => (
                <CountUp
                  start={0}
                  end={
                    data.filter((user) => user.userType === "founder").length
                  }
                  duration={1.5}
                  separator=","
                  decimals={0}
                  decimal="."
                />
              )}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            style={{
              width: "100%",
              borderRadius: "8px",
              borderColor: "#eb2f96",
            }}
          >
            <Statistic
              title={<span style={{ color: "#eb2f96" }}>Total Visitors</span>}
              value={data.filter((user) => user.userType === "visitor").length}
              precision={0}
              valueStyle={{ color: "#eb2f96" }}
              prefix={<UserOutlined style={{ color: "#eb2f96" }} />}
              valueRender={(node) => (
                <CountUp
                  start={0}
                  end={
                    data.filter((user) => user.userType === "visitor").length
                  }
                  duration={1.5}
                  separator=","
                  decimals={0}
                  decimal="."
                />
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[14, 14]} style={{ marginTop: "16px" }}>
        <Col xs={24} sm={24} md={12} lg={8}>
          <Card title="Industry Distribution" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient
                      key={`gradient-${index}`}
                      id={`gradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.8} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={getIndustryData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={true}
                >
                  {getIndustryData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-${index})`}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: token.colorBgElevated,
                    borderColor: token.colorBorder,
                    color: token.colorText,
                    borderRadius: "8px",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: token.colorText }}>{value}</span>
                  )}
                  wrapperStyle={{ padding: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={12} lg={8}>
          <Card
            title={
              <Text strong style={{ color: token.colorText }}>
                Top 5 Industries
              </Text>
            }
            style={cardStyle}
          >
            {getMostCommonIndustries().map((industry, index) => (
              <div
                key={industry.name}
                style={{
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px",
                  backgroundColor:
                    index % 2 === 0 ? token.colorFillAlter : "transparent",
                  borderRadius: "4px",
                }}
              >
                <span>{industry.name}</span>
                <Tag color={COLORS[index % COLORS.length]}>
                  {industry.value} companies
                </Tag>
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} sm={24} md={12} lg={8}>
          <Card
            title={
              <Text strong style={{ color: token.colorText }}>
                Geographic Distribution
              </Text>
            }
            style={cardStyle}
          >
            {getLocationData().map((location, index) => (
              <div
                key={location.name}
                style={{
                  marginBottom: 10,
                  padding: "8px",
                  backgroundColor:
                    index % 2 === 0 ? token.colorFillAlter : "transparent",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{location.name}</span>
                  <span>
                    {Math.round((location.value / data.length) * 100)}%
                  </span>
                </div>
                <Progress
                  percent={Math.round((location.value / data.length) * 100)}
                  showInfo={false}
                  strokeColor={COLORS[index % COLORS.length]}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Row gutter={[14, 14]} style={{ marginTop: "16px" }}>
        <Col xs={24} sm={24} md={12}>
          <Card
            title={
              <Text strong style={{ color: token.colorText }}>
                Company Age Distribution
              </Text>
            }
            style={cardStyle}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient
                      key={`age-gradient-${index}`}
                      id={`age-gradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.8} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={getCompanyAgeDistribution()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {getCompanyAgeDistribution().map((entry, index) => (
                    <Cell
                      key={`age-cell-${index}`}
                      fill={`url(#age-gradient-${index})`}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: token.colorBgElevated,
                    borderColor: token.colorBorder,
                    color: token.colorText,
                    borderRadius: "8px",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                  }}
                  formatter={(value, name) => [`${value} companies`, name]}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: token.colorText }}>{value}</span>
                  )}
                  wrapperStyle={{ padding: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={12}>
          <Card
            title={
              <Text strong style={{ color: token.colorText }}>
                Average Company Age by Industry
              </Text>
            }
            style={cardStyle}
          >
            {getAverageAgeByIndustry().map((item, index) => (
              <div
                key={item.industry}
                style={{
                  marginBottom: 16,
                  padding: "12px",
                  backgroundColor:
                    index % 2 === 0 ? token.colorFillAlter : "transparent",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    color: token.colorText,
                  }}
                >
                  <Text strong style={{ color: token.colorText }}>
                    {item.industry}
                  </Text>
                  <Text style={{ color: token.colorText }}>
                    {item.averageAge} years
                  </Text>
                </div>
                <Progress
                  percent={(item.averageAge / 20) * 100}
                  showInfo={false}
                  strokeColor={COLORS[index % COLORS.length]}
                  trailColor={token.colorFillSecondary}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default AdminDashboard;
