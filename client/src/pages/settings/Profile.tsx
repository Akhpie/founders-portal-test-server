import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Typography, Upload, Modal } from "antd";
import axios from "axios";
import { UserOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { confirm } = Modal;

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const [form] = Form.useForm();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [userType, setUserType] = useState<"founder" | "visitor">("founder");
  const navigate = useNavigate();

  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType") as
      | "founder"
      | "visitor";
    if (storedUserType) {
      setUserType(storedUserType);
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("You must be logged in to view your profile.");
          return;
        }

        // Choose endpoint based on user type
        const endpoint =
          storedUserType === "visitor"
            ? "http://localhost:5000/api/visitor/profile"
            : "http://localhost:5000/api/profile";

        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfileData(response.data.data);
        form.setFieldsValue(response.data.data);
      } catch (error) {
        message.error("Failed to fetch profile data.");
      }
    };

    fetchProfile();
  }, [form]);

  const handleUpdateProfile = async (updatedData: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("You must be logged in to update your profile.");
        return;
      }

      // Choose endpoint based on user type
      const endpoint =
        userType === "visitor"
          ? "http://localhost:5000/api/visitor/profile-update"
          : "http://localhost:5000/api/profile-update";

      const response = await axios.put(endpoint, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        message.success("Profile updated successfully!");
        setProfileData(response.data.data);
        form.setFieldsValue(response.data.data);
      }
    } catch (error) {
      message.error("Failed to update profile.");
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: "Are you sure you want to delete your account?",
      icon: <ExclamationCircleOutlined />,
      content:
        "This action cannot be undone. All your data will be permanently deleted.",
      okText: "Yes, delete my account",
      okType: "danger",
      cancelText: "No, keep my account",
      onOk() {
        setIsDeleteModalVisible(true);
      },
    });
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");
      const currentUserType = localStorage.getItem("userType");

      if (!token) {
        message.error("You must be logged in to delete your account.");
        return;
      }

      // Choose endpoint based on user type
      const endpoint =
        currentUserType === "visitor"
          ? "http://localhost:5000/api/visitor/delete-account"
          : "http://localhost:5000/api/twofa/delete-account";

      await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          password: deletePassword,
        },
      });

      message.success("Account successfully deleted");
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      navigate("/login");
    } catch (error: any) {
      console.error("Delete account error:", error);
      message.error(
        error.response?.data?.message || "Failed to delete account"
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteModalVisible(false);
      setDeletePassword("");
    }
  };

  return (
    <div>
      <Title level={2}>Profile Settings</Title>
      <Form
        form={form}
        initialValues={profileData}
        onFinish={handleUpdateProfile}
        layout="vertical"
      >
        <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-full">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
              profileData?.email || "default"
            }`}
            alt="Profile Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <Form.Item label="Full Name" name="fullName" className="mt-4">
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>
        <Form.Item label="Location" name="location">
          <Input />
        </Form.Item>

        {userType === "founder" ? (
          // Founder-specific fields
          <>
            <Form.Item label="Company Name" name="companyName">
              <Input />
            </Form.Item>
            <Form.Item label="Year Founded" name="foundedYear">
              <Input />
            </Form.Item>
            <Form.Item label="Company Description" name="companyDescription">
              <Input.TextArea rows={4} />
            </Form.Item>
          </>
        ) : (
          // Visitor-specific fields
          <Form.Item label="Company Working At" name="companyWorkingAt">
            <Input />
          </Form.Item>
        )}

        <Form.Item label="LinkedIn URL" name="linkedinUrl">
          <Input type="url" />
        </Form.Item>

        <Form.Item>
          <div className="flex flex-col sm:justify-between sm:flex-row gap-4">
            <Button type="primary" htmlType="submit" className="w-full sm:w-40">
              Update Profile
            </Button>
            <Button
              danger
              onClick={showDeleteConfirm}
              className="w-full sm:w-40"
            >
              Delete Account
            </Button>
          </div>
        </Form.Item>
      </Form>

      {/* Keep existing delete account modal */}
      <Modal
        title="Confirm Account Deletion"
        open={isDeleteModalVisible}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setDeletePassword("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsDeleteModalVisible(false);
              setDeletePassword("");
            }}
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={isDeleting}
            onClick={handleDeleteAccount}
            disabled={!deletePassword}
          >
            Delete Account
          </Button>,
        ]}
      >
        <p>Please enter your password to confirm account deletion:</p>
        <Input.Password
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          placeholder="Enter your password"
        />
      </Modal>
    </div>
  );
};

export default Profile;
