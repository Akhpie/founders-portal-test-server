import React, { useState } from "react";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Space,
  message,
  Checkbox,
  Modal,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import RegisterModal from "./RegisterModal";
import "../styles/LoginPage.css";

const { Content } = Layout;
const { Title, Link } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // New state for 2FA
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [loginCredentials, setLoginCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const handleSuccessfulLogin = (token: string, userType: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userType", userType);
    localStorage.setItem("lastActive", new Date().toISOString());
    setAuthenticated(true);
    message.success("Login successful!");
    navigate("/portal");
  };

  const onLoginFinish = async (values: any) => {
    setIsLoading(true);
    try {
      setLoginCredentials({
        email: values.email,
        password: values.password,
      });

      // Try both user types in sequence
      try {
        const response = await axios.post("http://localhost:5000/api/login", {
          email: values.email,
          password: values.password,
        });

        console.log("Login response:", response.data);

        if (response.data.need2FA) {
          setTempToken(response.data.tempToken);
          setShowTwoFactorModal(true);
        } else if (response.data.success) {
          handleSuccessfulLogin(response.data.token, "founder");
        } else {
          throw new Error("First login attempt failed");
        }
      } catch (firstError) {
        console.log("Trying visitor login...");
        const visitorResponse = await axios.post(
          "http://localhost:5000/api/visitor/login",
          {
            email: values.email,
            password: values.password,
          }
        );

        if (visitorResponse.data.success) {
          handleSuccessfulLogin(visitorResponse.data.token, "visitor");
        } else {
          throw new Error("Invalid credentials");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Invalid email or password.";
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async () => {
    setIsLoading(true);
    if (!loginCredentials) {
      message.error("Login information missing. Please try again.");
      setShowTwoFactorModal(false);
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = tempToken.includes("visitor")
        ? "http://localhost:5000/api/visitor/login"
        : "http://localhost:5000/api/login";

      const response = await axios.post(endpoint, {
        email: loginCredentials.email,
        password: loginCredentials.password,
        totpCode: twoFactorCode,
      });

      if (response.data.success) {
        handleSuccessfulLogin(
          response.data.token,
          response.data.userType || "founder"
        );
        setShowTwoFactorModal(false);
        setTwoFactorCode("");
        setLoginCredentials(null);
      } else {
        message.error(response.data.message || "Invalid 2FA code");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to verify 2FA code";
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (values: { email: string }) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/request-password-reset",
        { email: values.email }
      );

      if (response.data.success) {
        message.success("Password reset link has been sent to your email.");
      } else {
        message.error(response.data.message || "Failed to send reset link.");
      }
    } catch (error: any) {
      console.error("Error sending password reset link:", error);
      message.error(
        error.response?.data?.message || "Failed to send reset link"
      );
    } finally {
      setIsLoading(false);
      setIsForgotPasswordModalOpen(false);
    }
  };

  return (
    <Layout className="min-h-screen fixed inset-0 login-bg">
      <Navbar />
      <Content className="p-6">
        <div className="max-w-xl mx-auto">
          <Card className="shadow-md mt-20 glass-card">
            <Title level={2} className="text-center mb-10">
              Welcome to VentureFlow
            </Title>
            <Form
              name="login"
              layout="vertical"
              onFinish={onLoginFinish}
              className="mt-10"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Email"
                  size="large"
                  disabled={isLoading}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                  disabled={isLoading}
                />
              </Form.Item>

              <Form.Item>
                <Space className="w-full" direction="vertical">
                  <div className="flex justify-between">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox disabled={isLoading}>Remember me</Checkbox>
                    </Form.Item>
                    <Link onClick={() => setIsForgotPasswordModalOpen(true)}>
                      Forgot password?
                    </Link>
                  </div>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={isLoading}
                  >
                    Login
                  </Button>
                </Space>
              </Form.Item>

              <Divider>Don't have an account?</Divider>
              <button
                className="custom-register-btn"
                onClick={() => setIsRegisterModalOpen(true)}
                disabled={isLoading}
              >
                Register
              </button>
            </Form>
          </Card>
        </div>
      </Content>

      {/* Two-Factor Authentication Modal */}
      <Modal
        title="Two-Factor Authentication"
        open={showTwoFactorModal}
        onOk={handleTwoFactorSubmit}
        onCancel={() => {
          setShowTwoFactorModal(false);
          setTwoFactorCode("");
          setLoginCredentials(null);
        }}
        okButtonProps={{
          disabled: twoFactorCode.length !== 6 || isLoading,
          loading: isLoading,
        }}
        cancelButtonProps={{ disabled: isLoading }}
      >
        <div className="space-y-4">
          <p>Please enter the 6-digit code from your authenticator app:</p>
          <Input
            value={twoFactorCode}
            onChange={(e) =>
              setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ""))
            }
            placeholder="Enter 6-digit code"
            maxLength={6}
            autoFocus
            className="text-center text-lg tracking-wide"
            disabled={isLoading}
          />
        </div>
      </Modal>

      {/* Register Modal */}
      <RegisterModal
        visible={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      {/* Forgot Password Modal */}
      <Modal
        title="Forgot Password"
        open={isForgotPasswordModalOpen}
        onCancel={() => setIsForgotPasswordModalOpen(false)}
        footer={null}
        className="forgot-modal-glass"
      >
        <Form name="forgotPassword" onFinish={handleForgotPassword}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
              disabled={isLoading}
            />
          </Form.Item>

          <Form.Item>
            <Space className="w-full">
              <Tooltip title="We'll send you a link to reset your password">
                <InfoCircleOutlined />
              </Tooltip>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="small"
                loading={isLoading}
              >
                Send Reset Link
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
