import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Space,
  message,
  Popconfirm,
  ColorPicker,
  InputNumber,
  Radio,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { ResourceCategory, ResourceItem } from "../../../types/resource";

const { Option } = Select;

const ResourceManagement: React.FC = () => {
  // States for categories
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [fileSource, setFileSource] = useState<"local" | "drive">("local");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ResourceCategory | null>(null);
  const [categoryForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // States for resources
  const [isResourceModalVisible, setIsResourceModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ResourceCategory | null>(null);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(
    null
  );
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewingResource, setPreviewingResource] =
    useState<ResourceItem | null>(null);
  const [resourceForm] = Form.useForm();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const handlePreview = (item: ResourceItem) => {
    setPreviewingResource(item);
    setPreviewModalVisible(true);
  };

  const getPreviewContent = (resource: ResourceItem) => {
    // Handle Google Drive links
    if (resource.fileSource === "drive" && resource.driveLink) {
      // Extract file ID from Google Drive link
      const getFileId = (url: string) => {
        const patterns = [/\/file\/d\/([^/]+)/, /id=([^&]+)/, /\/d\/([^/]+)/];

        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) return match[1];
        }
        return null;
      };

      const fileId = getFileId(resource.driveLink);
      console.log("Drive File ID:", fileId);

      if (!fileId) {
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <LinkOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
            <p>Unable to generate preview</p>
            <a
              href={resource.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Open in Google Drive
            </a>
          </div>
        );
      }

      // Different preview handling based on file type
      let embedUrl;
      switch (resource.fileType.toLowerCase()) {
        case "pdf":
          embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
          break;
        case "doc":
        case "docx":
          embedUrl = `https://docs.google.com/document/d/${fileId}/preview`;
          break;
        case "ppt":
        case "pptx":
          embedUrl = `https://docs.google.com/presentation/d/${fileId}/preview`;
          break;
        case "xls":
        case "xlsx":
          embedUrl = `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
          break;
        default:
          embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return (
        <iframe
          src={embedUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          title={resource.name}
          allowFullScreen
        />
      );
    }

    // Handle local files
    if (resource.fileUrl) {
      const fileUrl = `https://founders-portal-test-server-apii.onrender.com${resource.fileUrl}`;

      switch (resource.fileType.toLowerCase()) {
        case "pdf":
          return (
            <iframe
              src={fileUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
              title={resource.name}
            />
          );
        case "doc":
        case "docx":
        case "xls":
        case "xlsx":
        case "ppt":
        case "pptx":
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <FileOutlined
                style={{ fontSize: "48px", marginBottom: "16px" }}
              />
              <p>Preview not available for {resource.fileType} files</p>
              <p className="mb-4">Please download to view the content</p>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() =>
                  handleResourceDownload(selectedCategory!, resource)
                }
              >
                Download to View
              </Button>
            </div>
          );
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
          return (
            <img
              src={fileUrl}
              alt={resource.name}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          );
        default:
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <FileOutlined
                style={{ fontSize: "48px", marginBottom: "16px" }}
              />
              <p>Preview not available for this file type</p>
            </div>
          );
      }
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
        <p>No preview available</p>
      </div>
    );
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://founders-portal-test-server-apii.onrender.com/api/resources/categories"
      );
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      const processedCategories = categoriesData.map((category) => ({
        ...category,
        items: Array.isArray(category.items) ? category.items : [],
      }));
      setCategories(processedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setIsModalVisible(true);
  };

  const handleResourceDownload = async (
    category: ResourceCategory,
    item: ResourceItem
  ) => {
    try {
      // First increment the download count regardless of source
      await axios.post(
        `https://founders-portal-test-server-apii.onrender.com/api/resources/categories/${category._id}/resources/${item._id}/downloads`
      );

      if (item.fileSource === "drive" && item.driveLink) {
        // For Google Drive files, extract the file ID and construct a direct download link
        const fileId = item.driveLink.match(/[-\w]{25,}(?!.*[-\w]{25,})/)?.[0];
        window.open(item.driveLink, "_blank");
        message.success("Opening Google Drive file");

        if (!fileId) {
          message.error("Invalid Google Drive link");
          return;
        }

        // Different handling based on file type
        if (item.driveLink.includes("folders")) {
          // If it's a folder, open in new tab
          window.open(item.driveLink, "_blank");
        } else {
          // For files, attempt to force download
          const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
          window.open(downloadUrl, "_blank");
        }

        message.success("Google Drive file download initiated");
      } else if (item.fileUrl) {
        // For local files
        const downloadUrl = `https://founders-portal-test-server-apii.onrender.com${item.fileUrl}?download=true`;

        try {
          // Create a temporary anchor element for download
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.setAttribute("download", ""); // This will keep the original filename
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          message.success("Download started");
        } catch (downloadError) {
          console.error("Download error:", downloadError);
          // Fallback to opening in new tab if download fails
          window.open(downloadUrl, "_blank");
        }
      } else {
        message.warning("No file available for download");
        return;
      }

      // Refresh categories to update download count
      fetchCategories();
    } catch (error) {
      console.error("Error during download:", error);
      message.error("Failed to process download");
    }
  };

  const handleEditCategory = (category: ResourceCategory) => {
    setEditingCategory(category);
    // Set form values with the correct color format
    categoryForm.setFieldsValue({
      ...category,
      color: category.color, // ColorPicker will handle the string value
    });
    setIsModalVisible(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await axios.delete(
        `https://founders-portal-test-server-apii.onrender.com/api/resources/categories/${categoryId}`
      );
      message.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      message.error("Failed to delete category");
    }
  };

  const handleCategoryModalSubmit = async (values: any) => {
    try {
      const categoryData = {
        ...values,
        items: values.items || [],
        color:
          typeof values.color === "string"
            ? values.color
            : values.color?.toHexString() || "#1890ff",
      };

      if (editingCategory?._id) {
        // Update existing category
        await axios.put(
          `https://founders-portal-test-server-apii.onrender.com/api/resources/categories/${editingCategory._id}`,
          categoryData
        );
        message.success("Category updated successfully");
        fetchCategories();
      } else {
        // Add new category
        const response = await axios.post(
          "https://founders-portal-test-server-apii.onrender.com/api/resources/categories",
          categoryData
        );
        const newCategory = response.data;

        // Add new category to the top of the list
        setCategories((prevCategories) => [newCategory, ...prevCategories]);
        message.success("Category added successfully");
      }

      setIsModalVisible(false);
      categoryForm.resetFields();
    } catch (error) {
      console.error("Error saving category:", error);
      message.error("Failed to save category");
    }
  };

  const handleAddResource = (category: ResourceCategory) => {
    setSelectedCategory(category);
    setEditingResource(null);
    resourceForm.resetFields();
    resourceForm.setFieldsValue({
      rating: 0,
      preview: false,
      downloads: "0",
    });
    setIsResourceModalVisible(true);
  };

  const handleEditResource = (
    category: ResourceCategory,
    resource: ResourceItem
  ) => {
    setSelectedCategory(category);
    setEditingResource(resource);
    resourceForm.setFieldsValue({
      ...resource,
      file: undefined,
    });
    setIsResourceModalVisible(true);
  };

  const handleDeleteResource = async (
    categoryId: string,
    resourceId: string
  ) => {
    try {
      await axios.delete(
        `https://founders-portal-test-server-apii.onrender.com/api/resources/categories/${categoryId}/resources/${resourceId}`
      );
      message.success("Resource deleted successfully");
      fetchCategories();
    } catch (error) {
      message.error("Failed to delete resource");
    }
  };

  const handleResourceModalSubmit = async (values: any) => {
    try {
      if (fileSource === "local") {
        // Handle local file upload (existing logic)
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("fileType", values.fileType);
        formData.append("rating", values.rating.toString());
        formData.append("preview", String(values.preview));

        if (values.file?.fileList?.[0]?.originFileObj) {
          formData.append("file", values.file.fileList[0].originFileObj);
        }

        if (editingResource?._id) {
          await axios.put(
            `https://founders-portal-test-server-apii.onrender.com/api/resources/categories/${selectedCategory?._id}/resources/${editingResource._id}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        } else {
          await axios.post(
            `https://founders-portal-test-server-apii.onrender.com/api/resources/categories/${selectedCategory?._id}/resources`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        }
      } else {
        // Handle Google Drive link
        const resourceData = {
          name: values.name,
          fileType: values.fileType,
          rating: values.rating,
          preview: values.preview,
          driveLink: values.driveLink,
          fileSource: "drive",
        };
        console.log("Submitting Drive resource:", resourceData);

        if (editingResource?._id) {
          await axios.put(
            `https://founders-portal-test-server-apii.onrender.com/api/resources/categories/${selectedCategory?._id}/resources/${editingResource._id}`,
            resourceData,
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        } else {
          await axios.post(
            `https://founders-portal-test-server-apii.onrender.com/api/resources/categories/${selectedCategory?._id}/resources`,
            resourceData,
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }

      message.success(
        `Resource ${editingResource ? "updated" : "added"} successfully`
      );
      setIsResourceModalVisible(false);
      resourceForm.resetFields();
      fetchCategories();
    } catch (error) {
      console.error("Error saving resource:", error);
      message.error("Failed to save resource");
    }
  };

  // Table columns
  const resourceColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "File Type",
      dataIndex: "fileType",
      key: "fileType",
    },
    {
      title: "Downloads",
      dataIndex: "downloads",
      key: "downloads",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ResourceItem) => (
        <Space>
          {record.preview && (
            <Button
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          )}
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditResource(selectedCategory!, record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this resource?"
            onConfirm={() =>
              handleDeleteResource(selectedCategory!._id!, record._id!)
            }
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categoryColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Items Count",
      dataIndex: "items",
      key: "items",
      render: (items: ResourceItem[]) => items.length,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ResourceCategory) => (
        <Space>
          <Button type="primary" onClick={() => handleAddResource(record)}>
            Add Resource
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDeleteCategory(record._id!)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (category: ResourceCategory) => {
    setSelectedCategory(category);
    return (
      <Table
        columns={resourceColumns}
        dataSource={category.items}
        rowKey="_id"
        pagination={false}
      />
    );
  };

  return (
    <div className="p-6">
      {/* Category Management Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Resource Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddCategory}
        >
          Add Category
        </Button>
      </div>

      <Table
        columns={categoryColumns}
        expandable={{ expandedRowRender }}
        dataSource={categories}
        loading={loading}
        rowKey="_id"
      />

      {/* Category Modal */}
      <Modal
        title={`${editingCategory ? "Edit" : "Add"} Resource Category`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCategoryModalSubmit}
        >
          <Form.Item
            name="title"
            label="Category Title"
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

          <Form.Item name="icon" label="Icon" rules={[{ required: true }]}>
            <Select>
              <Option value="CodeOutlined">Code</Option>
              <Option value="BookOutlined">Book</Option>
              <Option value="FileOutlined">File</Option>
              <Option value="TeamOutlined">Team</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="color"
            label="Category Color"
            rules={[{ required: true }]}
          >
            <ColorPicker format="hex" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Space>
                <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  {editingCategory ? "Update" : "Add"}
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Resource Modal */}
      <Modal
        title={`${editingResource ? "Edit" : "Add"} Resource`}
        open={isResourceModalVisible}
        onCancel={() => setIsResourceModalVisible(false)}
        footer={null}
      >
        <Form
          form={resourceForm}
          layout="vertical"
          onFinish={handleResourceModalSubmit}
        >
          <Form.Item
            name="name"
            label="Resource Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="fileType"
            label="File Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="PDF">PDF</Option>
              <Option value="DOC">DOC</Option>
              <Option value="PPT">PPT</Option>
              <Option value="XLS">XLS</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="rating"
            label="Initial Rating"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={5} step={0.1} />
          </Form.Item>

          <Form.Item name="preview" label="Allow Preview" initialValue={false}>
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>

          <Form.Item name="fileSource" label="File Source">
            <Radio.Group
              onChange={(e) => setFileSource(e.target.value)}
              value={fileSource}
            >
              <Radio.Button value="local">Upload File</Radio.Button>
              <Radio.Button value="drive">Google Drive Link</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {fileSource === "local" ? (
            <Form.Item
              name="file"
              label="Upload File"
              rules={[{ required: !editingResource }]}
              valuePropName="file"
            >
              <Upload
                maxCount={1}
                beforeUpload={() => false}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              >
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>
          ) : (
            <Form.Item
              name="driveLink"
              label="Google Drive Link"
              rules={[
                {
                  required: true,
                  message: "Please enter the Google Drive link",
                },
                {
                  type: "url",
                  message: "Please enter a valid URL",
                },
                {
                  pattern: /^https:\/\/drive\.google\.com\/.*/,
                  message: "Please enter a valid Google Drive link",
                },
              ]}
            >
              <Input placeholder="https://drive.google.com/..." />
            </Form.Item>
          )}

          <Form.Item>
            <div className="flex justify-end">
              <Space>
                <Button onClick={() => setIsResourceModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingResource ? "Update" : "Add"}
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={previewingResource?.name}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={1000}
        footer={[
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (previewingResource && selectedCategory) {
                handleResourceDownload(selectedCategory, previewingResource);
              }
            }}
          >
            Download
          </Button>,
        ]}
      >
        {previewingResource?.fileUrl && (
          <div style={{ height: "70vh", width: "100%" }}>
            {getPreviewContent(previewingResource)}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResourceManagement;
