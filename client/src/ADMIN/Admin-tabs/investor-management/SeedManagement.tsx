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
  MinusCircleOutlined,
} from "@ant-design/icons";
import { Typography } from "antd";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { SeedTypes } from "../../../types/seed";
import SeedService from "../../../services/seedService";

const { Option } = Select;
const { Title } = Typography;
const { TextArea } = Input;

const SeedManagement: React.FC = () => {
  const [companies, setCompanies] = useState<SeedTypes[]>([]);

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState<SeedTypes | null>(null);
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<SeedTypes[]>([]);
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

    const filtered = companies.filter((seed) => {
      return (
        seed.seedName?.toLowerCase().includes(searchLower) ||
        seed.seedLocation?.toLowerCase().includes(searchLower) ||
        seed.sector?.some((s) => s.toLowerCase().includes(searchLower)) ||
        seed.seedType?.toLowerCase().includes(searchLower) ||
        seed.focusIndustries?.some((i) =>
          i.toLowerCase().includes(searchLower)
        ) ||
        seed.about?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredCompanies(filtered);
  };

  const handleImport = async (dataArray: any[]) => {
    try {
      setLoading(true);
      for (const data of dataArray) {
        const response = await SeedService.createSeedInvestors(data);
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
      const response = await SeedService.getAdminSeedInvestors();
      if (response.success) {
        setCompanies(response.data || []);
        console.log("Fetched data:", response.data);
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
      const payload = {
        seedLogo: values.seedLogo,
        seedName: values.seedName,
        seedLocation: values.seedLocation,
        seedType: values.seedType,
        noOfInvestedCompanies: values.noOfInvestedCompanies,
        sector: values.sector,
        focusIndustries: values.focusIndustries,
        about: values.about,
        preferredStartupStage: values.preferredStartupStage,
        isActive: values.isActive,
        investedCompanies: values.investedCompanies || [],
        socialLinks: {
          website: values.socialLinks?.website || "",
          linkedin: values.socialLinks?.linkedin || "",
          twitter: values.socialLinks?.twitter || "",
        },
      };

      if (editingCompany) {
        const response = await SeedService.updateSeedInvestors(
          editingCompany._id,
          payload
        );

        if (response.success) {
          notification.success({
            message: "Success",
            description: "Seed investor updated successfully",
          });
          setModalVisible(false);
          form.resetFields();
          fetchCompanies();
        } else {
          notification.error({
            message: "Error",
            description: response.message || "Failed to update Seed investor",
          });
        }
      } else {
        const response = await SeedService.createSeedInvestors(payload);

        if (response.success) {
          notification.success({
            message: "Success",
            description: "Seed investor created successfully",
          });
          setModalVisible(false);
          form.resetFields();
          fetchCompanies();
        } else {
          notification.error({
            message: "Error",
            description: response.message || "Failed to create Seed investor",
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
      const response = await SeedService.deleteSeedInvestors(id);
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
      dataIndex: "seedLogo",
      key: "seedLogo",
      render: (logo: string) => (
        <img
          src={logo}
          alt="seed logo"
          style={{ width: 50, height: 50, objectFit: "contain" }}
        />
      ),
    },
    {
      title: "seed Name",
      dataIndex: "seedName",
      key: "seedName",
    },
    {
      title: "Location",
      dataIndex: "seedLocation",
      key: "seedLocation",
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
      title: "Type",
      dataIndex: "seedType",
      key: "seedType",
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
      render: (_: any, record: SeedTypes) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCompany(record);
              form.setFieldsValue({
                ...record,
                investedCompanies: record.investedCompanies || [], // Add this line
              });
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete Seed Investor?"
            description="Are you sure you want to delete this investor?"
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
        SeedService.deleteSeedInvestors(key.toString())
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
      ? companies.filter((seed) => selectedRowKeys.includes(seed._id))
      : companies;

    return dataToExport.map((seed) => ({
      "Seed Logo": seed.seedLogo,
      "Seed Name": seed.seedName,
      Location: seed.seedLocation,
      Sector: Array.isArray(seed.sector) ? seed.sector.join(", ") : seed.sector,
      "Seed Type": seed.seedType,
      "Focus Industries": seed.focusIndustries.join(", "),
      NoOfInvestedCompanies: seed.noOfInvestedCompanies,
      About: seed.about,
      Website: seed.socialLinks?.website,
      LinkedIn: seed.socialLinks?.linkedin,
      Twitter: seed.socialLinks?.twitter,
      Active: seed.isActive ? "Yes" : "No",
      "Invested Companies": seed.investedCompanies
        ? seed.investedCompanies.map((c) => c.companyName).join(", ")
        : "",
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
      `seed_investors${selectedOnly ? "_selected" : ""}.csv`
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
    XLSX.utils.book_append_sheet(wb, ws, "Seed Investors");
    XLSX.writeFile(wb, `seed_investors${selectedOnly ? "_selected" : ""}.xlsx`);
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
        seedLogo: data["Seed Logo"],
        seedName: data["Seed Name"],
        seedLocation: data["Location"],
        sector: data["Sector"]?.split(",").map((s: string) => s.trim()),
        seedType: data["Seed Type"],
        focusIndustries: data["Focus Industries"]
          ?.split(",")
          .map((i: string) => i.trim()),
        about: data["About"],
        noOfInvestedCompanies: parseInt(data["NoOfInvestedCompanies"]),
        preferredStartupStage:
          data["Preferred Startup Stage"]
            ?.split(",")
            .map((s: string) => s.trim()) || [],
        socialLinks: {
          website: data["Website"],
          linkedin: data["LinkedIn"],
          twitter: data["Twitter"],
        },
        isActive: data["Active"]?.toLowerCase() === "yes",
        investedCompanies: data["Invested Companies"]
          ? data["Invested Companies"].split(",").map((company: string) => ({
              companyName: company.trim(),
              companyLogo: "", // You might want to handle this differently
              investmentYear: new Date().getFullYear(), // Default value
              companyWebsite: "", // Optional
            }))
          : [],
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
        Seed Management
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
            Add New seed investor
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
        title={editingCompany ? "Edit Investor" : "Add New Investor"}
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
                name="seedLogo"
                label="Seed Logo"
                rules={[{ required: true, message: "Please upload Seed logo" }]}
              >
                <Input placeholder="Enter logo URL" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="seedName"
                label="Seed Name"
                rules={[{ required: true, message: "Please enter Seed name" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="seedLocation"
                label="Seed Location"
                rules={[{ required: true, message: "Please enter Seed name" }]}
              >
                <Input />
              </Form.Item>
            </Col>
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
                name="seedType"
                label="Type"
                rules={[
                  { required: true, message: "Please select company type" },
                ]}
              >
                <Select>
                  <Option value="Seed">Seed Investor</Option>
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
              { required: true, message: "Please enter seed description" },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item
                name="noOfInvestedCompanies"
                label="No. of Investments"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter number of investments made by company",
                  },
                ]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Invested Companies">
            <Form.List name="investedCompanies">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "companyName"]}
                        rules={[
                          { required: true, message: "Company name required" },
                        ]}
                      >
                        <Input placeholder="Company Name" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "companyLogo"]}
                        rules={[
                          { required: true, message: "Logo URL required" },
                        ]}
                      >
                        <Input placeholder="Company Logo URL" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "investmentYear"]}
                        rules={[
                          {
                            required: true,
                            message: "Investment year required",
                          },
                        ]}
                      >
                        <InputNumber
                          placeholder="Investment Year"
                          min={1900}
                          max={2025}
                        />
                      </Form.Item>

                      <Form.Item {...restField} name={[name, "companyWebsite"]}>
                        <Input placeholder="Company Website" />
                      </Form.Item>

                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Invested Company
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingCompany ? "Update" : "Create"} Investor
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SeedManagement;
