import React, { useEffect, useState } from "react";
import {
  Typography,
  Input,
  Collapse,
  Form,
  Button,
  notification,
  Spin,
} from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import type { CSSProperties } from "react";
import { theme } from "antd";
import faqService from "../../services/faqService";

const { Title, Text } = Typography;

interface FAQItem {
  key: string;
  label: string;
  content: string;
}

interface CategorizedFAQs {
  [category: string]: FAQItem[];
}

const SupportPage: React.FC = () => {
  const { token } = theme.useToken();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categorizedFaqs, setCategorizedFaqs] = useState<CategorizedFAQs>({});
  const [filteredFaqs, setFilteredFaqs] = useState<CategorizedFAQs>({});
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFaqs();
  }, []);

  // Fetch FAQs from backend
  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const response = await faqService.getPublicFaqs();
      if (response.success) {
        setCategorizedFaqs(response.data);
        setFilteredFaqs(response.data);
      } else {
        notification.error({
          message: "Error",
          description: response.message || "Failed to fetch FAQs",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to fetch FAQs",
      });
    }
    setLoading(false);
  };

  // Filter FAQs based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredFaqs(categorizedFaqs);
      return;
    }

    const filtered: CategorizedFAQs = Object.entries(categorizedFaqs).reduce(
      (acc, [category, faqs]) => {
        const matchingFaqs = faqs.filter((faq) =>
          faq.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (matchingFaqs.length) acc[category] = matchingFaqs;
        return acc;
      },
      {} as CategorizedFAQs
    );
    setFilteredFaqs(filtered);
  }, [searchQuery, categorizedFaqs]);

  // Save form data to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("supportFormData");
    if (savedData) {
      form.setFieldsValue(JSON.parse(savedData));
    }
  }, [form]);

  const onFinish = (values: Record<string, string>) => {
    // Here you can implement the API call to send the contact form data
    notification.success({
      message: "Success",
      description: "Your message has been sent successfully!",
    });
    localStorage.removeItem("supportFormData");
    form.resetFields();
  };

  const onValuesChange = (
    changedValues: Record<string, string>,
    allValues: Record<string, string>
  ) => {
    localStorage.setItem("supportFormData", JSON.stringify(allValues));
  };

  const panelStyle: CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <Title level={2} style={{ marginBottom: "16px" }}>
          Support Center
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          How can we help you? Use the search bar or browse our FAQs below.
        </Text>
      </div>

      {/* Search */}
      <Input.Search
        placeholder="Search FAQs"
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "20px auto 0",
          marginBottom: "30px",
        }}
        size="large"
      />

      {/* FAQs */}
      <div style={{ marginBottom: "40px" }}>
        <Title level={3} style={{ marginBottom: "20px" }}>
          Frequently Asked Questions
        </Title>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : Object.keys(filteredFaqs).length > 0 ? (
          Object.keys(filteredFaqs).map((category) => (
            <div key={category} style={{ marginBottom: "20px" }}>
              <Title level={4} style={{ marginBottom: "12px" }}>
                {category}
              </Title>
              <Collapse
                bordered={false}
                defaultActiveKey={["1"]}
                size="large"
                ghost
                expandIcon={({ isActive }) => (
                  <CaretRightOutlined rotate={isActive ? 90 : 0} />
                )}
                items={filteredFaqs[category].map((faq) => ({
                  key: faq.key,
                  label: faq.label,
                  children: <p>{faq.content}</p>,
                  style: panelStyle,
                }))}
              />
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Text type="secondary">
              {searchQuery
                ? "No FAQs found matching your search"
                : "No FAQs available"}
            </Text>
          </div>
        )}
      </div>

      {/* Contact Form */}
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Title level={3} style={{ marginBottom: "24px" }}>
          Contact Us
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={onValuesChange}
          style={{
            padding: "24px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            background: token.colorBgContainer,
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <Input.TextArea rows={4} placeholder="Type your message here..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SupportPage;
