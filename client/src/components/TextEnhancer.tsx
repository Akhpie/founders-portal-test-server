import React, { useState } from "react";
import { Button, Input, message } from "antd";
import { SparklesIcon } from "lucide-react";
import axios from "axios";

interface AITextEnhancerProps {
  value?: string;
  onChange?: (value: string) => void;
}

const AITextEnhancer: React.FC<AITextEnhancerProps> = ({
  value = "",
  onChange,
}) => {
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);

  const handleEnhance = async () => {
    if (!value.trim()) {
      message.warning("Please enter some text to enhance");
      return;
    }

    setIsEnhancing(true);

    try {
      const response = await axios.post<{ enhancedText: string }>(
        `https://founders-portal-test-server-apii.onrender.com/api/ai/enhance-text`,
        { text: value }
      );

      // Update the text area with enhanced text
      onChange?.(response.data.enhancedText);

      // Show success message
      message.success("Text enhanced successfully!");
    } catch (error) {
      // Handle different types of errors
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

  return (
    <div className="relative">
      <Input.TextArea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Company Description"
        rows={4}
      />
      <Button
        type="default"
        icon={<SparklesIcon size={16} />}
        onClick={handleEnhance}
        loading={isEnhancing}
        className="absolute top-2 right-2"
      ></Button>
    </div>
  );
};

export default AITextEnhancer;
