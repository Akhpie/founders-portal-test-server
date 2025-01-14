// components/FilePreview.tsx
import React from "react";
import { Modal, Table, Image } from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  FileWordOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx"; // Changed this line

interface FilePreviewProps {
  file: File | null;
  visible: boolean;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  visible,
  onClose,
}) => {
  const [previewData, setPreviewData] = React.useState<any>(null);

  React.useEffect(() => {
    if (!file) return;

    const loadPreview = async () => {
      if (file.type.includes("image")) {
        const url = URL.createObjectURL(file);
        setPreviewData({ type: "image", url });
      } else if (
        file.type.includes("sheet") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result;
          if (data) {
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
              header: 1,
            });
            setPreviewData({
              type: "excel",
              data: jsonData.slice(0, 10), // Preview first 10 rows
            });
          }
        };
        reader.readAsArrayBuffer(file);
      }
      // For other file types, just show icon and basic info
      else {
        setPreviewData({
          type: "other",
          name: file.name,
          size: (file.size / 1024).toFixed(2) + " KB",
        });
      }
    };

    loadPreview();

    // Cleanup function to revoke object URL
    return () => {
      if (previewData?.type === "image" && previewData.url) {
        URL.revokeObjectURL(previewData.url);
      }
    };
  }, [file]);

  const renderPreview = () => {
    if (!previewData) return null;

    switch (previewData.type) {
      case "image":
        return (
          <div className="flex justify-center">
            <Image
              src={previewData.url}
              alt="Preview"
              style={{ maxHeight: "400px" }}
              className="rounded-lg"
            />
          </div>
        );

      case "excel":
        const columns =
          previewData.data[0]?.map((header: string, index: number) => ({
            title: header || `Column ${index + 1}`,
            dataIndex: index,
            key: index,
            ellipsis: true,
            width: 150,
          })) || [];

        return (
          <Table
            dataSource={previewData.data
              .slice(1)
              .map((row: any, index: number) => ({
                key: index,
                ...row,
              }))}
            columns={columns}
            size="small"
            scroll={{ x: "max-content" }}
            pagination={false}
          />
        );

      case "other":
        return (
          <div className="flex flex-col items-center p-8 text-center">
            {file?.name.endsWith(".pdf") ? (
              <FilePdfOutlined style={{ fontSize: "64px", color: "#ff4d4f" }} />
            ) : file?.name.match(/\.docx?$/) ? (
              <FileWordOutlined
                style={{ fontSize: "64px", color: "#1890ff" }}
              />
            ) : (
              <FileExcelOutlined
                style={{ fontSize: "64px", color: "#52c41a" }}
              />
            )}
            <h3 className="mt-4 font-medium">{previewData.name}</h3>
            <p className="text-gray-500">{previewData.size}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      title="File Preview"
      bodyStyle={{ maxHeight: "600px", overflow: "auto" }}
    >
      {renderPreview()}
    </Modal>
  );
};

export default FilePreview;
