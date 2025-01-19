// import React, { useState } from "react";
// import { Button, Menu } from "antd";
// import { Navigate, useNavigate } from "react-router-dom";
// import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
// import { LogIn, Sparkles } from "lucide-react";

// interface NavbarProps {
//   className?: string;
// }

// const Navbar: React.FC<NavbarProps> = ({ className = "" }) => {
//   const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
//   const navigate = useNavigate();

//   return (
//     <header
//       className={`fixed w-full bg-white/10 backdrop-blur-md shadow-sm z-50 px-4 h-16 flex items-center ${className}`}
//     >
//       <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
//         <div
//           className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 cursor-pointer"
//           style={{
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//           }}
//           onClick={() => navigate("/")}
//         >
//           FoundersWay
//         </div>

//         <div className="hidden md:flex items-center gap-4">
//           <Button
//             icon={<LogIn className="w-4 h-4" />}
//             onClick={() => navigate("/login")}
//             className="flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-blue-600 to-cyan-500
//               text-white border-0 hover:opacity-90 transition-all duration-300 rounded-lg"
//           >
//             Sign In
//           </Button>
//           <Button
//             type="primary"
//             onClick={() => navigate("/subscription-plans")}
//             className="flex items-center bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:opacity-90"
//           >
//             Plans <Sparkles className="w-4 h-4" />
//           </Button>
//         </div>

//         <Button
//           icon={mobileMenuVisible ? <CloseOutlined /> : <MenuOutlined />}
//           className="md:hidden"
//           onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
//         />
//       </div>

//       {mobileMenuVisible && (
//         <div className="absolute top-16 left-0 w-full bg-white shadow-lg md:hidden">
//           <Menu mode="inline" className="px-4 py-2">
//             <Menu.Item key="founders">For Founders</Menu.Item>
//             <Menu.Item key="investors">Investor Network</Menu.Item>
//             <Menu.Item key="incubators">Incubators</Menu.Item>
//             <Menu.Item key="resources">Resources</Menu.Item>
//             <Menu.Item key="signin">
//               <Button block onClick={() => navigate("/login")}>
//                 Sign In
//               </Button>
//             </Menu.Item>
//           </Menu>
//         </div>
//       )}
//     </header>
//   );
// };

// export default Navbar;

import React, { useState } from "react";
import { Button, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { LogIn, Sparkles, Rocket } from "lucide-react";

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = "" }) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const navigate = useNavigate();

  const gradientTextStyle = {
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundImage: "linear-gradient(to right, #2563eb, #06b6d4)",
  };

  return (
    <header
      className={`fixed w-full bg-white/10 backdrop-blur-md shadow-sm z-50 px-4 h-16 flex items-center ${className}`}
    >
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <div
          className="text-xl font-bold cursor-pointer flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          {/* Gradient Rocket Icon */}
          <div className="relative">
            <Rocket
              className="w-6 h-6"
              style={{
                stroke: "url(#blue-gradient)",
                strokeWidth: 2,
              }}
            />
            {/* SVG Gradient Definition */}
            <svg width="0" height="0">
              <defs>
                <linearGradient
                  id="blue-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {/* Gradient Text */}
          <span style={gradientTextStyle}>FoundersWay</span>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button
            icon={<LogIn className="w-4 h-4" />}
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-blue-600 to-cyan-500
              text-white border-0 hover:opacity-90 transition-all duration-300 rounded-lg"
          >
            Sign In
          </Button>
          <Button
            type="primary"
            onClick={() => navigate("/subscription-plans")}
            className="flex items-center bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:opacity-90"
          >
            Plans <Sparkles className="w-4 h-4" />
          </Button>
        </div>

        <Button
          icon={mobileMenuVisible ? <CloseOutlined /> : <MenuOutlined />}
          className="md:hidden"
          onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
        />
      </div>

      {mobileMenuVisible && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg md:hidden">
          <Menu mode="inline" className="px-4 py-2">
            <Menu.Item key="signin">
              <Button block onClick={() => navigate("/login")}>
                Sign In
              </Button>
            </Menu.Item>
          </Menu>
        </div>
      )}
    </header>
  );
};

export default Navbar;
