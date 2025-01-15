// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, Form, Input, Button, message } from "antd";
// import { UserOutlined, LockOutlined } from "@ant-design/icons";
// import type { FormInstance } from "antd/lib/form";

// interface LoginFormData {
//   email: string;
//   password: string;
// }

// const AdminLogin: React.FC = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [form] = Form.useForm();

//   const onFinish = async (values: LoginFormData) => {
//     setLoading(true);
//     try {
//       // Here you would typically make an API call to authenticate
//       // For demo purposes, we'll just navigate after a brief delay
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       message.success("Login successful!");
//       navigate("/adminPortal/dashboard");
//     } catch (error) {
//       message.error("Login failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "#f0f2f5",
//         padding: "24px",
//       }}
//     >
//       <Card
//         style={{
//           width: "100%",
//           maxWidth: "400px",
//           boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//         }}
//         title={
//           <div
//             style={{
//               textAlign: "center",
//               fontSize: "24px",
//               fontWeight: "bold",
//             }}
//           >
//             Admin Login
//           </div>
//         }
//       >
//         <Form
//           form={form}
//           name="admin_login"
//           onFinish={onFinish}
//           layout="vertical"
//           requiredMark={false}
//           style={{ marginTop: "16px" }}
//         >
//           <Form.Item
//             name="email"
//             rules={[
//               { required: true, message: "Please input your email!" },
//               { type: "email", message: "Please enter a valid email!" },
//             ]}
//           >
//             <Input
//               prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
//               placeholder="Email"
//               size="large"
//             />
//           </Form.Item>

//           <Form.Item
//             name="password"
//             rules={[{ required: true, message: "Please input your password!" }]}
//           >
//             <Input.Password
//               prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
//               placeholder="Password"
//               size="large"
//             />
//           </Form.Item>

//           <Form.Item style={{ marginBottom: "0" }}>
//             <Button
//               type="primary"
//               htmlType="submit"
//               size="large"
//               loading={loading}
//               style={{ width: "100%" }}
//             >
//               Log in
//             </Button>
//           </Form.Item>
//         </Form>
//       </Card>
//     </div>
//   );
// };

// export default AdminLogin;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, message } from "antd";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_ADMIN_PRODUCTION_GOOGLE_CLIENT_ID;

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://founders-portal-test-server-apii.onrender.com/api/auth/google-login",
        {
          // Update with your actual backend URL
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
          credentials: "include",
          mode: "cors",
        }
      );

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();
      if (data.isAdmin) {
        message.success("Login successful!");
        navigate("/adminPortal/dashboard");
      } else {
        message.error("You do not have admin access");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f2f5",
        }}
      >
        <Card style={{ width: 400 }}>
          <h1 style={{ textAlign: "center", marginBottom: 24 }}>Admin Login</h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.error("Login Failed");
                message.error("Login Failed");
              }}
              useOneTap
              theme="outline"
              size="large"
              text="continue_with"
            />
          </div>
        </Card>
      </div>
    </GoogleOAuthProvider>
  );
};

export default AdminLogin;
