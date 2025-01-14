import { Layout, Card, Form, Input, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProgressSteps from "../components/ProgressSteps";

const { Content } = Layout;
const { Title } = Typography;

export default function UserDetailsForm() {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    navigate("/company-details");
  };

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <ProgressSteps current={1} />
          </div>
          <Card className="shadow-md">
            <Title level={2} className="text-center mb-8">
              Personal Details
            </Title>
            <Form
              name="user-details"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[{ required: true }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                  Continue
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
