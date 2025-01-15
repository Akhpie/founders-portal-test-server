import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Progress,
  Typography,
  Steps,
  Select,
  Tooltip,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import {
  CheckCircleIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import starsIcon from "../assets/images/sparkle.png";
import "../styles/RegisterModal.css";

const { Link } = Typography;
const { Step } = Steps;
const { Option } = Select;

interface RegisterModalProps {
  visible: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ visible, onClose }) => {
  const [registerForm] = Form.useForm();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [userType, setUserType] = useState<"founder" | "visitor">("founder");

  const enhanceText = async (
    registerForm: any,
    setIsEnhancing: (value: boolean) => void,
    setFormData: (updater: (prev: any) => any) => void
  ) => {
    const currentDescription = registerForm.getFieldValue("companyDescription");

    if (!currentDescription) {
      message.warning("Please enter some text to enhance");
      return;
    }

    setIsEnhancing(true);

    try {
      const response = await axios.post(
        "https://founders-portal-test-server-apii.onrender.com/api/ai/enhance-text",
        {
          text: currentDescription,
        }
      );

      const enhancedText = response.data.enhancedText;

      // Update both form and local state
      registerForm.setFieldsValue({
        companyDescription: enhancedText,
      });

      setFormData((prev: any) => ({
        ...prev,
        companyDescription: enhancedText,
      }));

      message.success("Text enhanced successfully!");
    } catch (error) {
      console.error("Enhancement error:", error);
      message.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Failed to enhance text. Please try again."
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 20) return "#ff4d4f";
    if (strength <= 40) return "#faad14";
    if (strength <= 60) return "#fadb14";
    if (strength <= 80) return "#52c41a";
    return "#237804";
  };

  const onRegisterFinish = async () => {
    try {
      const allFormData = await registerForm.validateFields();
      const finalData = {
        ...formData,
        ...allFormData,
      };

      const endpoint =
        userType === "founder"
          ? "https://founders-portal-test-server-apii.onrender.com/api/register"
          : "https://founders-portal-test-server-apii.onrender.com/api/register-visitor";

      const response = await axios.post(endpoint, finalData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.message) {
        message.success(
          "Registration successful! Please verify your email to continue."
        );
        onClose();
        registerForm.resetFields();
        setCurrentStep(0);
        setFormData({});
      }
    } catch (error: any) {
      if (error.errorFields) {
        message.error("Please fill in all required fields correctly");
      } else {
        console.error("Registration error:", error.response?.data || error);
        message.error(
          error.response?.data?.message ||
            "Registration failed. Please try again."
        );
      }
    }
  };

  const next = async () => {
    try {
      // Get current step's form values
      const currentStepValues = await registerForm.validateFields();

      // Store current step's data
      setFormData((prev: any) => ({
        ...prev,
        ...currentStepValues,
      }));

      // Debug log for current step
      console.log("Current step data:", {
        ...currentStepValues,
        password: currentStepValues.password ? "[PRESENT]" : "[MISSING]",
      });

      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: "Account Info",
      content: (
        <>
          <Form.Item
            name="userType"
            rules={[{ required: true, message: "Please select user type!" }]}
            style={{ marginBottom: 10 }}
          >
            <Select
              placeholder="Select User Type"
              size="large"
              onChange={(value) => setUserType(value)}
            >
              <Option value="founder">Founder</Option>
              <Option value="visitor">Visitor</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="fullName"
            rules={[
              { required: true, message: "Please input your full name!" },
            ]}
            style={{ marginBottom: 10 }}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Full Name"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
            style={{ marginBottom: 10 }}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 8, message: "Password must be at least 8 characters!" },
            ]}
            style={{ marginBottom: 10 }}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              onChange={(e) =>
                setPasswordStrength(calculatePasswordStrength(e.target.value))
              }
            />
          </Form.Item>
          {passwordStrength > 0 && (
            <Progress
              percent={passwordStrength}
              strokeColor={getPasswordStrengthColor(passwordStrength)}
              size="small"
              format={() =>
                ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"][
                  passwordStrength / 20 - 1
                ]
              }
            />
          )}
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>
        </>
      ),
    },
    {
      title: "Personal Details",
      content: (
        <>
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: "Please enter your phone number!" },
            ]}
          >
            <Input placeholder="Phone Number" size="large" />
          </Form.Item>
          <Form.Item
            name="location"
            rules={[{ required: true, message: "Please enter your location!" }]}
          >
            <Input placeholder="Location" size="large" />
          </Form.Item>
        </>
      ),
    },
    {
      title: userType === "founder" ? "Company Details" : "Work Details",
      content:
        userType === "founder" ? (
          // Founder form fields
          <>
            <Form.Item
              name="companyName"
              rules={[
                { required: true, message: "Please enter company name!" },
              ]}
            >
              <Input placeholder="Company Name" size="large" />
            </Form.Item>
            <Form.Item
              name="foundedYear"
              rules={[
                { required: true, message: "Please enter founded year!" },
              ]}
            >
              <Input type="number" placeholder="Founded year" size="large" />
            </Form.Item>
            <Form.Item name="linkedinUrl" rules={[{ required: false }]}>
              <Input type="url" placeholder="Linkedin Url" size="large" />
            </Form.Item>
            <Form.Item
              name="industry"
              rules={[{ required: true, message: "Please select industry!" }]}
            >
              <Select placeholder="Select Industry" size="large">
                <Option value="tech">Tech</Option>
                <Option value="finance">Finance</Option>
                <Option value="healthcare">Healthcare</Option>
                <Option value="education">Education</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="companyDescription"
              rules={[
                {
                  required: true,
                  message: "Please enter company description!",
                },
              ]}
            >
              <div className="relative">
                <Input.TextArea
                  placeholder="Company Description"
                  rows={4}
                  value={formData.companyDescription || undefined}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    registerForm.setFieldsValue({
                      companyDescription: newValue,
                    });
                    setFormData((prev: any) => ({
                      ...prev,
                      companyDescription: newValue,
                    }));
                  }}
                />
                <Tooltip title="Enhance text">
                  <img
                    src={starsIcon}
                    alt="enhance"
                    className="absolute top-3 right-3 cursor-pointer hover:opacity-80 transition-opacity duration-100 enhance-text-btn"
                    onClick={() =>
                      enhanceText(registerForm, setIsEnhancing, setFormData)
                    }
                  />
                </Tooltip>
              </div>
            </Form.Item>
            <Form.Item
              name="currentStage"
              rules={[
                { required: true, message: "Please select current stage!" },
              ]}
            >
              <Select placeholder="Current Stage" size="large">
                <Option value="seed">Seed</Option>
                <Option value="pre-seed">Pre-seed</Option>
                <Option value="series-a">Series A</Option>
              </Select>
            </Form.Item>
          </>
        ) : (
          // Visitor form fields
          <>
            <Form.Item
              name="companyWorkingAt"
              rules={[
                { required: true, message: "Please enter your company name!" },
              ]}
            >
              <Input placeholder="Company you work at" size="large" />
            </Form.Item>
            <Form.Item name="linkedinUrl" rules={[{ required: false }]}>
              <Input type="url" placeholder="LinkedIn URL" size="large" />
            </Form.Item>
          </>
        ),
    },
  ];

  return (
    <Modal
      title="Register for VentureFlow"
      open={visible}
      onCancel={() => {
        onClose();
        registerForm.resetFields();
        setCurrentStep(0);
        setPasswordStrength(0);
      }}
      footer={null}
      width={700}
      className="register-modal"
    >
      <Steps current={currentStep} size="small" className="mb-6 mt-6">
        {steps.map((step) => (
          <Step key={step.title} title={step.title} />
        ))}
      </Steps>
      <Form
        form={registerForm}
        layout="vertical"
        onFinish={onRegisterFinish}
        initialValues={formData}
      >
        {steps[currentStep].content}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {currentStep > 0 && (
            <Button onClick={prev} size="default" icon={<ChevronsLeftIcon />}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button
              type="primary"
              onClick={next}
              size="default"
              icon={<ChevronsRightIcon />}
              iconPosition="end"
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<CheckCircleIcon />}
              iconPosition="end"
            >
              Register
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default RegisterModal;
