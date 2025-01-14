import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Card,
  Typography,
  Input,
  Button,
  Space,
  message,
  Badge,
  Select,
  Tooltip,
  Form,
  Modal,
  Radio,
} from "antd";
import {
  SearchOutlined,
  MailOutlined,
  BellOutlined,
  FilterOutlined,
  SendOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import TemplateManager from "../../admin-components/TemplateManager";
import defaultTemplates from "../../../constants/defaultTemplates";
import { SendIcon } from "lucide-react";

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
  fullName: string;
  email: string;
  userType: "founder" | "visitor";
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

interface EmailForm {
  subject: string;
  content: string;
  sendTo: "all" | "subscribed" | "selected";
  userType: "all" | "founder" | "visitor";
}

interface Template {
  _id?: string;
  name: string;
  description: string;
  category: "general" | "seasonal" | "holiday" | "event" | string;
  content: string;
  thumbnail: string;
  isDefault?: boolean;
}

interface NewsletterForm {
  subject: string;
  content: string;
  userType: "all" | "founder" | "visitor";
  template?: string;
}

const NotificationManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "subscribed" | "unsubscribed"
  >("all");
  const [userTypeFilter, setUserTypeFilter] = useState<
    "all" | "founder" | "visitor"
  >("all");
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<React.Key[]>([]);

  const [newsletterModalVisible, setNewsletterModalVisible] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [newsletterForm] = Form.useForm<NewsletterForm>();
  const [form] = Form.useForm<EmailForm>();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/templates");
        // Combine default templates with custom templates
        const allTemplates = [...defaultTemplates, ...response.data.data];
        setTemplates(allTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        // Fallback to default templates if API fails
        setTemplates(defaultTemplates);
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(
      (t) => t._id === templateId || t.name === templateId
    );
    if (template) {
      // Pre-fill the form with template content
      newsletterForm.setFieldsValue({
        subject: template.name,
        content: template.content,
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/user/all-users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        console.log("Raw user data:", response.data.data);

        // Initialize notification preferences if they don't exist
        const usersWithPreferences = response.data.data.map((user: any) => ({
          ...user,
          notificationPreferences: user.notificationPreferences || {
            emailNotifications: {
              newOpportunities: false,
              newsletter: false,
              applicationUpdates: false,
              investorMessages: false,
            },
            systemNotifications: {
              taskReminders: false,
              deadlineAlerts: false,
              newsUpdates: false,
            },
          },
        }));

        setUsers(usersWithPreferences);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const formatNewsletterContent = (content: string) => {
    return `
      <div style="font-size: 16px; line-height: 1.6;">
        ${content}
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="https://your-website.com" 
             style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Visit Our Website
          </a>
        </div>
      </div>
    `;
  };

  // In your handleSendNewsletter function:
  const handleSendNewsletter = async (values: NewsletterForm) => {
    try {
      setSendingNewsletter(true);
      const subscribedUsers = users.filter(
        (user) =>
          user.notificationPreferences?.emailNotifications.newsletter &&
          (values.userType === "all" || user.userType === values.userType)
      );

      if (subscribedUsers.length === 0) {
        message.warning("No subscribed users found");
        return;
      }

      const recipientEmails = subscribedUsers.map((user) => user.email);
      const formattedContent = formatNewsletterContent(values.content);

      const response = await axios.post(
        "http://localhost:5000/api/user/send-newsletter",
        {
          recipients: recipientEmails,
          subject: values.subject,
          content: formattedContent,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        message.success(
          `Newsletter sent to ${recipientEmails.length} subscribers`
        );
        setNewsletterModalVisible(false);
        newsletterForm.resetFields();
      }
    } catch (error) {
      console.error("Error sending newsletter:", error);
      message.error("Failed to send newsletter");
    } finally {
      setSendingNewsletter(false);
    }
  };

  const handleSendEmail = async (values: EmailForm) => {
    try {
      setSendingEmail(true);
      let recipientEmails: string[] = [];

      switch (values.sendTo) {
        case "all":
          recipientEmails = users
            .filter(
              (user) =>
                values.userType === "all" || user.userType === values.userType
            )
            .map((user) => user.email);
          break;
        case "subscribed":
          recipientEmails = users
            .filter(
              (user) =>
                (values.userType === "all" ||
                  user.userType === values.userType) &&
                user.notificationPreferences?.emailNotifications.newsletter
            )
            .map((user) => user.email);
          break;
        case "selected":
          recipientEmails = users
            .filter((user) => selectedUsers.includes(user.email))
            .map((user) => user.email);
          break;
      }

      if (recipientEmails.length === 0) {
        message.warning("No recipients selected");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/user/send-email",
        {
          recipients: recipientEmails,
          subject: values.subject,
          content: values.content,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        message.success(`Email sent to ${recipientEmails.length} recipients`);
        setEmailModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      console.error("Error sending email:", error);
      message.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const getSubscriptionStatus = (
    notificationPreferences?: User["notificationPreferences"]
  ) => {
    if (!notificationPreferences) return false;
    return notificationPreferences.emailNotifications.newsletter;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());

    const matchesUserType =
      userTypeFilter === "all" || user.userType === userTypeFilter;

    const isSubscribed = getSubscriptionStatus(user.notificationPreferences);
    const matchesSubscriptionFilter =
      filterType === "all" ||
      (filterType === "subscribed" && isSubscribed) ||
      (filterType === "unsubscribed" && !isSubscribed);

    return matchesSearch && matchesUserType && matchesSubscriptionFilter;
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string, record: User) => (
        <Space>
          <Text>{text}</Text>
          <Tag color={record.userType === "founder" ? "blue" : "green"}>
            {record.userType.toUpperCase()}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Newsletter",
      key: "newsletter",
      render: (_: any, record: User) => {
        const isSubscribed =
          record.notificationPreferences?.emailNotifications.newsletter;
        return (
          <Space>
            <Badge
              status={isSubscribed ? "success" : "default"}
              dot={isSubscribed}
              className={isSubscribed ? "animate-pulse" : ""}
            />
            <span>{isSubscribed ? "Subscribed" : "Not Subscribed"}</span>
          </Space>
        );
      },
    },
    {
      title: "Email Notifications",
      key: "emailNotifications",
      render: (_: any, record: User) => {
        const emailPrefs = record.notificationPreferences?.emailNotifications;
        console.log("Email prefs for", record.email, ":", emailPrefs); // Debug log

        const enabledCount = emailPrefs
          ? Object.values(emailPrefs).filter((value) => value === true).length
          : 0;

        return (
          <Tooltip
            title={
              <div>
                <div>
                  New Opportunities:{" "}
                  {emailPrefs?.newOpportunities === true ? "✅" : "❌"}
                </div>
                <div>
                  Application Updates:{" "}
                  {emailPrefs?.applicationUpdates === true ? "✅" : "❌"}
                </div>
                <div>
                  Investor Messages:{" "}
                  {emailPrefs?.investorMessages === true ? "✅" : "❌"}
                </div>
              </div>
            }
          >
            <Tag icon={<MailOutlined />} color="blue">
              {enabledCount}/4 Enabled
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "System Notifications",
      key: "systemNotifications",
      render: (_: any, record: User) => {
        const systemPrefs = record.notificationPreferences?.systemNotifications;
        console.log("System prefs for", record.email, ":", systemPrefs); // Debug log

        const enabledCount = systemPrefs
          ? Object.values(systemPrefs).filter((value) => value === true).length
          : 0;

        return (
          <Tooltip
            title={
              <div>
                <div>
                  Task Reminders:{" "}
                  {systemPrefs?.taskReminders === true ? "✅" : "❌"}
                </div>
                <div>
                  Deadline Alerts:{" "}
                  {systemPrefs?.deadlineAlerts === true ? "✅" : "❌"}
                </div>
                <div>
                  News Updates:{" "}
                  {systemPrefs?.newsUpdates === true ? "✅" : "❌"}
                </div>
              </div>
            }
          >
            <Tag icon={<BellOutlined />} color="purple">
              {enabledCount}/3 Enabled
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
        <Button
          icon={<MailOutlined />}
          size="small"
          onClick={() => {
            setSelectedUsers([record.email]);
            setEmailModalVisible(true);
          }}
        >
          Send Email
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <Title level={3}>Notification Management</Title>
        <Text className="block mb-6">
          Manage user notification preferences and newsletter subscriptions
        </Text>

        <Space className="mb-4" wrap>
          <Input
            placeholder="Search by name or email"
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />

          <Select
            value={userTypeFilter}
            onChange={setUserTypeFilter}
            style={{ width: 150 }}
            placeholder="User Type"
          >
            <Option value="all">All Users</Option>
            <Option value="founder">Founders</Option>
            <Option value="visitor">Visitors</Option>
          </Select>

          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 180 }}
            placeholder="Subscription Status"
          >
            <Option value="all">All</Option>
            <Option value="subscribed">Newsletter Subscribed</Option>
            <Option value="unsubscribed">Newsletter Unsubscribed</Option>
          </Select>

          <Button
            type="primary"
            icon={<SendIcon size={14} />}
            iconPosition="end"
            disabled={filteredUsers.length === 0}
            onClick={() => setNewsletterModalVisible(true)}
          >
            Send Newsletter
          </Button>

          <Button
            type="primary"
            icon={<MailOutlined />}
            onClick={() => setEmailModalVisible(true)}
            disabled={loading}
            iconPosition="end"
          >
            Compose Email
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="email"
          loading={loading}
          rowSelection={{
            selectedRowKeys: selectedUsers,
            onChange: (selectedRowKeys) => {
              setSelectedUsers(selectedRowKeys);
            },
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
      <Modal
        title="Compose Email"
        open={emailModalVisible}
        onCancel={() => {
          setEmailModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSendEmail}
          initialValues={{
            sendTo: "selected",
            userType: "all",
          }}
        >
          <Form.Item
            name="sendTo"
            label="Send To"
            rules={[{ required: true, message: "Please select recipients" }]}
          >
            <Radio.Group>
              <Radio value="all">All Users</Radio>
              <Radio value="subscribed">Newsletter Subscribers</Radio>
              <Radio value="selected">
                Selected Users ({selectedUsers.length})
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="userType"
            label="User Type"
            rules={[{ required: true, message: "Please select user type" }]}
          >
            <Radio.Group>
              <Radio value="all">All Types</Radio>
              <Radio value="founder">Founders Only</Radio>
              <Radio value="visitor">Visitors Only</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please enter subject" }]}
          >
            <Input placeholder="Email subject" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: "Please enter content" }]}
          >
            <ReactQuill
              theme="snow"
              style={{ height: 200, marginBottom: 50 }}
            />
          </Form.Item>

          <Form.Item className="flex justify-end">
            <Space>
              <Button onClick={() => setEmailModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={sendingEmail}
                icon={<SendOutlined />}
              >
                Send Email
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {/* // !Newsletter Modal */}
      <Modal
        title="Send Newsletter"
        open={newsletterModalVisible}
        onCancel={() => {
          setNewsletterModalVisible(false);
          newsletterForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={newsletterForm}
          layout="vertical"
          onFinish={handleSendNewsletter}
          initialValues={{
            userType: "all",
          }}
        >
          <Form.Item
            name="userType"
            label="Send To"
            rules={[
              { required: true, message: "Please select recipient type" },
            ]}
          >
            <Radio.Group>
              <Radio value="all">All Subscribed Users</Radio>
              <Radio value="founder">Subscribed Founders Only</Radio>
              <Radio value="visitor">Subscribed Visitors Only</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Newsletter Subject"
            rules={[{ required: true, message: "Please enter subject" }]}
          >
            <Input placeholder="Newsletter subject" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Newsletter Content"
            rules={[{ required: true, message: "Please enter content" }]}
          >
            <ReactQuill
              theme="snow"
              style={{ height: 200, marginBottom: 50 }}
            />
          </Form.Item>

          <div className="text-sm text-gray-500 mb-4">
            This newsletter will only be sent to users who have subscribed to
            receive newsletters.
          </div>

          <Form.Item className="flex justify-end">
            <Space>
              <Button onClick={() => setNewsletterModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={sendingNewsletter}
                icon={<SendOutlined />}
              >
                Send Newsletter
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <TemplateManager />
    </div>
  );
};

export default NotificationManagement;
