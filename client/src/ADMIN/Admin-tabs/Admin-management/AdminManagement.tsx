// import React from "react";

// type Props = {};

// const AdminManagement = (props: Props) => {
//   return <div>AdminManagement</div>;
// };

// export default AdminManagement;

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Switch,
  Tag,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface AdminUser {
  _id: string;
  adminemail: string; // Changed from email
  adminname: string; // Changed from name
  adminrole: "super_admin" | "admin"; // Changed from role
  status: "active" | "inactive";
  dateAdded: string;
  lastLogin: string;
  addedBy: string;
}

const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  useEffect(() => {
    fetchAdmins();
    fetchCurrentUserRole();
  }, []);

  useEffect(() => {
    console.log("Current admins state:", admins);
  }, [admins]);

  const fetchCurrentUserRole = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/current-user",
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch user role");
      const data = await response.json();
      setCurrentUserRole(data.adminrole);
    } catch (error) {
      console.error("Error fetching user role:", error);
      message.error("Failed to fetch user role");
    }
  };

  // const fetchAdmins = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       "http://localhost:5000/api/admin/admin-users",
  //       {
  //         credentials: "include",
  //       }
  //     );
  //     const data = await response.json();
  //     setAdmins(data);
  //   } catch (error) {
  //     message.error("Failed to fetch admin users");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      console.log("Fetching admins...");
      const response = await fetch(
        "http://localhost:5000/api/admin/admin-users",
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);

      if (Array.isArray(data)) {
        setAdmins(data);
        console.log("Updated admins state:", data);
      } else {
        console.error("Received non-array data:", data);
        setAdmins([]);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      message.error("Failed to fetch admin users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = async (values: any) => {
    try {
      const url = editingId
        ? `http://localhost:5000/api/admin/admin-users/${editingId}`
        : "http://localhost:5000/api/admin/admin-users";

      const method = editingId ? "PUT" : "POST";

      // Get status value from the form
      const formValues = {
        ...values,
        status: values.status ? "active" : "inactive",
        adminrole: values.adminrole || "admin",
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Add this to include cookies
        body: JSON.stringify(formValues),
      });

      if (!response.ok) throw new Error("Operation failed");

      message.success(
        `Admin user ${editingId ? "updated" : "added"} successfully`
      );
      setModalVisible(false);
      form.resetFields();
      fetchAdmins();
    } catch (error) {
      message.error("Operation failed");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/admin-users/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Delete failed");

      message.success("Admin user deleted successfully");
      fetchAdmins();
    } catch (error) {
      message.error("Failed to delete admin user");
    }
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: "Name",
      dataIndex: "adminname",
      key: "adminname",
    },
    {
      title: "Email",
      dataIndex: "adminemail",
      key: "adminemail",
    },
    {
      title: "Role",
      dataIndex: "adminrole",
      key: "adminrole",
      render: (adminrole: string) => (
        <Tag color={adminrole === "super_admin" ? "red" : "blue"}>
          {adminrole.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "gray"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Added By",
      dataIndex: "addedBy",
      key: "addedBy",
    },
    {
      title: "Date Added",
      dataIndex: "dateAdded",
      key: "dateAdded",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "Never",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingId(record._id);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
            disabled={currentUserRole !== "super_admin"}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
            disabled={
              currentUserRole !== "super_admin" ||
              record.adminrole === "super_admin"
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1>Admin Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}
          disabled={currentUserRole !== "super_admin"}
        >
          Add Admin
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={admins}
        loading={loading}
        rowKey="_id"
        pagination={{
          total: admins.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        locale={{
          emptyText: "No data",
        }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingId ? "Edit Admin" : "Add New Admin"}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddEdit}>
          <Form.Item
            name="adminname" // Changed from name
            label="Name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="adminemail" // Changed from email
            label="Email"
            rules={[
              { required: true, message: "Please input the email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="adminrole" // Changed from role
            label="Role"
            rules={[{ required: true, message: "Please select the role!" }]}
          >
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              {currentUserRole === "super_admin" && (
                <Select.Option value="super_admin">Super Admin</Select.Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              defaultChecked
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminManagement;
