import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  message,
  Input,
  Tooltip,
  Typography,
  Descriptions,
  Avatar,
  Menu,
  Dropdown,
  QRCode,
  Form,
  Alert,
  Radio,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  UserOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  EditOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { UploadCloudIcon } from "lucide-react";

const { Title, Text } = Typography;

type ViewType = "all" | "founders" | "visitors";
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
  createdAt: string;
  userType?: "founder" | "visitor";
  companyWorkingAt?: string;
  visitorDetails?: {
    companyWorkingAt: string;
  };
  notificationPreferences?: {
    emailNotifications: {
      newOpportunities: boolean;
      newsletter: boolean;
      applicationUpdates: boolean;
      investorMessages: boolean;
    };
    systemNotifications: {
      taskReminders: boolean;
      deadlineAlerts: boolean;
      newsUpdates: boolean;
    };
  };
}

const AdminUserSettings: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [currentSecret, setCurrentSecret] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{
    otpauth_url: string;
    secret: string;
  } | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: "edit" | "delete";
    record: User | null;
  } | null>(null);
  const [currentAdminRole, setCurrentAdminRole] = useState<string>("");

  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [finalConfirmationCode, setFinalConfirmationCode] = useState("");
  const [verifiedAction, setVerifiedAction] = useState<{
    type: "edit" | "delete";
    record: User | null;
  } | null>(null);

  const [tableFilters, setTableFilters] = useState<{
    verification?: string[];
    twoFactor?: string[];
    industry?: string[];
  }>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [viewType, setViewType] = useState<ViewType>("all");

  const fetchCurrentAdminRole = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/current-user",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentAdminRole(data.adminrole);
      }
    } catch (error) {
      console.error("Error fetching admin role:", error);
    }
  };

  const fetchUserNotifications = async (email: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/notifications/${email}`
      );
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return null;
    }
  };

  // !Generate new secret and QR code
  const setupTwoFactor = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/setup-2fa"
      );
      if (response.data.success) {
        setQrCodeData(response.data.data);
      } else {
        message.error("Failed to setup 2FA");
      }
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      message.error("Failed to setup 2FA");
    }
  };

  // !VERIFY 2FA CODE
  const verifyTwoFactorCode = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/verify-2fa",
        {
          token: verificationCode,
          secret: qrCodeData?.secret,
        }
      );

      if (response.data.success) {
        setCurrentSecret(qrCodeData?.secret || null);
        setVerifiedAction(pendingAction);
        closeSecurityModal();
        setConfirmationModalVisible(true);
        message.success(
          "First verification successful. Please enter a new code for final verification."
        );
      } else {
        message.error("Invalid authentication code");
      }
    } catch (error) {
      console.error("Verification error:", error);
      message.error("Verification failed");
    }
  };

  const handleFinalConfirmation = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/verify-2fa",
        {
          token: finalConfirmationCode,
          secret: currentSecret,
        }
      );

      if (response.data.success) {
        if (verifiedAction?.type === "edit" && verifiedAction.record) {
          handleEdit(verifiedAction.record);
        } else if (verifiedAction?.type === "delete" && verifiedAction.record) {
          handleDelete(verifiedAction.record);
        }
        closeConfirmationModal();
        message.success("Action successfully authenticated and completed");
      } else {
        message.error("Invalid final verification code");
      }
    } catch (error) {
      console.error("Final verification error:", error);
      message.error("Final verification failed");
    }
  };

  const closeConfirmationModal = () => {
    setConfirmationModalVisible(false);
    setFinalConfirmationCode("");
    setVerifiedAction(null);
    setCurrentSecret(null);
  };

  // Close security modal and reset states
  const closeSecurityModal = () => {
    setSecurityModalVisible(false);
    setVerificationCode("");
    setPendingAction(null);
  };

  const triggerEdit = async (record: User) => {
    if (currentAdminRole !== "super_admin") {
      message.error("Only Super Admins can edit users");
      return;
    }
    setPendingAction({ type: "edit", record });
    await setupTwoFactor();
    setSecurityModalVisible(true);
  };

  const triggerDelete = async (record: User) => {
    if (currentAdminRole !== "super_admin") {
      message.error("Only Super Admins can delete users");
      return;
    }
    setPendingAction({ type: "delete", record });
    await setupTwoFactor();
    setSecurityModalVisible(true);
  };

  //! EDIT USER
  const handleEdit = (record: User) => {
    setEditingUser(record);
    editForm.setFieldsValue({
      fullName: record.fullName,
      phone: record.phone,
      companyName: record.companyName,
      companyDescription: record.companyDescription,
      foundedYear: record.foundedYear,
      linkedinUrl: record.linkedinUrl,
      industry: record.industry,
      twoFactorEnabled: record.twoFactorEnabled,
    });
    setEditModalVisible(true);
  };

  // Handle update submission
  const handleUpdate = async (values: any) => {
    if (!editingUser) return;

    try {
      setUpdateLoading(true);
      const response = await axios.patch(
        `http://localhost:5000/api/user/update/${editingUser.email}`,
        values
      );

      if (response.data.success) {
        await fetchUsers();
        message.success("User updated successfully");
        setEditModalVisible(false);
        setEditingUser(null);
        editForm.resetFields();
      } else {
        message.error(response.data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("Error updating user");
    } finally {
      setUpdateLoading(false);
    }
  };

  // ! Fetch data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      let endpoint = "";
      switch (viewType) {
        case "all":
          endpoint = "all-users";
          break;
        case "founders":
          endpoint = "all-founders";
          break;
        case "visitors":
          endpoint = "all-visitors";
          break;
      }

      const response = await axios.get(
        `http://localhost:5000/api/user/${endpoint}`
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

  // ! DELETE USER
  const handleDelete = async (record: User) => {
    try {
      // Set loading state for this specific user
      setDeleteLoading((prev) => ({ ...prev, [record.email]: true }));

      // Make delete request
      const response = await axios.delete(
        `http://localhost:5000/api/user/delete/${record.email}`
      );

      if (response.data.success) {
        message.success(`User ${record.fullName} deleted successfully`);
        // Refresh the user list
        fetchUsers();
      } else {
        message.error(response.data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        message.error("User not found");
      } else {
        message.error("Error deleting user");
      }
    } finally {
      // Clear loading state for this user
      setDeleteLoading((prev) => ({ ...prev, [record.email]: false }));
    }
  };

  // !EXPORT DATA

  const exportSelectedToExcel = async () => {
    try {
      const selectedUsers = data.filter((user) =>
        selectedRowKeys.includes(user.email)
      );

      // Ensure we have notification preferences for all selected users
      const usersWithPreferences = await Promise.all(
        selectedUsers.map(async (user) => {
          if (!user.notificationPreferences) {
            const notifications = await fetchUserNotifications(user.email);
            return {
              ...user,
              notificationPreferences: notifications,
            };
          }
          return user;
        })
      );

      const exportData = usersWithPreferences.map((user) => ({
        "Full Name": user.fullName,
        Email: user.email,
        Phone: user.phone,
        Company: user.companyName,
        "Company Description": user.companyDescription,
        Industry: user.industry,
        Verified: user.isVerified ? "Yes" : "No",
        "2FA Enabled": user.twoFactorEnabled ? "Yes" : "No",
        "Founded Year": user.foundedYear,
        "Created At": dayjs(user.createdAt).format("DD/MM/YYYY"),
        // Email Notifications
        "New Opportunities": user.notificationPreferences?.emailNotifications
          .newOpportunities
          ? "Yes"
          : "No",
        Newsletter: user.notificationPreferences?.emailNotifications.newsletter
          ? "Yes"
          : "No",
        "Application Updates": user.notificationPreferences?.emailNotifications
          .applicationUpdates
          ? "Yes"
          : "No",
        "Investor Messages": user.notificationPreferences?.emailNotifications
          .investorMessages
          ? "Yes"
          : "No",
        // System Notifications
        "Task Reminders": user.notificationPreferences?.systemNotifications
          .taskReminders
          ? "Yes"
          : "No",
        "Deadline Alerts": user.notificationPreferences?.systemNotifications
          .deadlineAlerts
          ? "Yes"
          : "No",
        "News Updates": user.notificationPreferences?.systemNotifications
          .newsUpdates
          ? "Yes"
          : "No",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Selected Users");
      XLSX.writeFile(wb, `selected_users_${dayjs().format("YYYY-MM-DD")}.xlsx`);

      message.success("Export completed successfully");
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export data");
    }
  };

  const exportSelectedToCSV = async () => {
    try {
      const selectedUsers = data.filter((user) =>
        selectedRowKeys.includes(user.email)
      );

      // Ensure we have notification preferences for all selected users
      const usersWithPreferences = await Promise.all(
        selectedUsers.map(async (user) => {
          if (!user.notificationPreferences) {
            const notifications = await fetchUserNotifications(user.email);
            return {
              ...user,
              notificationPreferences: notifications,
            };
          }
          return user;
        })
      );

      const exportData = usersWithPreferences.map((user) => ({
        "Full Name": user.fullName,
        Email: user.email,
        Phone: user.phone,
        Company: user.companyName,
        "Company Description": user.companyDescription,
        Industry: user.industry,
        Verified: user.isVerified ? "Yes" : "No",
        "2FA Enabled": user.twoFactorEnabled ? "Yes" : "No",
        "Founded Year": user.foundedYear,
        "Created At": dayjs(user.createdAt).format("DD/MM/YYYY"),
        // Email Notifications
        "New Opportunities": user.notificationPreferences?.emailNotifications
          .newOpportunities
          ? "Yes"
          : "No",
        Newsletter: user.notificationPreferences?.emailNotifications.newsletter
          ? "Yes"
          : "No",
        "Application Updates": user.notificationPreferences?.emailNotifications
          .applicationUpdates
          ? "Yes"
          : "No",
        "Investor Messages": user.notificationPreferences?.emailNotifications
          .investorMessages
          ? "Yes"
          : "No",
        // System Notifications
        "Task Reminders": user.notificationPreferences?.systemNotifications
          .taskReminders
          ? "Yes"
          : "No",
        "Deadline Alerts": user.notificationPreferences?.systemNotifications
          .deadlineAlerts
          ? "Yes"
          : "No",
        "News Updates": user.notificationPreferences?.systemNotifications
          .newsUpdates
          ? "Yes"
          : "No",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `selected_users_${dayjs().format("YYYY-MM-DD")}.csv`;
      link.click();

      message.success("Export completed successfully");
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export data");
    }
  };

  const exportSelectedToPDF = async () => {
    try {
      const selectedUsers = data.filter((user) =>
        selectedRowKeys.includes(user.email)
      );

      // Ensure we have notification preferences for all selected users
      const usersWithPreferences = await Promise.all(
        selectedUsers.map(async (user) => {
          if (!user.notificationPreferences) {
            const notifications = await fetchUserNotifications(user.email);
            return {
              ...user,
              notificationPreferences: notifications,
            };
          }
          return user;
        })
      );

      const doc = new jsPDF();
      const tableColumn = [
        "Name",
        "Email",
        "Company",
        "Industry",
        "Verified",
        "2FA",
        "Notifications",
      ];
      const tableRows = usersWithPreferences.map((user) => {
        const notificationCount = [
          user.notificationPreferences?.emailNotifications.newOpportunities,
          user.notificationPreferences?.emailNotifications.newsletter,
          user.notificationPreferences?.emailNotifications.applicationUpdates,
          user.notificationPreferences?.emailNotifications.investorMessages,
          user.notificationPreferences?.systemNotifications.taskReminders,
          user.notificationPreferences?.systemNotifications.deadlineAlerts,
          user.notificationPreferences?.systemNotifications.newsUpdates,
        ].filter(Boolean).length;

        return [
          user.fullName,
          user.email,
          user.companyName,
          user.industry,
          user.isVerified ? "Yes" : "No",
          user.twoFactorEnabled ? "Yes" : "No",
          `${notificationCount}/7 enabled`,
        ];
      });

      doc.text("Selected Users Report", 14, 15);
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      doc.save(`selected_users_${dayjs().format("YYYY-MM-DD")}.pdf`);

      message.success("Export completed successfully");
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export data");
    }
  };

  const exportMenu = (
    <Menu>
      <Menu.Item
        key="selected-excel"
        icon={<FileExcelOutlined />}
        onClick={exportSelectedToExcel}
        disabled={selectedRowKeys.length === 0}
      >
        Export Selected to Excel
      </Menu.Item>
      <Menu.Item
        key="selected-csv"
        icon={<FileTextOutlined />}
        onClick={exportSelectedToCSV}
        disabled={selectedRowKeys.length === 0}
      >
        Export Selected to CSV
      </Menu.Item>
      <Menu.Item
        key="selected-pdf"
        icon={<FilePdfOutlined />}
        onClick={exportSelectedToPDF}
        disabled={selectedRowKeys.length === 0}
      >
        Export Selected to PDF
      </Menu.Item>
    </Menu>
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const handleViewDetails = async (record: User) => {
    setSelectedUser(record);
    if (!record.notificationPreferences) {
      const notifications = await fetchUserNotifications(record.email);
      if (notifications) {
        setSelectedUser({ ...record, notificationPreferences: notifications });
      }
    }
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  // Handle search filter
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.toLowerCase());
  };

  // !FILTER OPTIONS
  const filteredData = data.filter((user) => {
    // Text search filter
    const textMatch =
      user.fullName?.toLowerCase().includes(searchText) ||
      user.email?.toLowerCase().includes(searchText) ||
      user.companyName?.toLowerCase().includes(searchText);

    // Verification status filter
    const verificationMatch =
      !tableFilters.verification?.length ||
      tableFilters.verification.includes(
        user.isVerified ? "Verified" : "Not Verified"
      );

    // Two-factor authentication filter
    const twoFactorMatch =
      !tableFilters.twoFactor?.length ||
      tableFilters.twoFactor.includes(
        user.twoFactorEnabled ? "Enabled" : "Disabled"
      );

    // Industry filter
    const industryMatch =
      !tableFilters.industry?.length ||
      tableFilters.industry.includes(user.industry);

    return textMatch && verificationMatch && twoFactorMatch && industryMatch;
  });

  const uniqueIndustries = [...new Set(data.map((user) => user.industry))];

  interface ColumnType {
    title: string;
    dataIndex?: string;
    key: string;
    filters?: { text: string; value: string }[];
    filteredValue?: string[] | null;
    onFilter?: (value: string, record: User) => boolean;
    render?: (value: any, record?: User) => JSX.Element;
  }

  const getColumns = () => {
    const baseColumns: ColumnType[] = [
      {
        title: "Full Name",
        dataIndex: "fullName",
        key: "fullName",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
      },
      {
        title: "Verified",
        dataIndex: "isVerified",
        key: "isVerified",
        filters: [
          { text: "Verified", value: "Verified" },
          { text: "Not Verified", value: "Not Verified" },
        ],
        filteredValue: tableFilters.verification || null,
        onFilter: (value: string, record: User) =>
          value === "Verified" ? record.isVerified : !record.isVerified,
        render: (isVerified: boolean) =>
          isVerified ? (
            <Tag color="green">Verified</Tag>
          ) : (
            <Tag color="red">Not Verified</Tag>
          ),
      },
    ];

    const founderSpecificColumns = [
      {
        title: "2FA Enabled",
        dataIndex: "twoFactorEnabled",
        key: "twoFactorEnabled",
        filters: [
          { text: "Enabled", value: "Enabled" },
          { text: "Disabled", value: "Disabled" },
        ],
        filteredValue: tableFilters.twoFactor || null,
        onFilter: (value: string, record: User) =>
          value === "Enabled"
            ? record.twoFactorEnabled
            : !record.twoFactorEnabled,
        render: (twoFactorEnabled: boolean) =>
          twoFactorEnabled ? (
            <Tag color="green">YES</Tag>
          ) : (
            <Tag color="red">NO</Tag>
          ),
      },
      {
        title: "Company",
        dataIndex: "companyName",
        key: "companyName",
      },
      {
        title: "Industry",
        dataIndex: "industry",
        key: "industry",
        filters: uniqueIndustries.map((industry) => ({
          text: industry,
          value: industry,
        })),
        filteredValue: tableFilters.industry || null,
        onFilter: (value: string, record: User) => record.industry === value,
      },
    ];

    const visitorSpecificColumns = [
      {
        title: "Company Working At",
        dataIndex: "companyWorkingAt",
        key: "companyWorkingAt",
      },
    ];

    const actionColumn = {
      title: "Actions",
      key: "actions",
      render: (record: User) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="primary"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {currentAdminRole === "super_admin" &&
            record.userType === "founder" && (
              <>
                <Tooltip title="Edit">
                  <Button
                    type="default"
                    shape="circle"
                    icon={<EditOutlined />}
                    onClick={() => triggerEdit(record)}
                  />
                </Tooltip>
                <Tooltip title="Delete">
                  <Button
                    type="primary"
                    danger
                    shape="circle"
                    icon={<DeleteOutlined />}
                    onClick={() => triggerDelete(record)}
                    loading={deleteLoading[record.email]}
                  />
                </Tooltip>
              </>
            )}
        </Space>
      ),
    };

    let columns = [...baseColumns];

    if (viewType === "all") {
      columns.push({
        title: "User Type",
        dataIndex: "userType",
        key: "userType",
        render: (type: string) => (
          <Tag color={type === "founder" ? "blue" : "green"}>
            {type?.toUpperCase()}
          </Tag>
        ),
      });
    }
    if (viewType === "founders") {
      columns = [...columns, ...founderSpecificColumns];
    } else if (viewType === "visitors") {
      columns = [...columns, ...visitorSpecificColumns];
    } else if (viewType === "all") {
      // For "all" view, show relevant columns based on user type
      const combinedColumns = [
        ...founderSpecificColumns,
        ...visitorSpecificColumns,
      ];
      columns = [...columns, ...combinedColumns];
    }

    columns.push(actionColumn);
    return columns;
  };

  // Handle table filter changes
  const handleTableChange = (pagination, filters) => {
    setTableFilters({
      verification: filters.isVerified,
      twoFactor: filters.twoFactorEnabled,
      industry: filters.industry,
    });
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentAdminRole();
  }, [viewType]);

  return (
    <div style={{ padding: "20px" }}>
      {currentAdminRole !== "super_admin" && (
        <Alert
          message="Note"
          description="You have view-only access. Only Super Admins can edit or delete users."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <div style={{ marginBottom: 20 }}>
        <Radio.Group
          value={viewType}
          onChange={(e) => setViewType(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          size="large"
        >
          <Radio.Button value="all">All Users</Radio.Button>
          <Radio.Button value="founders">Founders</Radio.Button>
          <Radio.Button value="visitors">Visitors</Radio.Button>
        </Radio.Group>
      </div>

      {/* Search Bar */}
      <Input.Search
        placeholder="Search by name, email, or company"
        onChange={handleSearch}
        style={{ marginBottom: 20, width: "100%", maxWidth: 400 }}
      />

      {/* Export Button */}
      <div style={{ marginBottom: 16 }}>
        {selectedRowKeys.length > 0 && (
          <Typography.Text style={{ marginRight: 16 }}>
            {selectedRowKeys.length} user(s) selected
          </Typography.Text>
        )}
        <Dropdown overlay={exportMenu}>
          <Button icon={<DownloadOutlined />}>Export Data</Button>
        </Dropdown>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={getColumns()}
        dataSource={filteredData}
        loading={loading}
        rowKey={(record) => record.email}
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
        }}
        onChange={handleTableChange}
        expandable={{
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>
              <Tag>About</Tag>
              {record.companyDescription || "No Description Available"}
            </p>
          ),
          rowExpandable: (record) => record.userType === "founder",
        }}
      />
      {/* //! VIEW MODAL */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              size={48}
              icon={<UserOutlined />}
              style={{
                marginRight: 16,
                backgroundColor: "#1890ff",
                marginBottom: 10,
              }}
            />
            <Title level={4} style={{ margin: 0 }}>
              User Details
            </Title>
          </div>
        }
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose} type="primary">
            Close
          </Button>,
        ]}
        centered
        width={800}
      >
        {selectedUser && (
          <Descriptions
            bordered
            size="small"
            column={1}
            labelStyle={{ fontWeight: "bold" }}
          >
            {/* Base information shown for all users */}
            <Descriptions.Item label="Name">
              {selectedUser.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedUser.phone}
            </Descriptions.Item>

            {/* Conditional rendering based on view type and user type */}
            {(viewType === "all" || viewType === "founders") &&
              (selectedUser.userType === "founder" ||
                viewType === "founders") && (
                <>
                  <Descriptions.Item label="Company">
                    {selectedUser.companyName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Industry">
                    {selectedUser.industry}
                  </Descriptions.Item>
                  <Descriptions.Item label="Founded Year">
                    {selectedUser.foundedYear}
                  </Descriptions.Item>
                  <Descriptions.Item label="2FA Enabled">
                    {selectedUser.twoFactorEnabled ? "Yes" : "No"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Linkedin Url">
                    <a
                      href={selectedUser.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedUser.linkedinUrl}
                    </a>
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">
                    {selectedUser.companyDescription ||
                      "No Description Available"}
                  </Descriptions.Item>
                </>
              )}

            {(viewType === "all" || viewType === "visitors") &&
              (selectedUser.userType === "visitor" ||
                viewType === "visitors") && (
                <Descriptions.Item label="Company Working At">
                  {selectedUser.visitorDetails?.companyWorkingAt ||
                    selectedUser.companyWorkingAt ||
                    "Not specified"}
                </Descriptions.Item>
              )}

            {/* Notification Preferences */}
            <Descriptions.Item label="Email Notifications">
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div>
                  New Opportunities:{" "}
                  {selectedUser.notificationPreferences?.emailNotifications
                    .newOpportunities
                    ? "✅"
                    : "❌"}
                </div>
                <div>
                  Newsletter:{" "}
                  {selectedUser.notificationPreferences?.emailNotifications
                    .newsletter
                    ? "✅"
                    : "❌"}
                </div>
                <div>
                  Application Updates:{" "}
                  {selectedUser.notificationPreferences?.emailNotifications
                    .applicationUpdates
                    ? "✅"
                    : "❌"}
                </div>
                <div>
                  Investor Messages:{" "}
                  {selectedUser.notificationPreferences?.emailNotifications
                    .investorMessages
                    ? "✅"
                    : "❌"}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="System Notifications">
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div>
                  Task Reminders:{" "}
                  {selectedUser.notificationPreferences?.systemNotifications
                    .taskReminders
                    ? "✅"
                    : "❌"}
                </div>
                <div>
                  Deadline Alerts:{" "}
                  {selectedUser.notificationPreferences?.systemNotifications
                    .deadlineAlerts
                    ? "✅"
                    : "❌"}
                </div>
                <div>
                  News Updates:{" "}
                  {selectedUser.notificationPreferences?.systemNotifications
                    .newsUpdates
                    ? "✅"
                    : "❌"}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Created At">
              {dayjs(selectedUser?.createdAt).format("DD/MM/YYYY HH:mm:ss")}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
      {/* //! SECURITY MODAL */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LockOutlined />
            Two-Factor Authentication Required
          </div>
        }
        open={securityModalVisible}
        onCancel={closeSecurityModal}
        onOk={verifyTwoFactorCode}
        okButtonProps={{ disabled: !verificationCode }}
        okText="Verify"
        width={400}
        maskClosable={false}
        keyboard={false}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Typography.Title level={5}>
            Scan this QR code with your authenticator app
          </Typography.Title>
          {qrCodeData && (
            <div style={{ margin: "20px 0" }}>
              <QRCode
                value={qrCodeData.otpauth_url}
                size={200}
                style={{ margin: "0 auto" }}
              />
              <Typography.Paragraph style={{ marginTop: "10px" }}>
                Can't scan? Manual code: {qrCodeData.secret}
              </Typography.Paragraph>
            </div>
          )}
          <Input
            placeholder="Enter authentication code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            style={{ maxWidth: "300px", margin: "0 auto" }}
            autoComplete="off"
          />
        </div>
      </Modal>

      {/* //! EDIT MODAL */}
      <Modal
        title={
          <div style={{ paddingBottom: "10px" }}>
            <EditOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
            Edit User Details
          </div>
        }
        open={editModalVisible}
        onCancel={() => {
          if (!updateLoading) {
            setEditModalVisible(false);
            setEditingUser(null);
            editForm.resetFields();
          }
        }}
        maskClosable={false}
        keyboard={false}
        footer={null}
        width={800}
        bodyStyle={{ padding: "5px" }}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={editingUser}
          preserve={false}
        >
          {/* Row 1: Basic Info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[
                { required: true, message: "Please input the full name!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: "Please input the phone number!" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          {/* Row 2: Company Info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            <Form.Item
              name="companyName"
              label="Company Name"
              rules={[
                { required: true, message: "Please input the company name!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="industry"
              label="Industry"
              rules={[
                { required: true, message: "Please input the industry!" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            <Form.Item
              name="foundedYear"
              label="Founded Year"
              rules={[
                { required: true, message: "Please input the founded year!" },
              ]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              name="linkedinUrl"
              label="LinkedIn URL"
              rules={[
                { required: true, message: "Please input the LinkedIn URL!" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>

          {/* Row 4: Full Width Description */}
          <div>
            <Form.Item name="companyDescription" label="Company Description">
              <Input.TextArea
                rows={6}
                placeholder="Enter company description..."
                className="invisible-scrollbar"
              />
            </Form.Item>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              paddingTop: "6px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            <Button
              onClick={() => {
                setEditModalVisible(false);
                setEditingUser(null);
                editForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateLoading}
              icon={<UploadCloudIcon />}
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* //! FINAL VERIFICATION CODE */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ExclamationCircleOutlined style={{ color: "#faad14" }} />
            Final Verification Required
          </div>
        }
        open={confirmationModalVisible}
        onCancel={closeConfirmationModal}
        onOk={handleFinalConfirmation}
        okButtonProps={{ disabled: !finalConfirmationCode }}
        okText="Confirm Action"
        cancelText="Cancel"
        width={400}
        maskClosable={false}
        keyboard={false}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Alert
            message="Security Verification"
            description={
              <div>
                <p>{`You are about to ${
                  verifiedAction?.type === "edit" ? "edit" : "delete"
                } a user. Please enter a new verification code to proceed.`}</p>
                <p style={{ marginTop: "8px", fontWeight: "bold" }}>
                  Wait for your authenticator app to generate a new code and
                  enter it below.
                </p>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: "20px" }}
          />

          <Typography.Title level={5}>
            Enter New Verification Code
          </Typography.Title>

          <Input
            placeholder="Enter new verification code"
            value={finalConfirmationCode}
            onChange={(e) => setFinalConfirmationCode(e.target.value)}
            style={{ maxWidth: "200px", margin: "20px auto" }}
            autoComplete="off"
          />

          <Typography.Text type="secondary">
            Please enter the newest code from your authenticator app
          </Typography.Text>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUserSettings;
