import {
  Typography,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
} from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

interface ChecklistItem {
  _id: string;
  text: string;
  category: string;
}

interface ItemFormData {
  text: string;
  category: string;
}

export default function ChecklistManagement() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    try {
      const response = await axios.get(
        "https://founders-portal-test-server-apii.onrender.com/api/check/admin/checklist"
      );
      setItems(response.data.data);
    } catch (error) {
      console.error("Error fetching checklist items:", error);
      message.error("Failed to fetch checklist items");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = async (values: ItemFormData) => {
    try {
      if (editingItem) {
        // Edit existing item
        const response = await axios.put(
          `https://founders-portal-test-server-apii.onrender.com/api/check/admin/checklist/${editingItem._id}`,
          values
        );
        setItems(
          items.map((item) =>
            item._id === editingItem._id ? response.data.data : item
          )
        );
        message.success("Item updated successfully");
      } else {
        // Add new item
        const response = await axios.post(
          "https://founders-portal-test-server-apii.onrender.com/api/check/admin/checklist",
          values
        );
        setItems([...items, response.data.data]);
        message.success("Item added successfully");
      }
      handleModalClose();
    } catch (error) {
      console.error("Error saving item:", error);
      message.error("Failed to save item");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(
        `https://founders-portal-test-server-apii.onrender.com/api/check/admin/checklist/${id}`
      );
      setItems(items.filter((item) => item._id !== id));
      message.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      message.error("Failed to delete item");
    }
  };

  const handleModalOpen = (item?: ChecklistItem) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue(item);
    } else {
      setEditingItem(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "Task",
      dataIndex: "text",
      key: "text",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: Array.from(new Set(items.map((item) => item.category))).map(
        (category) => ({
          text: category,
          value: category,
        })
      ),
      onFilter: (value: string, record: ChecklistItem) =>
        record.category === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ChecklistItem) => (
        <div className="space-x-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleModalOpen(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this task?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-8xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Manage Checklist Items</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleModalOpen()}
        >
          Add New Task
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="_id"
        loading={loading}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingItem ? "Edit Task" : "Add New Task"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <Form form={form} onFinish={handleAddEdit} layout="vertical">
          <Form.Item
            name="text"
            label="Task Description"
            rules={[
              { required: true, message: "Please enter task description" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select>
              <Option value="Setup">Setup</Option>
              <Option value="Documents">Documents</Option>
              <Option value="Team">Team</Option>
              <Option value="Goals">Goals</Option>
              <Option value="Strategy">Strategy</Option>
            </Select>
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Button onClick={handleModalClose} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingItem ? "Save Changes" : "Add Task"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
