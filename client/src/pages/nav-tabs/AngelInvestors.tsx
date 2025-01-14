import { useState, useEffect } from "react";
import { SortOrder } from "antd/es/table/interface";
import {
  Typography,
  Card,
  Tag,
  Button,
  Table,
  Switch,
  Modal,
  Input,
  Space,
  notification,
  Spin,
  Collapse,
  Tooltip,
} from "antd";
import {
  ArrowRight,
  Info,
  Linkedin,
  Twitter,
  CalendarCheck2,
  ExternalLink,
  MapPinned,
} from "lucide-react";
import "../../styles/Incubators.css";
import "../../styles/Glasstable.css";
import FilterSection from "../../components/FilterSection";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import angelService from "../../services/angelService";
import { AngelTypes } from "../../types/angels";

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

interface FilterState {
  sectors: string[];
  locations: string[];
  industries: string[];
  startupStage: string[];
}

interface AvailableFilterState {
  sectors: string[];
  locations: string[];
  industries: string[];
  startupStages: string[];
}

const AngelInvestors = () => {
  const [viewMode, setViewMode] = useState("table");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<AngelTypes | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [angels, setAngels] = useState<AngelTypes[]>([]);
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterState>({
    sectors: [],
    locations: [],
    industries: [],
    startupStage: [],
  });

  const [availableFilters, setAvailableFilters] =
    useState<AvailableFilterState>({
      sectors: [],
      locations: [],
      industries: [],
      startupStages: [],
    });

  const handleCompanyClick = (id: string) => {
    navigate(`/portal/angel-investors/angels-detail/${id}`);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (angels.length > 0) {
      const sectors = _.uniq(angels.flatMap((c) => c.sector));
      const locations = _.uniq(angels.map((c) => c.angelLocation));
      const industries = _.uniq(angels.flatMap((c) => c.focusIndustries));
      const stages = _.uniq(angels.flatMap((c) => c.preferredStartupStage));

      setAvailableFilters({
        sectors,
        locations,
        industries,
        startupStages: stages,
      });
    }
  }, [angels]);

  const applyFilters = (angels: AngelTypes[]) => {
    return angels.filter((angels: AngelTypes) => {
      // First apply search query
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery || // if no search query, return true
        angels.angelName.toLowerCase().includes(searchLower) ||
        angels.sector.some((s) => s.toLowerCase().includes(searchLower)) ||
        angels.focusIndustries.some((industry) =>
          industry.toLowerCase().includes(searchLower)
        );

      if (!matchesSearch) return false;

      // Apply sector filter - Updated to handle array of sectors
      if (
        filters.sectors.length &&
        !angels.sector.some((s) => filters.sectors.includes(s))
      ) {
        return false;
      }

      // Apply location filter
      if (
        filters.locations.length &&
        !filters.locations.includes(angels.angelLocation)
      ) {
        return false;
      }

      // Apply industry filter
      if (
        filters.industries.length &&
        !angels.focusIndustries.some((i) => filters.industries.includes(i))
      ) {
        return false;
      }

      // Apply startup stage filter
      if (
        filters.startupStage.length &&
        !filters.startupStage.some((stage) =>
          angels.preferredStartupStage.includes(stage)
        )
      ) {
        return false;
      }

      return true;
    });
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await angelService.getPublicAngelInvestors();
      if (response.success) {
        setAngels(response.data || []);
      } else {
        notification.error({
          message: "Error",
          description: response.message || "Failed to fetch Angels",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to fetch companies",
      });
    }
    setLoading(false);
  };

  const showModal = (angel: AngelTypes) => {
    console.log("Opening modal for Angel Investor:", angel);
    setModalContent(angel);
    setIsModalVisible(true);
  };

  const handleOk = () => setIsModalVisible(false);
  const handleCancel = () => setIsModalVisible(false);

  const limitWords = (text: string, limit: number) => {
    const words = text.split(" ");
    if (words.length > limit) {
      return words.slice(0, limit).join(" ") + "...";
    }
    return text;
  };

  // Table columns
  const columns = [
    {
      title: "Angel Name",
      key: "angel",
      render: (_: any, record: AngelTypes) => (
        <div className="flex items-center space-x-3">
          <img
            src={record.angelLogo}
            alt={record.angelName}
            className="w-12 h-12 object-contain rounded-lg"
          />
          <div
            onClick={() => handleCompanyClick(record._id)}
            className="cursor-pointer"
          >
            <div className="font-medium">{record.angelName}</div>
            <div className="text-sm text-gray-500">{record.angelLocation}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Sector",
      dataIndex: "sector",
      key: "sector",
      render: (sectors: string[]) => (
        <div className="flex flex-wrap gap-1">
          {sectors.slice(0, 2).map((sector) => (
            <Tag key={sector} color="gold" className="px-3 py-1 rounded-sm">
              {sector}
            </Tag>
          ))}
          {sectors.length > 2 && (
            <Tag color="default" className="rounded-sm">
              +{sectors.length - 2}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Focus Industries",
      dataIndex: "focusIndustries",
      key: "focusIndustries",
      render: (industries: string[]) => (
        <div className="flex flex-wrap gap-1">
          {industries.slice(0, 2).map((industry) => (
            <Tag key={industry} color="cyan" className="rounded-sm">
              {industry}
            </Tag>
          ))}
          {industries.length > 2 && (
            <Tag color="default" className="rounded-sm">
              +{industries.length - 2}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: AngelTypes) => (
        <Space>
          <Button
            type="default"
            icon={<Info className="h-4 w-4" />}
            onClick={() => showModal(record)}
            className="flex items-center hover:bg-gray-100"
          >
            Details
          </Button>
          <Button
            key="visit"
            type="primary"
            icon={<ArrowRight className="h-4 w-4" />}
            onClick={() => {
              const websiteUrl = record.socialLinks?.website;
              if (websiteUrl) {
                const url = websiteUrl.startsWith("http")
                  ? websiteUrl
                  : `https://${websiteUrl}`;
                window.open(url, "_blank");
              } else {
                notification.error({
                  message: "Error",
                  description: "Website URL not available",
                });
              }
            }}
          >
            Visit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-8xl mx-auto ">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Angel Investors</Title>
        <Switch
          checked={viewMode === "grid"}
          onChange={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
          checkedChildren="Grid View"
          unCheckedChildren="Table View"
        />
      </div>

      <Search
        placeholder="Search by company name, sector, or focus area..."
        allowClear
        enterButton
        size="large"
        className="mb-6 max-w-2xl"
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <FilterSection
        filters={filters}
        setFilters={setFilters}
        availableFilters={availableFilters}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {applyFilters(angels).map((angel) => (
            <div key={angel._id}>
              <Card
                hoverable
                className="h-full w-full min-h-[300px] max-w-[400px] mx-auto transition-all duration-300 hover:shadow-lg"
                bodyStyle={{ padding: "24px" }}
              >
                <div className="flex flex-col h-full relative">
                  {/* Info Button in top right */}
                  <Button
                    type="default"
                    icon={<Info className="h-4 w-4" />}
                    onClick={() => showModal(angel)}
                    className="absolute top-0 right-0"
                  ></Button>

                  {/* Visit Button */}
                  <a
                    href={angel.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-0 right-10"
                  >
                    <Button
                      key="visit"
                      type="primary"
                      icon={<ExternalLink className="h-4 w-4" />}
                    ></Button>
                  </a>

                  {/* Company Header */}
                  <div className="block space-y-4 md:space-y-0 items-start gap-4 mb-4">
                    <div
                      className="flex-shrink-0"
                      onClick={() => handleCompanyClick(angel._id)}
                    >
                      <img
                        src={angel.angelLogo}
                        alt={angel.angelName}
                        className="w-20 h-20 object-contain rounded-lg"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3
                        className="text-xl font-semibold mb-2 mt-2"
                        onClick={() => handleCompanyClick(angel._id)}
                      >
                        {angel.angelName}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-gray-500">
                          {angel.angelLocation}
                        </div>
                        <span className="text-gray-500"> • </span>
                        <div className="text-gray-500">{angel.angelType}</div>
                      </div>
                    </div>
                  </div>

                  {/* Sectors */}
                  <div className="mb-3">
                    <div className="font-medium mb-2">Sector</div>
                    <div className="flex flex-wrap gap-2">
                      {angel.sector.map((sector) => (
                        <Tag
                          key={sector}
                          color="gold"
                          className="rounded-sm m-1"
                        >
                          {sector}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  {/* Focus Industries */}
                  <div className="mb-6">
                    <div className="font-medium mb-2">Focus Industries</div>
                    <div className="flex flex-wrap gap-2">
                      {angel.focusIndustries.map((industry) => (
                        <Tag
                          key={industry}
                          color="cyan"
                          className="rounded-sm m-1"
                        >
                          {industry}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={applyFilters(angels)}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            responsive: true,
          }}
          scroll={{ x: "max-content" }}
          className="glassmorphic-table"
        />
      )}

      <Modal
        title={null}
        style={{ top: 20 }}
        open={isModalVisible}
        onCancel={handleCancel}
        width={800}
        className="dark-mode-modal"
        footer={[
          <Button key="back" onClick={handleCancel}>
            Close
          </Button>,
          <Button
            key="visit"
            type="primary"
            icon={<ArrowRight className="h-4 w-4" />}
            onClick={() => modalContent && handleCompanyClick(modalContent._id)}
            iconPosition="end"
          >
            Learn More
          </Button>,
        ]}
      >
        {modalContent && (
          <div className="p-6 dark">
            <div className="flex items-start space-x-6 mb-8">
              <img
                src={modalContent.angelLogo}
                alt={modalContent.angelName}
                className="w-24 h-24 object-contain rounded-lg bg-gray-800"
              />
              <div>
                <Title
                  level={2}
                  style={{ color: "white", marginBottom: "8px" }}
                >
                  {modalContent.angelName}
                </Title>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <span style={{ color: "rgba(255, 255, 255, 0.45)" }}>
                      {modalContent.angelLocation}
                    </span>
                    {/* <Tooltip title={modalContent.institute}>
                      <MapPinned className="h-4 w-4 text-gray-400 hover:text-blue-400" />
                    </Tooltip> */}
                  </div>
                </div>
                <div className="flex space-x-3">
                  {modalContent.socialLinks.website && (
                    <a
                      href={modalContent.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                  {modalContent.socialLinks.linkedin && (
                    <a
                      href={modalContent.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {modalContent.socialLinks.twitter && (
                    <a
                      href={modalContent.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Title level={5} style={{ color: "white", marginBottom: "12px" }}>
                Sectors
              </Title>
              <div className="flex flex-wrap gap-2">
                {modalContent.sector.map((sector) => (
                  <Tag
                    key={sector}
                    color="gold"
                    className="px-3 py-1 rounded-md"
                  >
                    {sector}
                  </Tag>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <Title level={5} style={{ color: "white", marginBottom: "12px" }}>
                Portfolio Companies
              </Title>
              {modalContent.investedCompanies &&
              modalContent.investedCompanies.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {modalContent.investedCompanies.map((company, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex flex-row items-center gap-4">
                        <img
                          src={company.companyLogo}
                          alt={company.companyName}
                          className="w-16 h-16 object-contain rounded-lg mb-2"
                        />
                        <div className="text-center">
                          <div className="text-white font-medium">
                            {company.companyName}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Invested {company.investmentYear}
                          </div>
                          {company.companyWebsite && (
                            <a
                              href={company.companyWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center mt-1"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Visit
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400">
                  No portfolio companies listed
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <Title
                  level={5}
                  style={{ color: "white", marginBottom: "12px" }}
                >
                  About
                </Title>
                <Paragraph style={{ color: "rgba(255, 255, 255, 0.65)" }}>
                  {limitWords(modalContent.about, 50)}
                </Paragraph>
              </div>
            </div>

            <div className="mb-6">
              <Title level={5} style={{ color: "white", marginBottom: "12px" }}>
                Focus Industries
              </Title>
              <div className="flex flex-wrap gap-2">
                {modalContent.focusIndustries.map((industry) => (
                  <Tag
                    key={industry}
                    color="blue"
                    className="px-3 py-1 rounded-md"
                  >
                    {industry}
                  </Tag>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <Title level={5} style={{ color: "white", marginBottom: "12px" }}>
                Preferred Startup Stage
              </Title>
              {/* <Tag color="green">{modalContent.preferredStartupStage}</Tag> */}
              <div className="flex flex-wrap gap-2">
                {modalContent.preferredStartupStage.map((stage) => (
                  <Tag key={stage} color="green">
                    {stage}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AngelInvestors;
