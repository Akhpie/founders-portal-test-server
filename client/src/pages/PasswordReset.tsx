import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  message,
  Card,
  Typography,
  Space,
  Alert,
} from "antd";
import {
  LockOutlined,
  SecurityScanOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract token from the URL
  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get("token");

  // Set token state if available
  React.useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleResetPassword = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!token) {
      message.error("Invalid or missing token.");
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/reset-password",
        { token, newPassword: values.newPassword }
      );

      if (response.data.message) {
        message.success(response.data.message);
        navigate("/login");
      } else {
        message.error("Failed to reset password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f0f2f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <Card style={{ width: "100%", maxWidth: 420 }}>
          <Alert
            message="Invalid Reset Link"
            description="The password reset link is invalid or has expired. Please request a new password reset link."
            type="error"
            showIcon
            action={
              <Button
                type="primary"
                onClick={() => navigate("/forgot-password")}
              >
                Request New Link
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <SecurityScanOutlined
              style={{
                fontSize: 48,
                color: "#1890ff",
                marginBottom: 16,
                display: "block",
              }}
            />
            <Title level={2} style={{ marginBottom: 8 }}>
              Reset Your Password
            </Title>
            <Text type="secondary">Please enter your new password below</Text>
          </div>

          <Form
            name="resetPassword"
            onFinish={handleResetPassword}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: "Please input your new password!" },
                {
                  min: 8,
                  message: "Password must be at least 8 characters long",
                },
                {
                  pattern: /(?=.*[0-9])/,
                  message: "Password must contain at least one number",
                },
                {
                  pattern: /(?=.*[A-Z])/,
                  message:
                    "Password must contain at least one uppercase letter",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="New Password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={<LoginOutlined />}
              >
                Reset Password
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <Button type="link" onClick={() => navigate("/login")}>
                Back to Login
              </Button>
            </div>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
