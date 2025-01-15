import React, { useState, useEffect } from "react";
import {
  Typography,
  Form,
  Input,
  Button,
  Card,
  Switch,
  Modal,
  message,
} from "antd";
import { QRCode } from "antd";
import axios from "axios";

const { Title } = Typography;

export default function Security() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetup2FAModal, setShowSetup2FAModal] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret?: string;
    otpauthUrl?: string;
  }>({});
  const [verificationCode, setVerificationCode] = useState("");
  const [userType, setUserType] = useState<"founder" | "visitor">("founder");

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType") as
      | "founder"
      | "visitor";
    if (storedUserType) {
      setUserType(storedUserType);
    }
  }, []);

  // Fetch initial 2FA status
  useEffect(() => {
    const fetch2FAStatus = async () => {
      // Only fetch 2FA status if user is a founder
      if (userType === "founder") {
        try {
          const response = await axios.get(
            "https://founders-portal-test-server-apii.onrender.com/api/twofa/2fa-status",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setIs2FAEnabled(response.data.enabled);
        } catch (error) {
          console.error("Error fetching 2FA status:", error);
        }
      } else {
        // For visitors, ensure 2FA is disabled
        setIs2FAEnabled(false);
      }
    };

    fetch2FAStatus();
  }, [userType]);

  const handlePasswordUpdate = async (values: any) => {
    setLoading(true);
    try {
      const endpoint =
        userType === "visitor"
          ? "https://founders-portal-test-server-apii.onrender.com/api/visitor/update-password"
          : "https://founders-portal-test-server-apii.onrender.com/api/twofa/update-password";

      const response = await axios.post(
        endpoint,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        message.success("Password updated successfully");
        form.resetFields();
      }
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handle2FAToggle = async (checked: boolean) => {
    if (checked && !is2FAEnabled) {
      // Initialize 2FA setup
      try {
        const endpoint =
          userType === "visitor"
            ? "https://founders-portal-test-server-apii.onrender.com/api/visitor/setup-2fa"
            : "https://founders-portal-test-server-apii.onrender.com/api/twofa/setup-2fa";

        const response = await axios.post(
          endpoint,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setSetupData({
          secret: response.data.secret,
          otpauthUrl: response.data.otpauthUrl,
        });
        setShowSetup2FAModal(true);
      } catch (error) {
        message.error("Failed to initialize 2FA setup");
      }
    } else if (!checked && is2FAEnabled) {
      // Disable 2FA
      try {
        const endpoint =
          userType === "visitor"
            ? "https://founders-portal-test-server-apii.onrender.com/api/visitor/disable-2fa"
            : "https://founders-portal-test-server-apii.onrender.com/api/twofa/disable-2fa";

        const response = await axios.post(
          endpoint,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          setIs2FAEnabled(false);
          message.success("2FA disabled successfully");
        }
      } catch (error) {
        message.error("Failed to disable 2FA");
      }
    }
  };

  const handleVerify2FA = async () => {
    try {
      const endpoint =
        userType === "visitor"
          ? "https://founders-portal-test-server-apii.onrender.com/api/visitor/verify-2fa-setup"
          : "https://founders-portal-test-server-apii.onrender.com/api/twofa/verify-2fa-setup";

      const response = await axios.post(
        endpoint,
        {
          code: verificationCode,
          secret: setupData.secret,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setIs2FAEnabled(true);
        setShowSetup2FAModal(false);
        message.success("2FA enabled successfully");
      } else {
        message.error("Invalid verification code");
      }
    } catch (error) {
      message.error("Failed to verify 2FA setup");
    }
  };

  return (
    <div>
      <Title level={2}>Security Settings</Title>

      <Card className="mt-6">
        <Form form={form} layout="vertical" onFinish={handlePasswordUpdate}>
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[
              {
                required: true,
                message: "Please input your current password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please input your new password!" },
              { min: 8, message: "Password must be at least 8 characters!" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password!" },
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
            <Input.Password />
          </Form.Item>

          {/* Only show 2FA section for founders */}
          {userType === "founder" && (
            <div className="border-t pt-4 mt-4">
              <Title level={4}>Two-Factor Authentication</Title>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="font-medium">Enable 2FA</div>
                  <div className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </div>
                </div>
                <Switch checked={is2FAEnabled} onChange={handle2FAToggle} />
              </div>
            </div>
          )}

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              Update Security Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 2FA Setup Modal - only for founders */}
      {userType === "founder" && (
        <Modal
          title="Set Up Two-Factor Authentication"
          open={showSetup2FAModal}
          onCancel={() => {
            setShowSetup2FAModal(false);
            setIs2FAEnabled(false);
          }}
          footer={[
            <Button
              key="verify"
              type="primary"
              onClick={handleVerify2FA}
              disabled={!verificationCode}
            >
              Verify and Enable 2FA
            </Button>,
          ]}
        >
          <div className="space-y-4">
            <p>
              1. Scan this QR code with your authenticator app (Google
              Authenticator, Authy, etc.)
            </p>
            <div className="flex justify-center">
              {setupData.otpauthUrl && (
                <QRCode value={setupData.otpauthUrl} size={200} />
              )}
            </div>
            <p>2. Enter the 6-digit code from your authenticator app:</p>
            <Input
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
