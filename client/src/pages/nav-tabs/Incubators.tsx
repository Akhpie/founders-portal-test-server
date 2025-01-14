import { useState, useEffect } from "react";
import { SortOrder } from "antd/es/table/interface";
import {
  Typography,
  Card,
  List,
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
  Calendar,
  Tooltip,
} from "antd";
import {
  ArrowRight,
  Info,
  Linkedin,
  Twitter,
  Globe2,
  CalendarCheck2,
  Link,
  ExternalLink,
  BuildingIcon,
  MapPinned,
} from "lucide-react";
import IncubatorService from "../../services/incubatorService";
import { IncubatorTypes } from "../../types/incubator";
import AIChatModal from "../../components/AIChatModal";
import "../../styles/Incubators.css";
import "../../styles/Glasstable.css";
import FilterSection from "../../components/FilterSection";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { DoubleRightOutlined } from "@ant-design/icons";
import { CustomIcons, IconImages } from "../../custom-icons/icons";

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

interface FilterState {
  sectors: string[];
  locations: string[];
  industries: string[];
  investmentRange: [number, number];
  startupStage: string[];
  establishedYear: [number, number];
}

interface AvailableFilterState {
  sectors: string[];
  locations: string[];
  industries: string[];
  startupStages: string[];
  maxInvestment: number;
}

interface FilterSectionProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableFilters: AvailableFilterState;
}

const Incubators = () => {
  const [viewMode, setViewMode] = useState("table");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<IncubatorTypes | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<IncubatorTypes[]>([]);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterState>({
    sectors: [],
    locations: [],
    industries: [],
    investmentRange: [0, 1000000],
    startupStage: [],
    establishedYear: [1900, new Date().getFullYear()],
  });

  const [availableFilters, setAvailableFilters] =
    useState<AvailableFilterState>({
      sectors: [],
      locations: [],
      industries: [],
      startupStages: [],
      maxInvestment: 1000000,
    });

  const handleCompanyClick = (id: string) => {
    navigate(`/portal/incubators/incubators-detail/${id}`);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (companies.length > 0) {
      const sectors = _.uniq(companies.flatMap((c) => c.sector));
      const locations = _.uniq(companies.map((c) => c.companyLocation));
      const industries = _.uniq(companies.flatMap((c) => c.focusIndustries));
      const stages = _.uniq(companies.flatMap((c) => c.preferredStartupStage));
      const maxInv = Math.max(...companies.map((c) => c.funds.maxInvestment));

      setAvailableFilters({
        sectors,
        locations,
        industries,
        startupStages: stages,
        maxInvestment: maxInv,
      });
    }
  }, [companies]);

  const applyFilters = (companies: IncubatorTypes[]) => {
    return companies.filter((company: IncubatorTypes) => {
      // First apply search query
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery || // if no search query, return true
        company.companyName.toLowerCase().includes(searchLower) ||
        company.sector.some((s) => s.toLowerCase().includes(searchLower)) || // Fix: handle sector as array
        company.focusIndustries.some((industry) =>
          industry.toLowerCase().includes(searchLower)
        );

      if (!matchesSearch) return false;

      // Apply sector filter - Updated to handle array of sectors
      if (
        filters.sectors.length &&
        !company.sector.some((s) => filters.sectors.includes(s))
      ) {
        return false;
      }

      // Apply location filter
      if (
        filters.locations.length &&
        !filters.locations.includes(company.companyLocation)
      ) {
        return false;
      }

      // Apply industry filter
      if (
        filters.industries.length &&
        !company.focusIndustries.some((i) => filters.industries.includes(i))
      ) {
        return false;
      }

      // Apply investment range filter
      const [minInv, maxInv] = filters.investmentRange;
      if (
        company.funds.maxInvestment < minInv ||
        company.funds.minInvestment > maxInv
      ) {
        return false;
      }

      // Apply startup stage filter
      if (
        filters.startupStage.length &&
        !filters.startupStage.some((stage) =>
          company.preferredStartupStage.includes(stage)
        )
      ) {
        return false;
      }

      // Apply establishment year filter
      const [minYear, maxYear] = filters.establishedYear;
      if (
        company.yearOfEstablishment < minYear ||
        company.yearOfEstablishment > maxYear
      ) {
        return false;
      }

      return true;
    });
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await IncubatorService.getPublicIncubatorCompanies();
      if (response.success) {
        setCompanies(response.data || []);
      } else {
        notification.error({
          message: "Error",
          description: response.message || "Failed to fetch companies",
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

  const showModal = (company: IncubatorTypes) => {
    console.log("Opening modal for company:", company);
    setModalContent(company);
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
  // const columns = [
  //   {
  //     title: "Incubator Name",
  //     key: "company",
  //     render: (_: any, record: IncubatorTypes) => (
  //       <div className="flex items-center space-x-3">
  //         <img
  //           src={record.companyLogo}
  //           alt={record.companyName}
  //           className="w-12 h-12 object-contain rounded-lg"
  //         />
  //         <div
  //           onClick={() => handleCompanyClick(record._id)}
  //           className="cursor-pointer"
  //         >
  //           <div className="font-medium">{record.companyName}</div>
  //           <div className="text-sm text-gray-500">
  //             {record.companyLocation}
  //           </div>
  //         </div>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Year Estd",
  //     dataIndex: "yearOfEstablishment",
  //     key: "yearOfEstablishment",
  //     render: (text: string) => <span className="font-medium">{text}</span>,
  //   },
  //   {
  //     title: "Sector",
  //     dataIndex: "sector",
  //     key: "sector",
  //     render: (sectors: string[]) => (
  //       <div className="flex flex-wrap gap-1">
  //         {sectors.slice(0, 2).map((sector) => (
  //           <Tag key={sector} color="gold" className="px-3 py-1 rounded-sm">
  //             {sector}
  //           </Tag>
  //         ))}
  //         {sectors.length > 2 && (
  //           <Tag color="default" className="rounded-sm">
  //             +{sectors.length - 2}
  //           </Tag>
  //         )}
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Focus Industries",
  //     dataIndex: "focusIndustries",
  //     key: "focusIndustries",
  //     render: (industries: string[]) => (
  //       <div className="flex flex-wrap gap-1">
  //         {industries.slice(0, 2).map((industry) => (
  //           <Tag key={industry} color="cyan" className="rounded-sm">
  //             {industry}
  //           </Tag>
  //         ))}
  //         {industries.length > 2 && (
  //           <Tag color="default" className="rounded-sm">
  //             +{industries.length - 2}
  //           </Tag>
  //         )}
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Actions",
  //     key: "actions",
  //     render: (_: any, record: IncubatorTypes) => (
  //       <Space>
  //         <Button
  //           type="default"
  //           icon={<Info className="h-4 w-4" />}
  //           onClick={() => showModal(record)}
  //           className="flex items-center hover:bg-gray-100"
  //         >
  //           Details
  //         </Button>
  //         <Button
  //           key="visit"
  //           type="primary"
  //           icon={<ArrowRight className="h-4 w-4" />}
  //           onClick={() => {
  //             const websiteUrl = record.socialLinks?.website;
  //             if (websiteUrl) {
  //               const url = websiteUrl.startsWith("http")
  //                 ? websiteUrl
  //                 : `https://${websiteUrl}`;
  //               window.open(url, "_blank");
  //             } else {
  //               notification.error({
  //                 message: "Error",
  //                 description: "Website URL not available",
  //               });
  //             }
  //           }}
  //         >
  //           Visit
  //         </Button>
  //       </Space>
  //     ),
  //   },
  // ];

  const columns = [
    {
      title: "Incubator Name",
      key: "company",
      render: (_: any, record: IncubatorTypes) => (
        <div className="flex items-center space-x-3">
          <img
            src={record.companyLogo}
            alt={record.companyName}
            className="w-12 h-12 object-contain rounded-lg"
          />
          <div
            onClick={() => handleCompanyClick(record._id)}
            className="cursor-pointer"
          >
            <div className="font-medium">{record.companyName}</div>
            <div className="text-sm text-gray-500">
              {record.companyLocation}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Year Estd",
      dataIndex: "yearOfEstablishment",
      key: "yearOfEstablishment",
      sorter: (a: IncubatorTypes, b: IncubatorTypes) =>
        a.yearOfEstablishment - b.yearOfEstablishment,
      defaultSortOrder: "descend" as SortOrder,
      render: (text: string) => <span className="font-medium">{text}</span>,
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
      render: (_: any, record: IncubatorTypes) => (
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  function handleWebsiteRedirect(website: string | undefined): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="max-w-8xl mx-auto ">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Incubators</Title>
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
          {applyFilters(companies).map((company) => (
            <div key={company._id}>
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
                    onClick={() => showModal(company)}
                    className="absolute top-0 right-0"
                  ></Button>

                  {/* Visit Button */}
                  <a
                    href={company.socialLinks.website}
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
                      onClick={() => handleCompanyClick(company._id)}
                    >
                      <img
                        src={company.companyLogo}
                        alt={company.companyName}
                        className="w-20 h-20 object-contain rounded-lg"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3
                        className="text-xl font-semibold mb-2 mt-2"
                        onClick={() => handleCompanyClick(company._id)}
                      >
                        {company.companyName}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-gray-500">
                          {company.companyLocation}
                        </div>
                        <span className="text-gray-500"> • </span>
                        <div className="text-gray-500">
                          {company.companyType}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sectors */}
                  <div className="mb-3">
                    <div className="font-medium mb-2">Sector</div>
                    <div className="flex flex-wrap gap-2">
                      {company.sector.map((sector) => (
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
                      {company.focusIndustries.map((industry) => (
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
          dataSource={applyFilters(companies)}
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
                src={modalContent.companyLogo}
                alt={modalContent.companyName}
                className="w-24 h-24 object-contain rounded-lg bg-gray-800"
              />
              <div>
                <Title
                  level={2}
                  style={{ color: "white", marginBottom: "8px" }}
                >
                  {modalContent.companyName}
                </Title>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <span style={{ color: "rgba(255, 255, 255, 0.45)" }}>
                      {modalContent.companyLocation}
                    </span>
                    <Tooltip title={modalContent.institute}>
                      <MapPinned className="h-4 w-4 text-gray-400 hover:text-blue-400" />
                    </Tooltip>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="space-y-4">
                <div>
                  <Title
                    level={5}
                    style={{ color: "white", marginBottom: "12px" }}
                  >
                    Investment Range
                  </Title>
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-2xl font-semibold text-white">
                      {formatCurrency(
                        modalContent.funds.minInvestment,
                        modalContent.funds.currency
                      )}
                      {" - "}
                      {formatCurrency(
                        modalContent.funds.maxInvestment,
                        modalContent.funds.currency
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Title
                    level={5}
                    style={{ color: "white", marginBottom: "12px" }}
                  >
                    Year of Establishment
                  </Title>
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <CalendarCheck2 />
                      <span className="text-2xl font-semibold text-white">
                        {modalContent.yearOfEstablishment}
                      </span>
                    </div>
                  </div>
                </div>
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

            <div>
              <Title level={5} style={{ color: "white", marginBottom: "12px" }}>
                Point of Contact
              </Title>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                {modalContent.pointOfContact?.name && (
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-900 rounded-full p-3">
                      <svg
                        className="w-6 h-6 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {modalContent.pointOfContact.name}
                      </div>
                      <div style={{ color: "rgba(255, 255, 255, 0.45)" }}>
                        {modalContent.pointOfContact.position}
                      </div>
                      <div className="text-blue-400">
                        {modalContent.pointOfContact.email}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Incubators;
