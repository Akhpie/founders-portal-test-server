import React, { useState, useEffect } from "react";
import { Card, Typography, Row, Col, Badge, Statistic } from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";

const { Text } = Typography;

interface LoggedInUser {
  userId: string;
  email: string;
  fullName: string;
  userType: "founder" | "visitor";
  lastActive: Date;
}

const LoggedInUsersCard = () => {
  const [loggedInUsers, setLoggedInUsers] = useState<LoggedInUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchLoggedInUsers = async () => {
      try {
        const response = await axios.get(
          "https://founders-portal-test-server-apii.onrender.com/api/logged-in-users"
        );
        if (response.data.success) {
          setLoggedInUsers(response.data.data);
          setTotalUsers(response.data.totalUsers);
        }
      } catch (error) {
        console.error("Failed to fetch logged-in users:", error);
      }
    };

    fetchLoggedInUsers();
    const interval = setInterval(fetchLoggedInUsers, 10000);

    return () => clearInterval(interval);
  }, []);

  const founderCount = loggedInUsers.filter(
    (user) => user.userType === "founder"
  ).length;
  const visitorCount = loggedInUsers.filter(
    (user) => user.userType === "visitor"
  ).length;

  return (
    <Card style={{ borderRadius: "8px", borderColor: "#1890ff" }}>
      <Statistic
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>Currently Logged In</Text>
            <Badge
              count={loggedInUsers.length}
              style={{ backgroundColor: "#52c41a" }}
            >
              <UserOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            </Badge>
          </div>
        }
        value={loggedInUsers.length}
        suffix={`/ ${totalUsers} total users`}
        valueStyle={{ color: "#1890ff" }}
      />

      <div style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Active Founders"
              value={founderCount}
              valueStyle={{ fontSize: "16px", color: "#722ed1" }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Active Visitors"
              value={visitorCount}
              valueStyle={{ fontSize: "16px", color: "#eb2f96" }}
            />
          </Col>
        </Row>
      </div>

      {loggedInUsers.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {loggedInUsers.map((user) => (
            <Badge
              key={user.userId}
              status="success"
              text={
                <Text
                  style={{
                    color: user.userType === "founder" ? "#722ed1" : "#eb2f96",
                  }}
                >
                  {user.fullName}
                </Text>
              }
              style={{ display: "block", marginBottom: 4 }}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default LoggedInUsersCard;
