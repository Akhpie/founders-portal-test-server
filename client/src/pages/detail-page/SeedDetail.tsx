import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Card,
  Tag,
  Row,
  Col,
  notification,
  Tooltip,
  Modal,
} from "antd";
import {
  ArrowLeft,
  Mail,
  Linkedin,
  ChevronRight,
  Link,
  Info,
  MapPin,
  ExternalLink,
} from "lucide-react";
import {
  DollarCircleFilled,
  DollarCircleOutlined,
  DoubleRightOutlined,
  TwitterCircleFilled,
} from "@ant-design/icons";
import { CustomIcons, IconImages } from "../../custom-icons/icons";
import Tilt from "react-parallax-tilt";
import { SeedTypes } from "../../types/seed";
import SeedService from "../../services/seedService";

const { Title, Paragraph } = Typography;

interface MapModalProps {
  location: string;
  isOpen: boolean;
  onClose: () => void;
}

const SeedDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seed, setSeed] = React.useState<SeedTypes | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isMapOpen, setIsMapOpen] = useState(false);

  React.useEffect(() => {
    if (id) {
      fetchCompanyDetails(id);
    }
  }, [id]);

  const fetchCompanyDetails = async (seedId: string) => {
    try {
      const response = await SeedService.getSeedInvestorsById(seedId);
      if (response.success && response.data) {
        setSeed(response.data);
      } else {
        notification.error({
          message: "Error",
          description: response.message || "Failed to fetch company details",
        });
        navigate(-1);
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to fetch company details",
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !seed) {
    return <div>Loading...</div>;
  }

  const MapModal: React.FC<MapModalProps> = ({ location, isOpen, onClose }) => {
    const encodedLocation = encodeURIComponent(location);
    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }&q=${encodedLocation}`;

    return (
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={800}
        centered
        title={
          <div className="flex justify-between items-center">
            <span>Location: {location}</span>
          </div>
        }
        bodyStyle={{ padding: 0, height: "500px" }}
        className="map-modal"
      >
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </Modal>
    );
  };

  return (
    <div className="max-w-8xl mx-auto space-y-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <Card className="w-full shadow-sm">
        <Row gutter={[48, 32]}>
          {/* Left Column - Main Content */}
          <Col xs={24} lg={16}>
            <div className="space-y-6">
              {/* Header with Logo */}
              <div className="flex items-start gap-4">
                <img
                  src={seed.seedLogo}
                  alt={seed.seedName}
                  className="w-16 h-16 rounded-lg object-contain bg-gray-50"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Title level={2} className="!mb-0">
                      {seed.seedName}
                    </Title>
                    <a
                      href={seed.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors group"
                    >
                      <DoubleRightOutlined className="h-6 w-6 transform transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>

                  <div className="text-gray-500 mt-2">
                    <Tilt
                      className="inline-block"
                      tiltMaxAngleX={8}
                      tiltMaxAngleY={8}
                      scale={1.05}
                      transitionSpeed={2000}
                      perspective={500}
                    >
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-900/80 to-blue-700/80 backdrop-blur-sm text-gray-100 rounded-sm text-xs font-medium uppercase tracking-wider">
                        {seed.seedType}
                      </span>
                    </Tilt>
                  </div>
                </div>
              </div>

              {/* Startup Stage Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CustomIcons
                    src={IconImages.startup}
                    size={20}
                    className="object-contain"
                  />
                  <Title level={4} className="!mb-0">
                    Preferred Startup Stage
                  </Title>
                </div>
                {seed.preferredStartupStage.map((stage) => (
                  <Tag
                    key={stage}
                    color="green"
                    className="px-3 py-1 text-sm rounded-md"
                  >
                    {stage}
                  </Tag>
                ))}
              </div>

              {/* About Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-blue-800" />
                  <Title level={4} className="!mb-0">
                    About
                  </Title>
                </div>
                <Paragraph className="text-gray-500 text-base leading-relaxed">
                  {seed.about}
                </Paragraph>
              </div>

              {/* Sectors Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CustomIcons
                    src={IconImages.sector}
                    size={20}
                    className="object-contain"
                  />
                  <Title level={4} className="!mb-0">
                    Sectors
                  </Title>
                </div>
                {seed.sector.map((sector) => (
                  <Tag
                    key={sector}
                    color="gold"
                    className="px-3 py-1 text-sm rounded-md"
                  >
                    {sector}
                  </Tag>
                ))}
              </div>

              {/* Industries Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CustomIcons
                    src={IconImages.leaf}
                    size={20}
                    className="object-contain"
                  />
                  <Title level={4} className="!mb-0">
                    Focus Industries
                  </Title>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seed.focusIndustries.map((industry) => (
                    <Tag
                      key={industry}
                      color="blue"
                      className="px-3 py-1 text-sm rounded-md"
                    >
                      {industry}
                    </Tag>
                  ))}
                </div>
              </div>

              {/* Portfolio Companies Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CustomIcons
                    src={IconImages.startup}
                    size={20}
                    className="object-contain"
                  />
                  <Title level={4} className="!mb-0">
                    Portfolio Companies
                  </Title>
                </div>
                {seed.investedCompanies && seed.investedCompanies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {seed.investedCompanies.map((company, index) => (
                      <div
                        key={index}
                        className="bg-transparent rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={company.companyLogo}
                            alt={company.companyName}
                            className="w-16 h-16 object-contain rounded-lg"
                          />
                          <div>
                            <div className="font-medium">
                              {company.companyName}
                            </div>
                            <div className="text-gray-500 text-sm">
                              Invested {company.investmentYear}
                            </div>
                            {company.companyWebsite && (
                              <a
                                href={company.companyWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-1"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Visit Website
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">
                    No portfolio companies listed
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* Right Column - Stats & Contact */}
          <Col xs={24} lg={8}>
            <div className="rounded-xl overflow-hidden bg-white shadow-lg border border-gray-100">
              {/* Top Section with Gradient */}
              <div className="relative p-6 bg-gradient-to-br from-blue-950 via-blue-900 to-[#0a1628]">
                <div className="absolute inset-0 opacity-10" />
                <div className="relative space-y-4">
                  {/* Stats Cards */}
                  <div className="grid lg:grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-all duration-300">
                      <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </span>
                      <p className="mt-1 text-lg font-medium text-white">
                        {seed.seedLocation}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-all duration-300">
                      <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
                        <DollarCircleFilled className="h-4 w-4" />
                        Total Investments
                      </span>
                      <p className="mt-1 text-lg font-medium text-white">
                        {seed.noOfInvestedCompanies}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="p-6 space-y-4 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-900">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  {/* LinkedIn Button */}
                  {seed.socialLinks.linkedin && (
                    <button
                      onClick={() =>
                        window.open(seed.socialLinks.linkedin, "_blank")
                      }
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
                    >
                      <span className="flex items-center gap-2 text-gray-700">
                        <Linkedin className="h-5 w-5" />
                        LinkedIn Profile
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}

                  {/* Social Links */}
                  <div className="flex gap-4 pt-2">
                    {seed.socialLinks.website && (
                      <a
                        href={seed.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Link className="h-5 w-5" />
                      </a>
                    )}
                    {seed.socialLinks.twitter && (
                      <a
                        href={seed.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-950 transition-colors"
                      >
                        <TwitterCircleFilled className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SeedDetail;
