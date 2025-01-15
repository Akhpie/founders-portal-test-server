import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Typography,
  Space,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Box } from "lucide-react";

const { Title } = Typography;
const { TextArea } = Input;
const { Search } = Input;
const { Dragger } = Upload;

interface Influencer {
  _id: string;
  name: string;
  linkedinUrl: string;
  bio: string;
  focus: string[];
  description: string;
  imageUrl?: string;
}

const StartupInfluencerManagement = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const handleImport = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first worksheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Transform the data to match your Influencer interface
        const transformedData = jsonData.map((row: any) => ({
          name: row["Name"],
          linkedinUrl: row["LinkedIn URL"],
          focus: row["Focus Areas"].split(",").map((tag: string) => tag.trim()),
          description: row["Description"],
          bio: row["Bio"],
          imageUrl: row["Image URL"] || undefined,
        }));

        // Upload each influencer
        const promises = transformedData.map((influencer) =>
          axios.post(
            "https://founders-portal-test-server-apii.onrender.com/api/startup-influencers",
            influencer
          )
        );

        await Promise.all(promises);
        message.success(
          `Successfully imported ${transformedData.length} records`
        );
        fetchInfluencers(); // Refresh the table
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Import error:", error);
      message.error("Failed to import data");
    }
  };

  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://founders-portal-test-server-apii.onrender.com/api/startup-influencers"
      );
      setInfluencers(response.data);
    } catch (error) {
      message.error("Failed to fetch influencers");
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const handleEdit = (record: Influencer) => {
    setEditingInfluencer(record);
    form.setFieldsValue({
      ...record,
      focus: record.focus.join(", "),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(
        `https://founders-portal-test-server-apii.onrender.com/api/startup-influencers/${id}`
      );
      message.success("Influencer deleted successfully");
      fetchInfluencers();
    } catch (error) {
      message.error("Failed to delete influencer");
      console.error("Error:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      // Delete all selected influencers
      const deletePromises = selectedRowKeys.map((id) =>
        axios.delete(
          `https://founders-portal-test-server-apii.onrender.com/api/startup-influencers/${id}`
        )
      );

      await Promise.all(deletePromises);
      message.success(
        `Successfully deleted ${selectedRowKeys.length} influencers`
      );

      // Reset selection and refresh the list
      setSelectedRowKeys([]);
      fetchInfluencers();
    } catch (error) {
      message.error("Failed to delete selected influencers");
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = {
        ...values,
        focus: values.focus.split(",").map((tag: string) => tag.trim()),
      };

      if (editingInfluencer) {
        await axios.put(
          `https://founders-portal-test-server-apii.onrender.com/api/startup-influencers/${editingInfluencer._id}`,
          formData
        );
        message.success("Influencer updated successfully");
      } else {
        await axios.post(
          "https://founders-portal-test-server-apii.onrender.com/api/startup-influencers",
          formData
        );
        message.success("Influencer added successfully");
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingInfluencer(null);
      fetchInfluencers();
    } catch (error) {
      message.error("Failed to save influencer");
      console.error("Error:", error);
    }
  };

  // Search functionality
  const filteredInfluencers = influencers.filter(
    (influencer) =>
      Object.values(influencer).some((val) =>
        val?.toString().toLowerCase().includes(searchText.toLowerCase())
      ) ||
      influencer.focus.some((tag) =>
        tag.toLowerCase().includes(searchText.toLowerCase())
      )
  );

  // Export functions
  const handleExportSelected = () => {
    const selectedInfluencers = influencers.filter((item) =>
      selectedRowKeys.includes(item._id)
    );
    exportToExcel(selectedInfluencers, "selected_influencers");
  };

  const handleExportAll = () => {
    exportToExcel(filteredInfluencers, "all_influencers");
  };

  const exportToExcel = (data: Influencer[], fileName: string) => {
    // Prepare data for export
    const exportData = data.map((item: Influencer) => ({
      Name: item.name,
      "LinkedIn URL": item.linkedinUrl,
      "Focus Areas": item.focus.join(", "),
      Description: item.description,
      Bio: item.bio,
      "Image URL": item.imageUrl || "",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Influencers");

    // Generate and download file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blobData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blobData,
      `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`
    );

    message.success(`Successfully exported ${exportData.length} records`);
  };

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: any[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Influencer) => (
        <div className="flex items-center gap-3">
          {record.imageUrl && (
            <img
              src={record.imageUrl}
              alt={name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: "Focus Areas",
      dataIndex: "focus",
      key: "focus",
      render: (focus: string[]) => (
        <div className="flex flex-wrap gap-1">
          {focus.map((tag) => (
            <Tag color="blue" key={tag}>
              {tag}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "LinkedIn",
      dataIndex: "linkedinUrl",
      key: "linkedinUrl",
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          View Profile
        </a>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Influencer) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          ></Button>
          <Popconfirm
            title="Are you sure you want to delete this influencer?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Manage Startup Influencers</Title>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingInfluencer(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Add Influencer
          </Button>
        </Space>
      </div>

      {/* Search and Export Controls */}
      <div className="flex justify-between items-center mb-4">
        <Search
          placeholder="Search influencers..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-md"
        />

        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportAll}>
            Export All
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportSelected}
            disabled={selectedRowKeys.length === 0}
          >
            Export Selected ({selectedRowKeys.length})
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedRowKeys.length})
          </Button>
        </Space>
      </div>
      <div className=" border-gray-700 rounded-lg bg-[#141414] mb-6">
        <Dragger
          accept=".xlsx,.xls"
          showUploadList={false}
          beforeUpload={(file) => {
            handleImport(file);
            return false;
          }}
          className="bg-transparent px-6 py-12"
        >
          <div className="text-center">
            <Box className="text-blue-500 w-12 h-12 mx-auto mb-4" />
            <p className="text-gray-300 text-base cursor-pointer mb-2">
              Click or drag file to import company data
            </p>
            <p className="text-gray-500 text-sm">
              Support for CSV or Excel files
            </p>
          </div>
        </Dragger>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredInfluencers}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingInfluencer ? "Edit Influencer" : "Add Influencer"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingInfluencer(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={editingInfluencer || {}}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="imageUrl" label="Profile Image URL">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item
            name="linkedinUrl"
            label="LinkedIn Profile URL"
            rules={[
              {
                required: false,
                message: "Please enter the LinkedIn profile URL",
              },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input placeholder="https://linkedin.com/in/profile" />
          </Form.Item>

          <Form.Item
            name="focus"
            label="Focus Areas"
            rules={[{ required: true, message: "Please enter focus areas" }]}
            help="Enter focus areas separated by commas (e.g., Startups, Tech, Marketing)"
          >
            <Input placeholder="Startups, Tech, Marketing" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Short Description"
            rules={[
              { required: true, message: "Please enter a short description" },
            ]}
          >
            <TextArea rows={2} maxLength={200} showCount />
          </Form.Item>

          <Form.Item
            name="bio"
            label="Full Bio"
            rules={[{ required: true, message: "Please enter the full bio" }]}
          >
            <TextArea rows={4} maxLength={1000} showCount />
          </Form.Item>

          <Form.Item className="flex justify-end mb-0">
            <Button
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingInfluencer(null);
              }}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingInfluencer ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StartupInfluencerManagement;
