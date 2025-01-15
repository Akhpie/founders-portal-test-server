// src/utils/authFunctions.ts
import axios from "axios";
import { message } from "antd";

export const handleForgotPassword = async (values: { email: string }) => {
  try {
    const response = await axios.post(
      "https://founders-portal-test-server-apii.onrender.com/api/request-password-reset",
      { email: values.email }
    );

    if (response.data.success) {
      message.success("Password reset link has been sent to your email.");
    } else {
      message.error(response.data.message || "Failed to send reset link.");
    }
  } catch (error) {
    console.error("Error sending password reset link:", error);
    message.error("An error occurred. Please try again.");
  }
};
