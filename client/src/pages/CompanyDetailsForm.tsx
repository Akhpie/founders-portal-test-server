import { Layout, Card, Form, Input, Button, Typography, Select } from "antd";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProgressSteps from "../components/ProgressSteps";

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

export default function CompanyDetailsForm() {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    navigate("/portal");
  };

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <ProgressSteps current={2} />
          </div>
          <Card className="shadow-md">
            <Title level={2} className="text-center mb-8">
              Company Details
            </Title>
            <Form
              name="company-details"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Company Name"
                name="companyName"
                rules={[{ required: true }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Industry"
                name="industry"
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  options={[
                    { value: "tech", label: "Technology" },
                    { value: "health", label: "Healthcare" },
                    { value: "finance", label: "Finance" },
                    { value: "education", label: "Education" },
                    { value: "other", label: "Other" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Company Description"
                name="description"
                rules={[{ required: true }]}
              >
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item
                label="Current Stage"
                name="stage"
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  options={[
                    { value: "idea", label: "Idea Stage" },
                    { value: "mvp", label: "MVP" },
                    { value: "early", label: "Early Traction" },
                    { value: "growth", label: "Growth" },
                  ]}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                  Complete Setup
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
