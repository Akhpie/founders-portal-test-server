import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  notification,
  Space,
  Popconfirm,
  InputNumber,
  Menu,
  Dropdown,
  Row,
  Col,
  Upload,
  Tag,
} from "antd";
import type { UploadProps } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownloadOutlined,
  DownOutlined,
  InboxOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import IncubatorService from "../../../services/incubatorService";
import { Typography } from "antd";
import { IncubatorTypes } from "../../../types/incubator";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const { Option } = Select;
const { Title } = Typography;
const { TextArea } = Input;

const IncubatorManagement: React.FC = () => {
  const [companies, setCompanies] = useState<IncubatorTypes[]>([]);

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState<IncubatorTypes | null>(
    null
  );
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<IncubatorTypes[]>(
    []
  );
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    handleSearch(searchText);
  }, [companies, searchText]);

  // ! Search Functionality
  const handleSearch = (value: string) => {
    setSearchText(value);
    const searchLower = value.toLowerCase();

    const filtered = companies.filter((company) => {
      return (
        company.companyName?.toLowerCase().includes(searchLower) ||
        company.companyLocation?.toLowerCase().includes(searchLower) ||
        company.sector?.some((s) => s.toLowerCase().includes(searchLower)) ||
        company.companyType?.toLowerCase().includes(searchLower) ||
        company.focusIndustries?.some((i) =>
          i.toLowerCase().includes(searchLower)
        ) ||
        company.about?.toLowerCase().includes(searchLower) ||
        company.institute?.toLowerCase().includes(searchLower) ||
        String(company.yearOfEstablishment).includes(searchLower)
      );
    });

    setFilteredCompanies(filtered);
  };

  const handleImport = async (dataArray: any[]) => {
    try {
      setLoading(true);
      for (const data of dataArray) {
        const response = await IncubatorService.createIncubatorCompany(data);
        if (!response.success) {
          notification.error({
            message: `Failed to import ${data.companyName}`,
            description: response.message,
          });
        }
      }
      notification.success({
        message: "Import Successful",
        description: `${dataArray.length} companies imported`,
      });
      fetchCompanies();
    } catch (error) {
      notification.error({
        message: "Import Error",
        description: "Failed to import companies",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await IncubatorService.getAdminIncubatorCompanies();
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

  const handleSubmit = async (values: any) => {
    console.log("Form values:", values);
    try {
      if (editingCompany) {
        const response = await IncubatorService.updateIncubatorCompany(
          editingCompany._id,
          {
            ...values,
            pointOfContact: {
              name: values.pointOfContact?.name || "",
              email: values.pointOfContact?.email || "",
              position: values.pointOfContact?.position || "",
            },
            socialLinks: {
              website: values.socialLinks?.website || "",
              linkedin: values.socialLinks?.linkedin || "",
              twitter: values.socialLinks?.twitter || "",
            },
          }
        );

        if (response.success) {
          notification.success({
            message: "Success",
            description: "Company updated successfully",
          });
          setModalVisible(false);
          form.resetFields();
          fetchCompanies();
        } else {
          notification.error({
            message: "Error",
            description: response.message || "Failed to update company",
          });
        }
      } else {
        const response = await IncubatorService.createIncubatorCompany({
          ...values,
          socialLinks: {
            website: values.socialLinks?.website || "",
            linkedin: values.socialLinks?.linkedin || "",
            twitter: values.socialLinks?.twitter || "",
          },
        });

        if (response.success) {
          notification.success({
            message: "Success",
            description: "Company created successfully",
          });
          setModalVisible(false);
          form.resetFields();
          fetchCompanies();
        } else {
          notification.error({
            message: "Error",
            description: response.message || "Failed to create company",
          });
        }
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while saving",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await IncubatorService.deleteIncubatorCompany(id);
      if (response.success) {
        notification.success({
          message: "Success",
          description: "Company deleted successfully",
        });
        fetchCompanies();
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to delete company",
      });
    }
  };

  const columns = [
    {
      title: "Logo",
      dataIndex: "companyLogo",
      key: "companyLogo",
      render: (logo: string) => (
        <img
          src={logo}
          alt="Company logo"
          style={{ width: 50, height: 50, objectFit: "contain" }}
        />
      ),
    },
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "Location",
      dataIndex: "companyLocation",
      key: "companyLocation",
    },
    {
      title: "Year Estd",
      dataIndex: "yearOfEstablishment",
      key: "yearOfEstablishment",
    },
    {
      title: "Sector",
      dataIndex: "sector",
      key: "sector",
      render: (sectors: string[]) => (
        <>
          {sectors.map((sector) => (
            <Tag key={sector} className="mb-1" color="cyan">
              {sector}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Company Type",
      dataIndex: "companyType",
      key: "companyType",
      render: (type: string) => <Tag color="lime">{type}</Tag>,
    },
    {
      title: "Focus Industries",
      dataIndex: "focusIndustries",
      key: "focusIndustries",
      render: (industries: string[]) => (
        <>
          {industries.map((industry) => (
            <Tag key={industry} className="mb-1" color="success">
              {industry}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => <Switch checked={isActive} disabled />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: IncubatorTypes) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCompany(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete Company"
            description="Are you sure you want to delete this company?"
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record._id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ! file download feature
  const handleBulkDelete = async () => {
    try {
      const deletePromises = selectedRowKeys.map((key) =>
        IncubatorService.deleteIncubatorCompany(key.toString())
      );
      await Promise.all(deletePromises);

      notification.success({
        message: "Success",
        description: "Selected companies deleted successfully",
      });
      setSelectedRowKeys([]);
      fetchCompanies();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to delete selected companies",
      });
    }
  };

  // Function to prepare data for export
  const prepareExportData = (selectedOnly: boolean = false) => {
    const dataToExport = selectedOnly
      ? companies.filter((company) => selectedRowKeys.includes(company._id))
      : companies;

    return dataToExport.map((company) => ({
      "Company Logo": company.companyLogo,
      "Company Name": company.companyName,
      Location: company.companyLocation,
      Institute: company.institute,
      Sector: Array.isArray(company.sector)
        ? company.sector.join(", ")
        : company.sector,
      "Company Type": company.companyType,
      "Focus Industries": company.focusIndustries.join(", "),
      About: company.about,
      "Year of Establishment": company.yearOfEstablishment,
      Website: company.socialLinks?.website,
      LinkedIn: company.socialLinks?.linkedin,
      Twitter: company.socialLinks?.twitter,
      "Contact Name": company.pointOfContact?.name,
      "Contact Email": company.pointOfContact?.email,
      "Contact Position": company.pointOfContact?.position,
      "Min Investment": company.funds?.minInvestment,
      "Max Investment": company.funds?.maxInvestment,
      Currency: company.funds?.currency,
      Active: company.isActive ? "Yes" : "No",
    }));
  };

  // Export to CSV
  const exportToCSV = (selectedOnly: boolean = false) => {
    const data = prepareExportData(selectedOnly);
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `incubator_companies${selectedOnly ? "_selected" : ""}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel
  const exportToExcel = (selectedOnly: boolean = false) => {
    const data = prepareExportData(selectedOnly);
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Companies");
    XLSX.writeFile(
      wb,
      `incubator_companies${selectedOnly ? "_selected" : ""}.xlsx`
    );
  };

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  // !import feature

  const ImportSection: React.FC<{ onDataImported: (data: any) => void }> = ({
    onDataImported,
  }) => {
    const { Dragger } = Upload;

    const processFile = async (file: File) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;

        if (file.name.endsWith(".csv")) {
          Papa.parse(content, {
            header: true,
            complete: (results) => {
              // onDataImported(transformImportedData(results.data[0]));
              const transformedData = results.data.map(transformImportedData);
              onDataImported(transformedData);
            },
          });
        } else if (file.name.endsWith(".xlsx")) {
          const workbook = XLSX.read(content, { type: "binary" });
          const firstSheet = workbook.SheetNames[0];
          const data = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
          const transformedData = data.map(transformImportedData);
          onDataImported(transformedData);
        }
      };

      if (file.name.endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    };

    const transformImportedData = (data: any) => {
      return {
        companyLogo: data["Company Logo"],
        companyName: data["Company Name"],
        companyLocation: data["Location"],
        institute: data["Institute"],
        sector: data["Sector"]?.split(",").map((s: string) => s.trim()),
        companyType: data["Company Type"],
        focusIndustries: data["Focus Industries"]
          ?.split(",")
          .map((i: string) => i.trim()),
        about: data["About"],
        yearOfEstablishment: parseInt(data["Year of Establishment"]),
        preferredStartupStage:
          data["Preferred Startup Stage"]
            ?.split(",")
            .map((s: string) => s.trim()) || [], // You'll need to add this to your CSV/Excel template
        socialLinks: {
          website: data["Website"],
          linkedin: data["LinkedIn"],
          twitter: data["Twitter"],
        },
        pointOfContact: {
          name: data["Contact Name"],
          email: data["Contact Email"],
          position: data["Contact Position"],
        },
        funds: {
          minInvestment: parseInt(data["Min Investment"]),
          maxInvestment: parseInt(data["Max Investment"]),
          currency: data["Currency"],
        },
        isActive: data["Active"]?.toLowerCase() === "yes",
      };
    };

    const uploadProps: UploadProps = {
      name: "file",
      multiple: false,
      accept: ".csv,.xlsx",
      showUploadList: false,
      beforeUpload: (file) => {
        processFile(file);
        return false;
      },
    };

    return (
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to import company data
        </p>
        <p className="ant-upload-hint">Support for CSV or Excel files</p>
      </Dragger>
    );
  };

  // Export menu
  const exportMenu = (
    <Menu>
      <Menu.SubMenu key="csv" title="Export as CSV">
        <Menu.Item key="csvAll" onClick={() => exportToCSV(false)}>
          Export All
        </Menu.Item>
        <Menu.Item
          key="csvSelected"
          onClick={() => exportToCSV(true)}
          disabled={selectedRowKeys.length === 0}
        >
          Export Selected
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu key="excel" title="Export as Excel">
        <Menu.Item key="excelAll" onClick={() => exportToExcel(false)}>
          Export All
        </Menu.Item>
        <Menu.Item
          key="excelSelected"
          onClick={() => exportToExcel(true)}
          disabled={selectedRowKeys.length === 0}
        >
          Export Selected
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3} className="mb-6">
        Incubators Management
      </Title>

      <Input
        placeholder="Search companies by name, location, sector, etc..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: "100%", marginBottom: "16px" }}
        allowClear
      />
      {/* // ! To import files */}
      <div style={{ marginBottom: 16 }}>
        <ImportSection onDataImported={handleImport} />
      </div>
      <div className="flex justify-between items-center mb-4">
        <Space>
          {/* // ! to EXPORT files */}
          <Dropdown overlay={exportMenu}>
            <Button icon={<DownloadOutlined />}>
              Export <DownOutlined />
            </Button>
          </Dropdown>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`Delete ${selectedRowKeys.length} selected companies?`}
              description="This action cannot be undone"
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
              onConfirm={handleBulkDelete}
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete Selected
              </Button>
            </Popconfirm>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCompany(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Add New Company
          </Button>
        </Space>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredCompanies}
        loading={loading}
        rowKey="_id"
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={editingCompany ? "Edit Company" : "Add New Company"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1200}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            funds: {
              currency: "USD",
            },
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="companyLogo"
                label="Company Logo"
                rules={[
                  { required: true, message: "Please upload company logo" },
                ]}
              >
                <Input placeholder="Enter logo URL" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="companyName"
                label="Company Name"
                rules={[
                  { required: true, message: "Please enter company name" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="companyLocation"
                label="Company Location"
                rules={[
                  { required: true, message: "Please enter company Location" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="institute"
                label="Institute / Full Address"
                rules={[
                  { required: true, message: "Please enter institute name" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sector"
                label="Sector"
                rules={[
                  { required: true, message: "Please select or enter sectors" },
                ]}
              >
                <Select mode="tags" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="companyType"
                label="Company Type"
                rules={[
                  { required: true, message: "Please select company type" },
                ]}
              >
                <Select>
                  <Option value="VC">Venture Capital</Option>
                  <Option value="Angel">Angel Investor</Option>
                  <Option value="Accelerator">Accelerator</Option>
                  <Option value="Incubator">Incubator</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="focusIndustries"
                label="Focus Industries"
                rules={[
                  { required: true, message: "Please enter focus industries" },
                ]}
              >
                <Select mode="tags" />
              </Form.Item>
            </Col>
          </Row>

          {/* About section - full width */}
          <Form.Item
            name="about"
            label="About"
            rules={[
              { required: true, message: "Please enter company description" },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="yearOfEstablishment"
                label="Year of Establishment"
                rules={[
                  {
                    required: true,
                    message: "Please enter year of establishment",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1900}
                  max={new Date().getFullYear()}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="preferredStartupStage"
                label="Preferred Startup Stage"
                rules={[
                  { required: true, message: "Please select startup stage" },
                ]}
              >
                <Select mode="multiple">
                  <Option value="Idea">Idea</Option>
                  <Option value="MVP">MVP</Option>
                  <Option value="Early Stage">Early Stage</Option>
                  <Option value="Growth">Growth</Option>
                  <Option value="Scale">Scale</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Social Links section */}
          <Title level={5}>Social Links</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={["socialLinks", "website"]}
                label="Website"
                rules={[{ required: true, message: "Website URL is required" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={["socialLinks", "linkedin"]} label="LinkedIn">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={["socialLinks", "twitter"]} label="Twitter">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Point of Contact section */}
          <Title level={5}>Point of Contact</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={["pointOfContact", "name"]}
                label="Contact Name"
                rules={[
                  { required: true, message: "Contact name is required" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["pointOfContact", "email"]}
                label="Contact Email"
                rules={[
                  { required: true, message: "Contact email is required" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["pointOfContact", "position"]}
                label="Contact Position"
                rules={[
                  { required: true, message: "Contact position is required" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Investment Details section */}
          <Title level={5}>Investment Details</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={["funds", "minInvestment"]}
                label="Minimum Investment"
                rules={[
                  {
                    required: true,
                    message: "Please enter minimum investment",
                  },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["funds", "maxInvestment"]}
                label="Maximum Investment"
                rules={[
                  {
                    required: true,
                    message: "Please enter maximum investment",
                  },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["funds", "currency"]}
                label="Currency"
                rules={[{ required: true, message: "Please select currency" }]}
              >
                <Select>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                  <Option value="GBP">GBP</Option>
                  <Option value="INR">INR</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingCompany ? "Update" : "Create"} Company
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IncubatorManagement;
