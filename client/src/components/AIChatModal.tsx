import { useState, useRef, useEffect, useCallback } from "react";
import {
  Modal,
  Input,
  Alert,
  Typography,
  Card,
  Space,
  List,
  Avatar,
  Button,
  AutoComplete,
  notification,
  Tooltip,
  MenuProps,
  Dropdown,
  message,
} from "antd";
import {
  MessageOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CopyOutlined,
  DownloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { exportChatToPDF } from "../utils/exportUtils";
import { exportChatToDoc } from "../utils/docExport";
import { ChatMessage } from "../utils/types";
import FileUploadButton from "./FileUploadButton";
import MeetingScheduler from "./MeetingScheduler";
import "../styles/AIChatModal.css";
import chatIcon from "../assets/images/chat-icon.png";

const { Text } = Typography;
const { Search } = Input;

const defaultSuggestions = [
  "How do I create a pitch deck?",
  "schedule a meet",
  "What are the best startup accelerators?",
  "How to find angel investors?",
  "What is Series A funding?",
  "How to calculate company valuation?",
  "What are the types of venture capital?",
  "How to protect intellectual property?",
  "What is a cap table?",
  "How to create a business model canvas?",
  "What are key startup metrics?",
];

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleMeeting?: (meetingDetails: any) => Promise<void>;
}
interface MeetingDetails {
  title?: string;
  date?: string;
  time?: string;
  duration?: number;
  participants?: string[];
}

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetails | null>(
    null
  );
  const messagesEndRef = useRef(null);

  // Add this function to handle meeting scheduling
  const handleScheduleMeeting = useCallback(
    async (meetingData: MeetingDetails) => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://founders-portal-test-server-apii.onrender.com/api/ai-chat/schedule-meeting",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(meetingData),
          }
        );

        const result = await response.json();

        if (result.success) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              type: "assistant",
              content: `✅ Meeting scheduled successfully!\n\nMeeting Link: ${result.meetingLink}\n\nI've sent the invites to all participants.`,
              timestamp: new Date(),
            },
          ]);
          setShowScheduler(false);
          setMeetingDetails(null);
        } else if (result.authUrl) {
          // Handle Google Calendar authentication
          window.location.href = result.authUrl;
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  //! File feature

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    // Check if we've returned from OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get("auth");

    if (authStatus === "success" && meetingDetails) {
      // Retry scheduling the meeting
      handleScheduleMeeting(meetingDetails);
      // Clean up the URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [meetingDetails, handleScheduleMeeting]);

  const copyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      notification.success({
        message: "Copied to clipboard",
        duration: 2,
      });
    } catch (err) {
      notification.error({
        message: "Failed to copy",
        description: err.message,
      });
    }
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    if (!value) {
      setSuggestions([]);
      return;
    }
    const filtered = defaultSuggestions
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      )
      .map((suggestion) => ({ value: suggestion }));
    setSuggestions(filtered.slice(0, 5));
  };

  const handleFileSelect = async (file: File) => {
    // Instead of immediately analyzing, just set the file and update the query placeholder
    setPendingFile(file);
    const fileType = file.type || "unknown";
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setQuery("");
  };

  // Modify handleSearch to handle both regular queries and file analysis
  const handleSearch = async () => {
    if (!query.trim()) return;

    let userMessageContent = query;
    if (pendingFile) {
      userMessageContent = `File: ${pendingFile.name}\nPrompt: ${query}`;
    }

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: userMessageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError("");
    setQuery("");
    setStreamingMessage("");

    try {
      let response;

      if (pendingFile) {
        console.log("Uploading file:", pendingFile); // Debug log
        console.log("With prompt:", query); // Debug log

        const formData = new FormData();
        formData.append("file", pendingFile);
        formData.append("prompt", query);

        // Log FormData contents
        for (let [key, value] of formData.entries()) {
          console.log(`FormData: ${key} =`, value);
        }

        response = await fetch(
          "https://founders-portal-test-server-apii.onrender.com/api/ai-chat/analyze-file",
          {
            method: "POST",
            body: formData,
          }
        );

        console.log("File upload response status:", response.status); // Debug log
      } else {
        response = await fetch(
          "https://founders-portal-test-server-apii.onrender.com/api/ai-chat/chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: query }),
          }
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText); // Debug log
        throw new Error(
          pendingFile ? "Failed to analyze file" : "Failed to get AI response"
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(5);
            if (data.trim() === "[DONE]") {
              const assistantMessage = {
                id: Date.now().toString(),
                type: "assistant",
                content: accumulatedResponse.trim(),
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, assistantMessage]);
              setStreamingMessage("");
              setPendingFile(null); // Clear pending file after successful analysis
              break;
            }

            try {
              const parsedData = JSON.parse(data);
              if (parsedData.content) {
                accumulatedResponse += parsedData.content;
                setStreamingMessage(accumulatedResponse);
              }
              // Add this to handle meeting scheduling
              if (parsedData.showScheduler) {
                setShowScheduler(true);
                setMeetingDetails(parsedData.meetingDetails);
              }
            } catch (e) {
              if (data.trim() !== "[DONE]") {
                console.error("Error parsing SSE data:", e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const MessageContent = ({ content }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ node, ...props }) => (
          <table
            className="min-w-full border-collapse border border-gray-300 my-4"
            {...props}
          />
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-800" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="px-4 py-2 border text-left font-medium" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-4 py-2 border" {...props} />
        ),
        a: ({ node, ...props }) => (
          <a
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

  const exportItems: MenuProps["items"] = [
    {
      key: "pdf",
      label: "Export as PDF",
      onClick: () => messages.length > 0 && exportChatToPDF(messages),
    },
    {
      key: "doc",
      label: "Export as DOC",
      onClick: () => messages.length > 0 && exportChatToDoc(messages),
    },
  ];

  const modalTitle = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Space>
          <RobotOutlined className="text-blue-500" />
          <span>AI Assistant</span>
        </Space>
      </div>
      <div className="flex items-center">
        {messages.length > 0 && (
          <Dropdown menu={{ items: exportItems }} placement="bottomRight">
            <Button
              icon={<DownloadOutlined />}
              type="text"
              className="hover:bg-gray-100"
            />
          </Dropdown>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={modalTitle}
      footer={null}
      width={800}
      className="ai-chat-modal"
      styles={{
        body: {
          padding: "16px 24px",
          height: "70vh",
          display: "flex",
          flexDirection: "column",
        },
        content: {
          height: "100%",
        },
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
          {messages.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={messages}
              renderItem={(message) => (
                <List.Item className="py-2">
                  <Card
                    className="w-full relative shadow hover:shadow-md transition-shadow duration-200"
                    bodyStyle={{ padding: "16px" }}
                  >
                    {message.type === "assistant" && (
                      <div className="absolute top-3 right-3 z-10">
                        <Tooltip title="Copy message">
                          <Button
                            icon={<CopyOutlined />}
                            onClick={() => copyMessage(message.content)}
                            size="small"
                            type="text"
                            className="hover:bg-gray-100"
                          />
                        </Tooltip>
                      </div>
                    )}
                    <Space align="start" className="w-full">
                      <Avatar
                        icon={
                          message.type === "assistant" ? (
                            <RobotOutlined />
                          ) : (
                            <UserOutlined />
                          )
                        }
                        className={
                          message.type === "assistant"
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }
                      />
                      <div className="flex-1 pr-8">
                        <div className="mb-2">
                          <Text strong>
                            {message.type === "assistant"
                              ? "AI Assistant"
                              : "You"}
                          </Text>
                          <Text type="secondary" className="ml-2 text-xs">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </Text>
                        </div>
                        <div className="markdown-content prose max-w-none">
                          <MessageContent content={message.content} />
                        </div>
                      </div>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Card className="text-center">
              <Space
                direction="vertical"
                size="middle"
                className="w-full items-center"
              >
                <img
                  src={chatIcon}
                  className="w-14 h-14 mx-auto"
                  alt="Chat icon"
                />
                <Text type="secondary">
                  Ask me anything about startups, investors, or fundraising!
                </Text>
              </Space>
            </Card>
          )}

          {streamingMessage && (
            <List.Item className="py-2">
              <Card className="w-full shadow" bodyStyle={{ padding: "16px" }}>
                <Space align="start">
                  <Avatar icon={<RobotOutlined />} className="bg-blue-500" />
                  <div className="flex-1">
                    <div className="mb-2">
                      <Text strong>AI Assistant</Text>
                      <Text type="secondary" className="ml-2 text-xs">
                        {new Date().toLocaleTimeString()}
                      </Text>
                    </div>
                    <div className="markdown-content prose max-w-none">
                      <MessageContent content={streamingMessage} />
                    </div>
                  </div>
                </Space>
              </Card>
            </List.Item>
          )}

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              className="mt-4"
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        {showScheduler && (
          <div className="mb-4">
            <MeetingScheduler
              onSchedule={handleScheduleMeeting}
              isLoading={isLoading}
              initialData={meetingDetails}
            />
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <AutoComplete
            options={suggestions}
            value={query}
            onChange={handleQueryChange}
            className="flex-1"
          >
            <Search
              placeholder={
                pendingFile
                  ? `Enter your prompt for analyzing ${pendingFile.name}...`
                  : "Ask anything about investors or startups..."
              }
              onSearch={handleSearch}
              enterButton={
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={isLoading}
                />
              }
              size="large"
            />
          </AutoComplete>
          <FileUploadButton onFileSelect={handleFileSelect} />
        </div>
      </div>
    </Modal>
  );
};

export default AIChatModal;
