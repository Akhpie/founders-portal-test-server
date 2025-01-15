import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  Tabs,
  List,
  Space,
  Statistic,
  Button,
  Tooltip,
  Tag,
  Avatar,
  message,
  Modal,
  Pagination,
} from "antd";
import {
  StockOutlined,
  UserOutlined,
  BankOutlined,
  TrophyOutlined,
  BookOutlined,
  CodeOutlined,
  ArrowRightOutlined,
  DownloadOutlined,
  EyeOutlined,
  TeamOutlined,
  FileOutlined,
} from "@ant-design/icons";
import NewsDisplay from "../../components/News-api/NewsDisplay";
import axios from "axios";

const { Title, Text } = Typography;

interface ResourceItem {
  _id?: string;
  name: string;
  downloads: string;
  rating: number;
  fileType: string;
  preview: boolean;
  fileUrl?: string;
}

interface ResourceCategory {
  _id?: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  items: ResourceItem[];
  totalItems?: number;
}

interface PaginationState {
  [categoryId: string]: {
    current: number;
    pageSize: number;
  };
}

const DashboardLayout = () => {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewingResource, setPreviewingResource] =
    useState<ResourceItem | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Initialize pagination state for each category
    const initialPagination: PaginationState = {};
    categories.forEach((category) => {
      if (category._id) {
        initialPagination[category._id] = {
          current: 1,
          pageSize: 5,
        };
      }
    });
    setPagination(initialPagination);
  }, [categories]);

  const getPaginatedItems = (category: ResourceCategory) => {
    if (!category._id || !pagination[category._id]) {
      return category.items;
    }

    const { current, pageSize } = pagination[category._id];
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return category.items.slice(startIndex, endIndex);
  };

  const handlePageChange = (
    categoryId: string,
    page: number,
    pageSize: number
  ) => {
    setPagination((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        current: page,
        pageSize: pageSize,
      },
    }));
  };

  const FeedContent = () => (
    <div className="p-6">
      <Title level={2} className="mb-8">
        Dashboard Overview
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Investment Opportunities"
              value={42}
              prefix={<StockOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Active Investors"
              value={156}
              prefix={<UserOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Partner Incubators"
              value={18}
              prefix={<BankOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Success Stories"
              value={24}
              prefix={<TrophyOutlined className="text-yellow-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Area with News and Events side by side */}
      <Row gutter={[24, 24]}>
        {/* //! News Section - Takes up 2/3 of the space */}
        <Col xs={24} lg={16}>
          <div className="rounded-lg p-6">
            <NewsDisplay />
          </div>
        </Col>

        {/* //! Upcoming Events Section - Takes up 1/3 of the space */}
        <Col xs={24} lg={8}>
          <Card title="Upcoming Events" className="h-full">
            <List
              dataSource={[1, 2, 3]}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    className="w-full mb-4 border border-gray-200"
                    style={{ backgroundColor: "#1E1E1E" }}
                  >
                    <Space direction="vertical" className="w-full">
                      <Text strong className="text-white">
                        Investor Pitch Day
                      </Text>
                      <Text type="secondary">March {20 + item}, 2024</Text>
                      <Text className="text-gray-400">
                        Present your startup to our panel of experienced
                        investors.
                      </Text>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://founders-portal-test-server-apii.onrender.com/api/resources/categories"
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (
    category: ResourceCategory,
    item: ResourceItem
  ) => {
    try {
      if (!item.fileUrl) {
        message.warning("No file available for download");
        return;
      }

      // First increment the download count
      await axios.post(
        `https://founders-portal-test-server-apii.onrender.com/api/resources/categories/${category._id}/resources/${item._id}/downloads`
      );

      // Get file extension based on fileType
      const getFileExtension = (fileType: string) => {
        const extensionMap: { [key: string]: string } = {
          PDF: ".pdf",
          DOC: ".doc",
          DOCX: ".docx",
          XLS: ".xls",
          XLSX: ".xlsx",
          PPT: ".ppt",
          PPTX: ".pptx",
        };
        return extensionMap[fileType] || "";
      };

      // Then download the file
      const response = await axios.get(
        `https://founders-portal-test-server-apii.onrender.com${item.fileUrl}`,
        {
          responseType: "blob",
          headers: {
            Accept: "application/octet-stream",
          },
        }
      );

      // Create download link with proper file extension
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${item.name}${getFileExtension(item.fileType)}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Refresh categories to update download count
      fetchCategories();
      message.success("Download started");
    } catch (error) {
      console.error("Error downloading file:", error);
      message.error("Failed to download file");
    }
  };

  const handlePreview = (item: ResourceItem) => {
    if (item.fileUrl) {
      setPreviewingResource(item);
      setPreviewModalVisible(true);
    } else {
      message.warning("No preview available");
    }
  };

  const getPreviewContent = (resource: ResourceItem | null) => {
    if (!resource?.fileUrl) return null;

    switch (resource.fileType.toLowerCase()) {
      case "pdf":
        return (
          <iframe
            src={`https://founders-portal-test-server-apii.onrender.com${resource.fileUrl}`}
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
            <FileOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
            <Text>Preview not available for {resource.fileType} files.</Text>
            <Text type="secondary">Please download to view the content.</Text>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Text>Preview not available</Text>
          </div>
        );
    }
  };

  const iconMap: { [key: string]: React.ReactNode } = {
    CodeOutlined: <CodeOutlined style={{ fontSize: "24px" }} />,
    BookOutlined: <BookOutlined style={{ fontSize: "24px" }} />,
    FileOutlined: <FileOutlined style={{ fontSize: "24px" }} />,
    TeamOutlined: <TeamOutlined style={{ fontSize: "24px" }} />,
  };

  const ResourcesContent: React.FC = () => (
    <div style={{ padding: "24px 0" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Startup Resources
      </Title>

      <Row gutter={[24, 24]}>
        {categories.map((category) => (
          <Col xs={24} lg={12} key={category._id}>
            <Card
              hoverable
              className="resource-card"
              style={{
                height: "100%",
              }}
              loading={loading}
            >
              <div style={{ marginBottom: 20 }}>
                <Space align="start" style={{ marginBottom: 12 }}>
                  <Avatar
                    size={48}
                    icon={iconMap[category.icon as keyof typeof iconMap]}
                    style={{
                      color: category.color,
                    }}
                  />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      {category.title}
                    </Title>
                    <Text type="secondary">{category.description}</Text>
                  </div>
                </Space>
              </div>
              <List
                dataSource={getPaginatedItems(category)}
                renderItem={(item: ResourceItem) => (
                  <List.Item
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      marginBottom: "12px",
                      border: "0.5px solid #565656",
                    }}
                  >
                    <div style={{ width: "100%" }}>
                      <Row justify="space-between" align="middle">
                        <Col flex="1">
                          <Space
                            direction="vertical"
                            size={4}
                            style={{ width: "100%" }}
                          >
                            <Space>
                              <Text strong>{item.name}</Text>
                              <Tag color={category.color}>{item.fileType}</Tag>
                            </Space>
                            <Space
                              split={
                                <div
                                  style={{
                                    width: 1,
                                    height: 12,
                                    background: "#f0f0f0",
                                    margin: "0 8px",
                                  }}
                                />
                              }
                            >
                              <Text type="secondary">
                                Downloads: {item.downloads}
                              </Text>
                              <Text type="secondary">
                                Rating: {item.rating}
                              </Text>
                            </Space>
                          </Space>
                        </Col>
                        <Col>
                          <Space>
                            {item.preview && (
                              <Tooltip title="Preview">
                                <Button
                                  type="text"
                                  icon={<EyeOutlined />}
                                  style={{ color: category.color }}
                                  onClick={() => handlePreview(item)}
                                />
                              </Tooltip>
                            )}
                            <Tooltip title="Download">
                              <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                style={{ background: category.color }}
                                onClick={() => handleDownload(category, item)}
                              />
                            </Tooltip>
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  </List.Item>
                )}
              />
              {category._id && pagination[category._id] && (
                <div style={{ marginTop: "20px", textAlign: "right" }}>
                  <Pagination
                    current={pagination[category._id].current}
                    pageSize={pagination[category._id].pageSize}
                    total={category.items.length}
                    onChange={(page, pageSize) =>
                      handlePageChange(category._id!, page, pageSize)
                    }
                    size="small"
                    showSizeChanger={false}
                  />
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

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
              if (previewingResource) {
                const category = categories.find((cat) =>
                  cat.items.some((item) => item._id === previewingResource._id)
                );
                if (category) {
                  handleDownload(category, previewingResource);
                }
              }
            }}
          >
            Download
          </Button>,
        ]}
      >
        <div style={{ height: "70vh", width: "100%" }}>
          {getPreviewContent(previewingResource)}
        </div>
      </Modal>
    </div>
  );

  return (
    <div className="max-w-8xl mx-auto">
      <Tabs
        defaultActiveKey="feed"
        items={[
          {
            key: "feed",
            label: "Feed",
            children: <FeedContent />,
          },
          {
            key: "resources",
            label: "Resources",
            children: <ResourcesContent />,
          },
        ]}
        className="mt-6"
      />
    </div>
  );
};

export default DashboardLayout;
