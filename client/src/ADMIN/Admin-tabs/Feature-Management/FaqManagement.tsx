import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  notification,
  Space,
  Popconfirm,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import faqService, { FAQ } from "../../../services/faqService";

const { Option } = Select;
const { TextArea } = Input;

const FaqManagement: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const response = await faqService.getAdminFaqs();
      if (response.success) {
        setFaqs(response.data || []);
      } else {
        notification.error({
          message: "Error",
          description: response.message || "Failed to fetch FAQs",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to fetch FAQs",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingFaq) {
        const response = await faqService.updateFaq(editingFaq._id, values);
        if (response.success) {
          notification.success({
            message: "Success",
            description: "FAQ updated successfully",
          });
        }
      } else {
        const response = await faqService.createFaq(values);
        if (response.success) {
          notification.success({
            message: "Success",
            description: "FAQ created successfully",
          });
        }
      }
      setModalVisible(false);
      form.resetFields();
      fetchFaqs();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to save FAQ",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await faqService.deleteFaq(id);
      if (response.success) {
        notification.success({
          message: "Success",
          description: "FAQ deleted successfully",
        });
        fetchFaqs();
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to delete FAQ",
      });
    }
  };

  const columns = [
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      ellipsis: true,
    },
    {
      title: "Answer",
      dataIndex: "answer",
      key: "answer",
      ellipsis: true,
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => <Switch checked={isActive} disabled />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: FAQ) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingFaq(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete FAQ"
            description="Are you sure you want to delete this FAQ?"
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record._id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
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
        <h1>FAQ Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingFaq(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add New FAQ
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={faqs}
        loading={loading}
        rowKey="_id"
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingFaq ? "Edit FAQ" : "Add New FAQ"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select>
              <Option value="Account">Account</Option>
              <Option value="Support">Support</Option>
              <Option value="Billing">Billing</Option>
              <Option value="General">General</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true, message: "Please enter the question" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="answer"
            label="Answer"
            rules={[{ required: true, message: "Please enter the answer" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingFaq ? "Update" : "Create"} FAQ
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FaqManagement;
