import { useState, useEffect } from "react";
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
  Select,
  Tooltip,
} from "antd";
import { Info, X, Maximize2, Filter, Calendar } from "lucide-react";
import axios from "axios";
import linkedInIcon from "../../assets/images/icons8-linkedin-48.png";

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Influencer {
  id: string;
  name: string;
  linkedinUrl: string;
  bio: string;
  focus: string[];
  description: string;
  imageUrl?: string;
}

const StartupInfluencers = () => {
  const [viewMode, setViewMode] = useState("table");
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<Influencer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isCalendlyModalVisible, setIsCalendlyModalVisible] = useState(false);

  const openCalendly = () => {
    setIsCalendlyModalVisible(true);
  };

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/startup-influencers"
      );
      setInfluencers(response.data);
    } catch (error) {
      console.error("Error fetching influencers:", error);
    }
    setLoading(false);
  };

  // Get unique focus areas from all influencers
  const getAllFocusAreas = () => {
    const focusSet = new Set<string>();
    influencers.forEach((influencer) => {
      influencer.focus.forEach((focus) => focusSet.add(focus));
    });
    return Array.from(focusSet).sort();
  };

  const showModal = (influencer: Influencer) => {
    setModalContent(influencer);
    setIsModalVisible(true);
  };

  const handleSocialRedirect = (url: string) => {
    window.open(url, "_blank");
  };

  const handleFilterChange = (values: string[]) => {
    setSelectedFocusAreas(values);
  };

  const resetFilters = () => {
    setSelectedFocusAreas([]);
    setSearchQuery("");
  };

  const filteredInfluencers = influencers.filter((influencer) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      influencer.name.toLowerCase().includes(searchLower) ||
      influencer.focus.some((tag) => tag.toLowerCase().includes(searchLower));

    const matchesFocusAreas =
      selectedFocusAreas.length === 0 ||
      selectedFocusAreas.some((area) => influencer.focus.includes(area));

    return matchesSearch && matchesFocusAreas;
  });

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
      title: "Social Links",
      key: "social",
      render: (_: any, record: Influencer) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleSocialRedirect(record.linkedinUrl)}
            className="p-2 rounded-md bg-blue-800/90 hover:bg-blue-700/90 transition-all duration-200 flex items-center justify-center text-white shadow-sm"
            aria-label="LinkedIn"
          >
            <img src={linkedInIcon} className="w-5 h-5 shadow-lg" />
          </button>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Influencer) => (
        <Button
          type="default"
          icon={<Info className="w-4 h-4" />}
          onClick={() => showModal(record)}
        >
          Info
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2} className="flex gap-2">
          Startup Influencers
        </Title>
        <Switch
          checked={viewMode === "grid"}
          onChange={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
          checkedChildren="Grid View"
          unCheckedChildren="Table View"
        />
      </div>
      <div className="flex-col md:flex-row gap-4">
        <Search
          placeholder="Search by name or focus area..."
          allowClear
          enterButton
          size="large"
          className="max-w-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-2 items-center mt-4">
          <Select
            mode="multiple"
            placeholder="Filter by focus areas"
            value={selectedFocusAreas}
            onChange={handleFilterChange}
            style={{ minWidth: "200px" }}
            maxTagCount="responsive"
          >
            {getAllFocusAreas().map((focus) => (
              <Option key={focus} value={focus}>
                {focus}
              </Option>
            ))}
          </Select>
          <Tooltip title="Reset all filters">
            <Button
              icon={<Filter className="w-4 h-4" />}
              onClick={resetFilters}
              disabled={!searchQuery && selectedFocusAreas.length === 0}
            >
              Reset
            </Button>
          </Tooltip>

          {/* //! CALENDLY INTEGRATION */}
          {/* <Tooltip title="Schedule a meeting">
            <Button
              type="primary"
              icon={<Calendar className="w-4 h-4" />}
              onClick={openCalendly} // Remove the URL parameter
              className="bg-blue-600 hover:bg-blue-500"
            ></Button>
          </Tooltip> */}
        </div>
      </div>
      {/* Results summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredInfluencers.length} of {influencers.length} influencers
      </div>
      {viewMode === "table" ? (
        <Table
          columns={columns}
          dataSource={filteredInfluencers}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="shadow-md rounded-lg glassmorphic-table"
          scroll={{ x: 1000 }}
        />
      ) : (
        <List
          grid={{
            gutter: [16, 16],
            xs: 1,
            sm: 1,
            md: 2,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={filteredInfluencers}
          loading={loading}
          renderItem={(influencer) => (
            <List.Item>
              <Card hoverable className="h-full">
                <div className="flex flex-col h-full">
                  {/* Header Section with Info Button */}
                  <div className="relative flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      {influencer.imageUrl && (
                        <img
                          src={influencer.imageUrl}
                          alt={influencer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <Title level={4} className="m-0 text-base sm:text-lg">
                        {influencer.name}
                      </Title>
                    </div>
                    <Button
                      onClick={() => showModal(influencer)}
                      className="absolute top-0 right-0 p-2 rounded-md"
                      aria-label="More information"
                      icon={<Info className="w-4 h-4" />}
                    ></Button>
                  </div>

                  {/* Tags Section */}
                  <div className="mb-4 flex flex-wrap gap-1">
                    {influencer.focus.map((tag) => (
                      <Tag key={tag} color="blue" className="mb-0">
                        {tag}
                      </Tag>
                    ))}
                  </div>

                  {/* Description Section */}
                  <Paragraph className="flex-grow text-sm sm:text-base mb-4 line-clamp-3">
                    {influencer.description}
                  </Paragraph>

                  {/* Social Buttons Section */}
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() =>
                        handleSocialRedirect(influencer.linkedinUrl)
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-blue-800/90 hover:bg-blue-700/90 text-white text-sm transition-colors duration-200"
                    >
                      <img
                        src={linkedInIcon}
                        className="w-6 h-6 shadow-xl"
                        alt="LinkedIn"
                      />
                      <span className="hidden sm:inline">LinkedIn</span>
                    </button>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
      {/* Existing modals remain unchanged */}
      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
        className="dark-mode-modal"
      >
        {modalContent && (
          <div className="relative">
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                {modalContent.imageUrl && (
                  <div className="relative group">
                    <img
                      src={modalContent.imageUrl}
                      alt={modalContent.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 dark:border-cyan-800 cursor-pointer"
                      onClick={() => setIsImageModalVisible(true)}
                    />
                    <button
                      onClick={() => setIsImageModalVisible(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full"
                      aria-label="View full image"
                    >
                      <Maximize2 className="w-6 h-6 text-white" />
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 dark:text-white">
                    {modalContent.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {modalContent.focus.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-md text-sm bg-gradient-to-r from-blue-900/40 to-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {modalContent.description}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2 dark:text-white">
                  About
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-sans font-semibold text-xl">
                  {modalContent.bio}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <button
                  onClick={() => handleSocialRedirect(modalContent.linkedinUrl)}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-900/90 hover:bg-blue-700/90 text-white text-sm font-medium transition-colors duration-200"
                >
                  <img src={linkedInIcon} className="w-5 h-5" />
                  <span>Visit LinkedIn Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={isImageModalVisible}
        footer={null}
        onCancel={() => setIsImageModalVisible(false)}
        width="auto"
        centered
        closeIcon={<X className="text-white" />}
        className="image-modal"
        styles={{
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          },
          content: {
            background: "transparent",
            boxShadow: "none",
          },
        }}
      >
        {modalContent && modalContent.imageUrl && (
          <img
            src={modalContent.imageUrl}
            alt={modalContent.name}
            className="w-96 max-h-[90vh] h-auto object-contain"
          />
        )}
      </Modal>

      <Modal
        open={isCalendlyModalVisible}
        onCancel={() => setIsCalendlyModalVisible(false)}
        footer={null}
        width={1200}
        centered
        className="calendly-modal"
        styles={{
          body: {
            padding: 0,
            overflow: "hidden",
          },
        }}
      >
        <div style={{ height: "600px" }}>
          <iframe
            src="https://calendly.com/akhilpie3/30min/widget"
            width="100%"
            height="100%"
            frameBorder="0"
          ></iframe>
        </div>
      </Modal>
    </div>
  );
};

export default StartupInfluencers;
