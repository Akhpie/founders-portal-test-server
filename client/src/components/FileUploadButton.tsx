// // components/FileUploadButton.tsx
// import React, { useState } from "react";
// import {
//   UploadOutlined,
//   FileImageOutlined,
//   FilePdfOutlined,
//   FileTextOutlined,
//   FileExcelOutlined,
// } from "@ant-design/icons";
// import { Button, Upload, message, Tooltip } from "antd";
// import type { UploadFile, UploadProps } from "antd/es/upload/interface";

// interface FileUploadButtonProps {
//   onFileSelect: (file: File) => void;
// }

// const FileUploadButton: React.FC<FileUploadButtonProps> = ({
//   onFileSelect,
// }) => {
//   const [fileList, setFileList] = useState<UploadFile[]>([]);

//   const props: UploadProps = {
//     beforeUpload: (file) => {
//       const isAllowed = /\.(jpg|jpeg|png|pdf|txt|csv|doc|docx|xlsx|xls)$/i.test(
//         file.name
//       );
//       if (!isAllowed) {
//         message.error(
//           "You can only upload JPG/PNG/PDF/TXT/CSV/DOC/XLSX files!"
//         );
//         return false;
//       }
//       const isLt10M = file.size / 1024 / 1024 < 10;
//       if (!isLt10M) {
//         message.error("File must be smaller than 10MB!");
//         return false;
//       }
//       onFileSelect(file);
//       return false; // Prevent default upload behavior
//     },
//     maxCount: 1,
//     fileList,
//     onChange: ({ fileList: newFileList }) => {
//       setFileList(newFileList);
//     },
//     showUploadList: false,
//   };

//   const getFileIcon = (fileName: string) => {
//     if (/\.(jpg|jpeg|png)$/i.test(fileName)) return <FileImageOutlined />;
//     if (/\.pdf$/i.test(fileName)) return <FilePdfOutlined />;
//     if (/\.(xlsx|xls)$/i.test(fileName)) return <FileExcelOutlined />;
//     return <FileTextOutlined />;
//   };

//   return (
//     <div className="flex items-center gap-2">
//       <Upload {...props}>
//         <Tooltip title="Upload file (Max: 10MB)">
//           <Button
//             icon={<UploadOutlined />}
//             type="text"
//             className="hover:bg-gray-100"
//           >
//             {fileList.length > 0 && (
//               <span className="ml-2 flex items-center gap-1">
//                 {getFileIcon(fileList[0].name)}
//                 {fileList[0].name}
//               </span>
//             )}
//           </Button>
//         </Tooltip>
//       </Upload>
//       {fileList.length > 0 && (
//         <Button
//           type="text"
//           danger
//           onClick={() => setFileList([])}
//           className="hover:bg-red-50"
//         >
//           Remove
//         </Button>
//       )}
//     </div>
//   );
// };

// export default FileUploadButton;

// components/FileUploadButton.tsx
import React, { useState, useEffect } from "react";
import {
  UploadOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  ScissorOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Upload, message, Tooltip, Space } from "antd";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import FilePreview from "./FilePreview";
import { Trash2 } from "lucide-react";

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileSelect,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isPasting, setIsPasting] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;

      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            // Create a new file with a proper name
            const timestamp = new Date().getTime();
            const newFile = new File(
              [file],
              `clipboard-image-${timestamp}.png`,
              {
                type: "image/png",
              }
            );

            // Check file size
            const isLt10M = newFile.size / 1024 / 1024 < 10;
            if (!isLt10M) {
              message.error("Image must be smaller than 10MB!");
              return;
            }

            setIsPasting(true);
            try {
              await onFileSelect(newFile);
              setFileList([
                {
                  uid: "-1",
                  name: newFile.name,
                  status: "done",
                  url: URL.createObjectURL(newFile),
                },
              ]);
              message.success("Image pasted successfully!");
            } catch (error) {
              message.error("Failed to process pasted image");
            } finally {
              setIsPasting(false);
            }
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [onFileSelect]);

  const props: UploadProps = {
    beforeUpload: (file) => {
      const isAllowed = /\.(jpg|jpeg|png|pdf|txt|csv|doc|docx|xlsx|xls)$/i.test(
        file.name
      );
      if (!isAllowed) {
        message.error(
          "You can only upload JPG/PNG/PDF/TXT/CSV/DOC/XLSX files!"
        );
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("File must be smaller than 10MB!");
        return false;
      }
      setSelectedFile(file);
      onFileSelect(file);
      return false;
    },
    maxCount: 1,
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    showUploadList: false,
  };

  const getFileIcon = (fileName: string) => {
    if (/\.(jpg|jpeg|png)$/i.test(fileName)) return <FileImageOutlined />;
    if (/\.pdf$/i.test(fileName)) return <FilePdfOutlined />;
    if (/\.(xlsx|xls)$/i.test(fileName)) return <FileExcelOutlined />;
    return <FileTextOutlined />;
  };

  const handlePreviewClick = () => {
    setPreviewVisible(true);
  };

  return (
    <div className="flex items-center gap-2">
      <Space>
        <Upload {...props}>
          <Tooltip title="Upload file (Max: 10MB)">
            <Button
              icon={<UploadOutlined />}
              type="text"
              className="hover:bg-gray-100"
            >
              {fileList.length > 0 && (
                <span className="ml-2 flex items-center gap-1">
                  {getFileIcon(fileList[0].name)}
                  {fileList[0].name}
                </span>
              )}
            </Button>
          </Tooltip>
        </Upload>

        {fileList.length > 0 && (
          <Tooltip title="Preview file">
            <Button
              icon={<EyeOutlined />}
              type="text"
              onClick={handlePreviewClick}
              className="hover:bg-gray-100"
            />
          </Tooltip>
        )}
      </Space>

      {fileList.length > 0 && (
        <Button
          type="text"
          danger
          onClick={() => {
            setFileList([]);
            setSelectedFile(null);
          }}
          className="hover:bg-red-50"
          icon={<Trash2 size={16} />}
        ></Button>
      )}

      <FilePreview
        file={selectedFile}
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
      />
    </div>
  );
};

export default FileUploadButton;
