import React, { useState, useEffect } from "react";
import {
  Card,
  Pagination,
  Spin,
  Modal,
  Button,
  Row,
  Col,
  Typography,
} from "antd";
import { EyeOutlined, LinkOutlined, FilterOutlined } from "@ant-design/icons";
import "./NewsDisplay.css";

const { Meta } = Card;

interface Article {
  title: string;
  url: string;
  socialimage: string;
  domain: string;
  seendate: string;
  sourcecountry: string;
}

const NewsDisplay: React.FC = () => {
  const [newsData, setNewsData] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(6);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [filterIndia, setFilterIndia] = useState<boolean>(false);

  // Fetch and sort news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          "https://api.gdeltproject.org/api/v2/doc/doc?query=(Investors+OR+Investments+OR+VCs)&mode=ArtList&maxrecords=100&format=json"
        );
        if (!response.ok) throw new Error("Failed to fetch news data");
        const data = await response.json();

        // Sort articles: "India" first
        const sortedArticles = [...data.articles].sort(
          (a: Article, b: Article) => {
            return a.sourcecountry === "India"
              ? -1
              : b.sourcecountry === "India"
              ? 1
              : 0;
          }
        );

        setNewsData(sortedArticles || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Handle page change
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  // Show iframe preview
  const showIframe = (url: string): void => {
    setIframeUrl(url);
  };

  const closeModal = (): void => {
    setIframeUrl(null);
  };

  // Filter logic
  const toggleFilter = () => {
    setFilterIndia((prev) => !prev);
    setCurrentPage(1); // Reset to first page after toggling filter
  };

  // Filtered and paginated articles
  const filteredData = filterIndia
    ? newsData.filter((article) => article.sourcecountry === "India")
    : newsData;

  const paginatedArticles = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  const formatDate = (dateStr: string): string => {
    // Return early if no date string provided
    if (!dateStr) return "Date Not Available";

    try {
      // Handle GDELT format: "20241118T144500Z"
      if (dateStr.includes("T") && dateStr.endsWith("Z")) {
        // Extract date parts
        const year = dateStr.slice(0, 4);
        const month = dateStr.slice(4, 6);
        const day = dateStr.slice(6, 8);
        const hour = dateStr.slice(9, 11);
        const minute = dateStr.slice(11, 13);

        // Create date object using ISO format
        const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`);

        // Format options for date display
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        };

        return date.toLocaleDateString(undefined, options);
      }

      // Fallback for other date formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      // Return formatted date
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  return (
    <>
      <Card
        title="News"
        headStyle={{
          fontSize: "24px",
          fontWeight: "600",
          padding: "16px 24px",
        }}
        className="glassmorphism"
      >
        <div className="space-y-6">
          {/* Filter Toggle */}
          <div className="flex justify-end mb-4">
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={toggleFilter}
            >
              {filterIndia ? "Show All Articles" : "Show Only India"}
            </Button>
          </div>

          {/* Article Cards */}
          <Row gutter={[16, 16]}>
            {paginatedArticles.map((article: Article, index: number) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  hoverable
                  className="h-full"
                  cover={
                    <img
                      alt={article.title}
                      src={article.socialimage || "/api/placeholder/300/200"}
                      className="h-48 object-cover"
                    />
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => showIframe(article.url)}
                    >
                      Preview
                    </Button>,
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 mt-1"
                    >
                      <LinkOutlined /> Visit
                    </a>,
                  ]}
                >
                  <Meta
                    title={
                      <div className="line-clamp-2 h-12">{article.title}</div>
                    }
                    description={
                      <div>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-semibold">Source:</span>{" "}
                            {article.domain}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Date:</span>{" "}
                            {formatDate(article.seendate)}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Country:</span>{" "}
                            {article.sourcecountry || "N/A"}
                          </p>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredData.length}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>

          {/* Iframe Modal */}
          <Modal
            title="Article Preview"
            open={iframeUrl !== null}
            onCancel={closeModal}
            footer={null}
            width="80%"
            style={{ top: 20 }}
          >
            {iframeUrl && (
              <iframe
                src={iframeUrl}
                title="Article Preview"
                style={{ width: "100%", height: "80vh", border: "none" }}
              />
            )}
          </Modal>
        </div>
      </Card>
    </>
  );
};

export default NewsDisplay;
