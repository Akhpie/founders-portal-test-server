// components/TemplateManager.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Row,
  Col,
  Tabs,
  Tooltip,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import ReactQuill from "react-quill";
import axios from "axios";
import defaultTemplates from "../../constants/defaultTemplates";

const { Option } = Select;
const { TabPane } = Tabs;

interface Template {
  _id: string;
  name: string;
  description: string;
  category: "general" | "seasonal" | "holiday" | "event";
  content: string;
  thumbnail: string;
  isDefault?: boolean;
}

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(
        "https://founders-portal-test-server-apii.onrender.com/api/templates"
      );
      const customTemplates = response.data.data;
      setTemplates([...defaultTemplates, ...customTemplates]);
    } catch (error) {
      message.error("Failed to fetch templates");
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      if (selectedTemplate?.isDefault) {
        // Clone default template
        const newTemplate = {
          ...values,
          name: `${values.name} (Copy)`,
          isDefault: false,
        };
        await axios.post(
          "https://founders-portal-test-server-apii.onrender.com/api/templates",
          newTemplate
        );
        message.success("Template cloned successfully");
      } else if (selectedTemplate) {
        await axios.put(
          `https://founders-portal-test-server-apii.onrender.com/api/templates/${selectedTemplate._id}`,
          values
        );
        message.success("Template updated successfully");
      } else {
        await axios.post(
          "https://founders-portal-test-server-apii.onrender.com/api/templates",
          values
        );
        message.success("Template saved successfully");
      }
      setModalVisible(false);
      form.resetFields();
      fetchTemplates();
    } catch (error) {
      message.error("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(
        `https://founders-portal-test-server-apii.onrender.com/api/templates/${id}`
      );
      message.success("Template deleted successfully");
      fetchTemplates();
    } catch (error) {
      message.error("Failed to delete template");
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const renderTemplateCard = (template: Template) => (
    <Card
      hoverable
      actions={[
        <Tooltip title="Preview">
          <EyeOutlined
            key="preview"
            onClick={() => {
              setSelectedTemplate(template);
              setPreviewVisible(true);
            }}
          />
        </Tooltip>,
        // Only show edit for non-default templates
        !template.isDefault && (
          <Tooltip title="Edit">
            <EditOutlined
              key="edit"
              onClick={() => {
                setSelectedTemplate(template);
                form.setFieldsValue(template);
                setModalVisible(true);
              }}
            />
          </Tooltip>
        ),
        <Tooltip title={template.isDefault ? "Use Template" : "Clone"}>
          <CopyOutlined
            key="use"
            onClick={() => {
              setSelectedTemplate(template);
              form.setFieldsValue({
                ...template,
                name: `${template.name} (Copy)`,
                isDefault: false,
              });
              setModalVisible(true);
            }}
          />
        </Tooltip>,
        // Only show delete for non-default templates
        !template.isDefault && (
          <Tooltip title="Delete">
            <DeleteOutlined
              key="delete"
              onClick={() => handleDelete(template._id)}
            />
          </Tooltip>
        ),
      ].filter(Boolean)}
    >
      <Card.Meta
        title={
          <Space>
            {template.name}
            {template.isDefault && <Tag color="blue">Default</Tag>}
          </Space>
        }
        description={
          <>
            <p>{template.description}</p>
            <Tag color={getCategoryColor(template.category)}>
              {template.category}
            </Tag>
          </>
        }
      />
    </Card>
  );

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: "blue",
      seasonal: "green",
      holiday: "red",
      event: "purple",
    };
    return colors[category] || "default";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Newsletter Templates</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedTemplate(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Create Template
        </Button>
      </div>

      <Tabs defaultActiveKey="all">
        <TabPane tab="All Templates" key="all">
          <Row gutter={[16, 16]}>
            {templates.map((template) => (
              <Col key={template._id} xs={24} sm={12} md={8} lg={6}>
                {renderTemplateCard(template)}
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="Default Templates" key="default">
          <Row gutter={[16, 16]}>
            {templates
              .filter((t) => t.isDefault)
              .map((template) => (
                <Col key={template._id} xs={24} sm={12} md={8} lg={6}>
                  {renderTemplateCard(template)}
                </Col>
              ))}
          </Row>
        </TabPane>
        <TabPane tab="Custom Templates" key="custom">
          <Row gutter={[16, 16]}>
            {templates
              .filter((t) => !t.isDefault)
              .map((template) => (
                <Col key={template._id} xs={24} sm={12} md={8} lg={6}>
                  {renderTemplateCard(template)}
                </Col>
              ))}
          </Row>
        </TabPane>
        <TabPane tab="General" key="general">
          <Row gutter={[16, 16]}>
            {templates
              .filter((t) => t.category === "general")
              .map((template) => (
                <Col key={template._id} xs={24} sm={12} md={8} lg={6}>
                  {renderTemplateCard(template)}
                </Col>
              ))}
          </Row>
        </TabPane>
        {/* Add more category tabs */}
      </Tabs>

      <Modal
        title={
          selectedTemplate?.isDefault
            ? "Clone Template"
            : selectedTemplate
            ? "Edit Template"
            : "Create Template"
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Template Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="general">General</Option>
              <Option value="seasonal">Seasonal</Option>
              <Option value="holiday">Holiday</Option>
              <Option value="event">Event</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="thumbnail"
            label="Thumbnail URL"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="content"
            label="Template Content"
            rules={[{ required: true }]}
          >
            <ReactQuill modules={modules} style={{ height: 400 }} />
          </Form.Item>

          <Form.Item className="flex justify-end">
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save Template
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Template Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedTemplate && (
          <div
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
          />
        )}
      </Modal>
    </div>
  );
};

export default TemplateManager;
