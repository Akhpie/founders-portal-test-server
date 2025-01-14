// import React, { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Spin, Alert, Button, Card, Typography, Space, Result } from "antd";
// import {
//   CheckCircleFilled,
//   LoadingOutlined,
//   LoginOutlined,
// } from "@ant-design/icons";

// const { Title, Text } = Typography;

// const VerifyEmail: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const token = searchParams.get("token");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     const verifyEmail = async () => {
//       if (!token) {
//         setError("Invalid or missing token.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.get(
//           `http://localhost:5000/api/verify-email?token=${token}`
//         );

//         if (response.data.success) {
//           setSuccess(true);
//         } else {
//           setError("Email verification failed.");
//         }
//       } catch (err) {
//         setError(
//           "An error occurred while verifying the email. Please try again later."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     verifyEmail();
//   }, [token]);

//   const handleLoginRedirect = () => {
//     navigate("/login");
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "#f0f2f5",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "24px",
//       }}
//     >
//       <Card
//         style={{
//           width: "100%",
//           maxWidth: 420,
//           boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
//         }}
//       >
//         <Space direction="vertical" size="large" style={{ width: "100%" }}>
//           {loading ? (
//             <div style={{ textAlign: "center", padding: "32px 0" }}>
//               <Spin
//                 indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />}
//               />
//               <Text
//                 type="secondary"
//                 style={{
//                   display: "block",
//                   marginTop: 16,
//                 }}
//               >
//                 Verifying your email...
//               </Text>
//             </div>
//           ) : error ? (
//             <Space direction="vertical" size="middle" style={{ width: "100%" }}>
//               <Alert
//                 message="Verification Failed"
//                 description={error}
//                 type="error"
//                 showIcon
//               />
//               <Button
//                 icon={<LoginOutlined />}
//                 block
//                 onClick={handleLoginRedirect}
//               >
//                 Return to Login
//               </Button>
//             </Space>
//           ) : success ? (
//             <Result
//               icon={<CheckCircleFilled style={{ color: "#52c41a" }} />}
//               status="success"
//               title="Email Verified Successfully!"
//               subTitle="Your email has been verified. You can now proceed to login."
//               extra={[
//                 <Button
//                   key="login"
//                   type="primary"
//                   icon={<LoginOutlined />}
//                   block
//                   onClick={handleLoginRedirect}
//                 >
//                   Continue to Login
//                 </Button>,
//               ]}
//             />
//           ) : null}
//         </Space>
//       </Card>
//     </div>
//   );
// };

// export default VerifyEmail;

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Spin, Alert, Button, Card, Typography, Space, Result } from "antd";
import {
  CheckCircleFilled,
  LoadingOutlined,
  LoginOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Invalid or missing token.");
        setLoading(false);
        return;
      }

      try {
        // Add logging to help debug the verification process
        console.log("Attempting to verify email with token:", token);

        const response = await axios.get(
          `http://localhost:5000/api/verify-email?token=${token}`,
          {
            validateStatus: function (status) {
              return status < 500; // Resolve only if the status code is less than 500
            },
          }
        );

        console.log("Verification response:", response.data);

        if (response.data.success) {
          setSuccess(true);
          // Automatically redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setError(response.data.message || "Email verification failed.");
        }
      } catch (err: any) {
        console.error("Verification error:", err);

        // More detailed error handling
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "An error occurred while verifying the email. Please try again later.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />}
              />
              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginTop: 16,
                }}
              >
                Verifying your email...
              </Text>
            </div>
          ) : error ? (
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Alert
                message="Verification Failed"
                description={error}
                type="error"
                showIcon
              />
              <Button
                icon={<LoginOutlined />}
                block
                onClick={handleLoginRedirect}
              >
                Return to Login
              </Button>
            </Space>
          ) : success ? (
            <Result
              icon={<CheckCircleFilled style={{ color: "#52c41a" }} />}
              status="success"
              title="Email Verified Successfully!"
              subTitle="Your email has been verified. You will be redirected to the login page in a few seconds..."
              extra={[
                <Button
                  key="login"
                  type="primary"
                  icon={<LoginOutlined />}
                  block
                  onClick={handleLoginRedirect}
                >
                  Continue to Login
                </Button>,
              ]}
            />
          ) : null}
        </Space>
      </Card>
    </div>
  );
};

export default VerifyEmail;
