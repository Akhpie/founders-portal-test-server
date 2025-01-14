// import React, { useEffect, useState } from "react";
// import {
//   Layout,
//   Card,
//   Button,
//   Typography,
//   Row,
//   Col,
//   Menu,
//   Statistic,
//   Avatar,
// } from "antd";
// import { useNavigate } from "react-router-dom";
// import { ConfigProvider, theme } from "antd";
// import {
//   ArrowRightOutlined,
//   RocketOutlined,
//   DollarOutlined,
//   TeamOutlined,
//   LinkedinFilled,
//   TwitterOutlined,
// } from "@ant-design/icons";
// import "../styles/Homepage.css";
// import { CheckCircleIcon } from "lucide-react";
// import Navbar from "../components/Navbar";
// import { useAuthStore } from "../store/authStore";

// const { Header, Content } = Layout;
// const { Title, Paragraph, Text } = Typography;

// // CSS for background grain effect
// const grainStyle = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   height: "100vh",
//   width: "100vw",
//   opacity: 0.05,
//   backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
//   pointerEvents: "none",
//   zIndex: 1,
// };

// const GlassCard = ({ children, className = "", hoverable = true }) => (
//   <div
//     className={`relative overflow-hidden rounded-xl ${
//       hoverable ? "group" : ""
//     } ${className}`}
//     style={{ willChange: "transform" }}
//   >
//     {/* Base layer with initial backdrop blur */}
//     <div
//       className={`absolute inset-0 backdrop-blur-sm bg-white/10 border border-white/20 transition-opacity duration-300 ease-out ${
//         hoverable ? "group-hover:bg-white/20" : ""
//       }`}
//     />

//     {/* Gradient overlay without transform */}
//     <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50 pointer-events-none" />

//     {/* Content wrapper with scaling on hover */}
//     <div
//       className={`relative z-20 transition-transform duration-300 ease-out ${
//         hoverable ? "group-hover:scale-[1.02]" : ""
//       }`}
//       style={{ willChange: "transform" }}
//     >
//       {children}
//     </div>
//   </div>
// );

// const HomePage = () => {
//   const navigate = useNavigate();
//   // const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   const token = useAuthStore((state) => state.token);
//   const { isAuthenticated, setAuthenticated, setToken } = useAuthStore();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       setToken(token);
//       setAuthenticated(true);
//     }
//   }, [setAuthenticated, setToken]);

//   const handlePortalAccess = () => {
//     console.log("Auth status:", isAuthenticated); // Debug log
//     console.log("Token:", localStorage.getItem("token")); // Debug log

//     if (isAuthenticated) {
//       navigate("/portal");
//     } else {
//       navigate("/login");
//     }
//   };

//   return (
//     <ConfigProvider
//       theme={{
//         algorithm: theme.defaultAlgorithm,
//         token: {
//           colorPrimary: "#2563eb",
//           borderRadius: 6,
//         },
//       }}
//     >
//       <Layout className="min-h-screen relative">
//         {/* Gradient Background */}
//         <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />

//         {/* Grain Effect */}
//         <div style={grainStyle} />

//         <Navbar />

//         <Content className="pt-16 relative z-10">
//           <div className="max-w-7xl mx-auto px-4 py-20">
//             <Row gutter={[48, 48]} align="middle">
//               <Col xs={24} md={12}>
//                 <div className="space-y-8">
//                   <div className="inline-flex items-center rounded-full bg-blue-500/10 backdrop-blur-sm px-3 py-1">
//                     <span className="relative flex h-2 w-2 mr-2">
//                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
//                       <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
//                     </span>
//                     <Text className="text-blue-600">
//                       500+ Investor Profiles
//                     </Text>
//                   </div>

//                   <Title level={1} className="text-5xl font-bold !mb-6">
//                     Access Our Curated Network of
//                     <span
//                       className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600"
//                       style={{
//                         WebkitBackgroundClip: "text",
//                         WebkitTextFillColor: "transparent",
//                       }}
//                     >
//                       Pre-Seed & Seed Investors
//                     </span>
//                   </Title>

//                   <Paragraph className="text-lg text-gray-600">
//                     Gain exclusive access to our comprehensive database of
//                     verified investors, incubators, and accelerator programs.
//                     Find their contact details, social profiles, investment
//                     criteria, and portfolio companies all in one place.
//                   </Paragraph>

//                   <div className="flex flex-wrap gap-4">
//                     <Button
//                       type="primary"
//                       size="large"
//                       // onClick={() => navigate("/login")}
//                       onClick={handlePortalAccess}
//                       className="flex items-center bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:opacity-90"
//                     >
//                       Access Portal <ArrowRightOutlined className="ml-2" />
//                     </Button>
//                     <Button
//                       size="large"
//                       className="backdrop-blur-sm bg-white/50 hover:bg-white/70"
//                     >
//                       View Sample Profile
//                     </Button>
//                   </div>

//                   <Row gutter={[16, 16]}>
//                     <Col span={12}>
//                       <GlassCard>
//                         <div className="p-6">
//                           <Statistic
//                             title="Verified Investors"
//                             value={500}
//                             suffix="+"
//                             valueStyle={{ color: "#4F46E5" }}
//                           />
//                         </div>
//                       </GlassCard>
//                     </Col>
//                     <Col span={12}>
//                       <GlassCard>
//                         <div className="p-6">
//                           <Statistic
//                             title="Investment Range"
//                             value="50K-2M"
//                             prefix="$"
//                             valueStyle={{ color: "#4F46E5" }}
//                           />
//                         </div>
//                       </GlassCard>
//                     </Col>
//                   </Row>
//                 </div>
//               </Col>

//               <Col xs={24} md={12}>
//                 <GlassCard className="p-8">
//                   <div className="space-y-6">
//                     <Title level={4}>Featured Investor Profile</Title>

//                     <div className="flex items-center gap-4">
//                       <Avatar
//                         size={64}
//                         className="bg-gradient-to-r from-blue-500 to-purple-500"
//                       >
//                         JD
//                       </Avatar>
//                       <div>
//                         <Text strong className="text-lg block">
//                           John Doe
//                         </Text>
//                         <Text type="secondary">Partner @ Accel Ventures</Text>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <div className="flex items-center gap-2">
//                         <DollarOutlined className="text-blue-500" />
//                         <Text>Investment Range: $100K - $500K</Text>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <RocketOutlined className="text-blue-500" />
//                         <Text>Focus: SaaS, AI/ML, FinTech</Text>
//                       </div>
//                       <div className="flex gap-2">
//                         <Button
//                           icon={<LinkedinFilled />}
//                           className="flex items-center"
//                         >
//                           LinkedIn
//                         </Button>
//                         <Button
//                           icon={<TwitterOutlined />}
//                           className="flex items-center"
//                         >
//                           Twitter
//                         </Button>
//                       </div>
//                     </div>

//                     <div className="border-t border-white/20 pt-4 mt-6">
//                       <Title level={5}>Recent Investments</Title>
//                       <div className="space-y-2 mt-4">
//                         <GlassCard className="p-3" hoverable={false}>
//                           <Text>TechCo - Series A Lead</Text>
//                         </GlassCard>
//                         <GlassCard className="p-3" hoverable={false}>
//                           <Text>DataAI - Seed Round</Text>
//                         </GlassCard>
//                       </div>
//                     </div>
//                   </div>
//                 </GlassCard>
//               </Col>
//             </Row>

//             {/* Features Section */}
//             <Row gutter={[32, 32]} className="mt-24">
//               <Col xs={24}>
//                 <Title level={2} className="text-center !mb-16">
//                   What You'll Get Access To
//                 </Title>
//               </Col>
//               <Col xs={24} md={8}>
//                 <GlassCard className="p-6 h-full">
//                   <RocketOutlined className="text-4xl text-blue-500 mb-4" />
//                   <Title level={4}>Verified Investor Profiles</Title>
//                   <Text>
//                     Detailed profiles with investment criteria, portfolio
//                     companies, and verified contact information.
//                   </Text>
//                 </GlassCard>
//               </Col>
//               <Col xs={24} md={8}>
//                 <GlassCard className="p-6 h-full">
//                   <DollarOutlined className="text-4xl text-blue-500 mb-4" />
//                   <Title level={4}>Investment Criteria</Title>
//                   <Text>
//                     Clear information about investment ranges, preferred
//                     industries, and stage requirements.
//                   </Text>
//                 </GlassCard>
//               </Col>
//               <Col xs={24} md={8}>
//                 <GlassCard className="p-6 h-full">
//                   <TeamOutlined className="text-4xl text-blue-500 mb-4" />
//                   <Title level={4}>Direct Contact Info</Title>
//                   <Text>
//                     Access social profiles, email addresses, and preferred
//                     contact methods for reaching out.
//                   </Text>
//                 </GlassCard>
//               </Col>
//             </Row>

//             <Row className="mt-24">
//               <Col xs={24}>
//                 <GlassCard className="p-12 text-center">
//                   <div className="inline-flex items-center rounded-full bg-blue-500/10 backdrop-blur-sm px-4 py-2 mb-6">
//                     <span className="relative flex h-2 w-2 mr-2">
//                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
//                       <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
//                     </span>
//                     <Text className="text-blue-600">
//                       Flexible Plans Available
//                     </Text>
//                   </div>

//                   <Title level={2} className="!mb-6">
//                     Ready to Scale Your Fundraising?
//                   </Title>

//                   <Paragraph className="text-lg mb-8 max-w-2xl mx-auto">
//                     Choose from our range of plans designed for founders at
//                     every stage. Whether you're just starting out or ready to
//                     accelerate your fundraising, we have the perfect plan for
//                     you.
//                   </Paragraph>

//                   <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//                     <Button
//                       type="primary"
//                       size="large"
//                       onClick={() => navigate("/subscription-plans")}
//                       className="bg-gradient-to-r from-blue-500 to-purple-500 border-0
//             inline-flex items-center justify-center
//             transition-colors duration-300
//             hover:opacity-90"
//                     >
//                       <span className="block transform-gpu">
//                         View Pricing Plans{" "}
//                         <ArrowRightOutlined className="ml-2" />
//                       </span>
//                     </Button>

//                     <Button
//                       size="large"
//                       onClick={() => navigate("/subscription-plans#compare")}
//                       className="backdrop-blur-sm bg-white/50 hover:bg-white/70
//             inline-flex items-center justify-center"
//                     >
//                       Compare Plans
//                     </Button>
//                   </div>

//                   <div className="mt-8 flex items-center justify-center gap-8 text-gray-600">
//                     <div className="flex items-center gap-2">
//                       <CheckCircleIcon className="w-5 h-5 text-blue-500" />
//                       <span>No credit card required</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <CheckCircleIcon className="w-5 h-5 text-blue-500" />
//                       <span>Cancel anytime</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <CheckCircleIcon className="w-5 h-5 text-blue-500" />
//                       <span>14-day money back</span>
//                     </div>
//                   </div>
//                 </GlassCard>
//               </Col>
//             </Row>

//             {/* Call to Action */}
//             <Row className="mt-24">
//               <Col xs={24}>
//                 <GlassCard className="p-12 text-center">
//                   <Title level={2} className="!mb-6">
//                     Ready to Connect with Investors?
//                   </Title>
//                   <Paragraph className="text-lg mb-8">
//                     Get instant access to our database of pre-vetted investors
//                     and start reaching out today.
//                   </Paragraph>
//                   <Button
//                     type="primary"
//                     size="large"
//                     onClick={handlePortalAccess}
//                     className="bg-gradient-to-r from-blue-500 to-purple-500 border-0
//                 inline-flex items-center justify-center
//                 transition-colors duration-300
//                 hover:opacity-90"
//                   >
//                     <span className="block transform-gpu">
//                       Access Portal Now
//                     </span>
//                   </Button>
//                 </GlassCard>
//               </Col>
//             </Row>
//           </div>
//         </Content>
//       </Layout>
//     </ConfigProvider>
//   );
// };

// export default HomePage;

import React, { useEffect } from "react";
import { Layout, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/Navbar";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const GlassCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden rounded-xl ${className}`}>
    <div className="absolute inset-0 backdrop-blur-sm bg-white/10 border border-white/20" />
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
    <div className="relative z-20">{children}</div>
  </div>
);

const PulseEffect = () => (
  <div className="pulse-container">
    <div className="pulse-ring pulse-ring-1"></div>
    <div className="pulse-ring pulse-ring-2"></div>
    <div className="pulse-ring pulse-ring-3"></div>
    <div className="pulse-core"></div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setAuthenticated, setToken } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
      setAuthenticated(true);
    }
  }, [setAuthenticated, setToken]);

  const handlePortalAccess = () => {
    if (isAuthenticated) {
      navigate("/portal");
    } else {
      navigate("/login");
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <Layout className="min-h-screen relative">
        {/* Animated Background */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100 via-white to-white" />{" "}
          <div
            className="absolute inset-0"
            style={{
              background:
                "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
              opacity: 0.2,
            }}
          />
        </div>

        <Navbar />

        <Content className="relative z-10">
          <div className="max-w-4xl mx-auto px-4 py-32 text-center">
            <GlassCard className="p-12">
              {/* Replace the old pulse effect with the new component */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <PulseEffect />
              </div>

              <div className="relative z-20 space-y-8">
                <div className="inline-flex items-center rounded-full bg-blue-500/10 backdrop-blur-sm px-4 py-2 mb-6">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                  </span>
                  <span className="text-blue-400">Launching Soon</span>
                </div>

                <Title
                  level={1}
                  className="text-5xl font-bold !mb-6 text-white"
                >
                  The Future of
                  <span className="block mt-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Startup Fundraising
                  </span>
                </Title>

                <Paragraph className="text-lg text-gray-700 max-w-2xl mx-auto">
                  We're building the most comprehensive network of pre-seed &
                  seed investors. Get early access to our platform and be the
                  first to connect with verified investors.
                </Paragraph>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                  <Button
                    type="primary"
                    size="large"
                    onClick={handlePortalAccess}
                    className="min-w-[200px] h-12 bg-gradient-to-r from-blue-500 to-purple-500 border-0
                    hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <span>Access Portal</span>
                    <ArrowRightOutlined />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                  <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
                    <p className="text-blue-400 font-medium">500+</p>
                    <p className="text-gray-400">Verified Investors</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
                    <p className="text-blue-400 font-medium">$50K-2M</p>
                    <p className="text-gray-400">Investment Range</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm">
                    <p className="text-blue-400 font-medium">14 Days</p>
                    <p className="text-gray-400">Money Back Guarantee</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default HomePage;
