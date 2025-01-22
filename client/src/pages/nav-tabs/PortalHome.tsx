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
  LinkOutlined,
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
  driveLink?: string;
  fileSource?: "local" | "drive";
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

  const handlePreview = (item: ResourceItem) => {
    setPreviewingResource(item);
    setPreviewModalVisible(true);
  };

  // Replace the existing getPreviewContent function with this updated version
  const getPreviewContent = (resource: ResourceItem | null) => {
    // Handle Google Drive links
    if (resource?.fileSource === "drive" && resource.driveLink) {
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
    if (resource?.fileUrl) {
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
                onClick={() => {
                  const category = categories.find((cat) =>
                    cat.items.some((item) => item._id === resource._id)
                  );
                  if (category) {
                    handleDownload(category, resource);
                  }
                }}
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
