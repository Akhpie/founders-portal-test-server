import React, { useEffect } from "react";
import { Modal } from "antd";

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendlyUrl: string;
}

const CalendlyModal: React.FC<CalendlyModalProps> = ({
  isOpen,
  onClose,
  calendlyUrl,
}) => {
  useEffect(() => {
    const loadCalendly = async () => {
      if (!isOpen) return;

      try {
        // Check if Calendly is already loaded
        if (!window.Calendly) {
          // Only load the script if it's not already present
          const script = document.createElement("script");
          script.id = "calendly-script";
          script.src = "https://assets.calendly.com/assets/external/widget.js";
          script.async = true;

          // Wait for script to load
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Initialize widget
        const container = document.getElementById("calendly-container");
        if (container) {
          container.innerHTML = "";
          window.Calendly.initInlineWidget({
            url: calendlyUrl,
            parentElement: container,
          });
        }
      } catch (error) {
        console.error("Error loading Calendly:", error);
      }
    };

    loadCalendly();

    // Cleanup function only clears the container, not the script
    return () => {
      const container = document.getElementById("calendly-container");
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [isOpen, calendlyUrl]);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      bodyStyle={{ height: "600px", padding: 0 }}
      destroyOnClose={true}
    >
      <div
        id="calendly-container"
        className="calendly-inline-widget"
        style={{ height: "100%", minWidth: "320px" }}
      />
    </Modal>
  );
};

// Add TypeScript declaration for Calendly
declare global {
  interface Window {
    Calendly?: any;
  }
}

export default CalendlyModal;

// import React from "react";
// import { Modal } from "antd";

// interface CalendlyModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   calendlyUrl: string;
// }

// const CalendlyModal: React.FC<CalendlyModalProps> = ({
//   isOpen,
//   onClose,
//   calendlyUrl,
// }) => {
//   React.useEffect(() => {
//     // Load Calendly widget script
//     const script = document.createElement("script");
//     script.src = "https://assets.calendly.com/assets/external/widget.js";
//     script.async = true;
//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   return (
//     <>
//       <style>
//         {`
//           .ant-modal-body {
//             height: 600px !important;
//             padding: 0 !important;
//             overflow-y: auto !important;
//           }

//           .ant-modal-body::-webkit-scrollbar {
//             width: 8px;
//             height: 8px;
//           }

//           .ant-modal-body::-webkit-scrollbar-track {
//             background: #f1f1f1;
//             border-radius: 4px;
//           }

//           .ant-modal-body::-webkit-scrollbar-thumb {
//             background: #888;
//             border-radius: 4px;
//           }

//           .ant-modal-body::-webkit-scrollbar-thumb:hover {
//             background: #666;
//           }

//           /* For Firefox */
//           .ant-modal-body {
//             scrollbar-width: thin;
//             scrollbar-color: #888 #f1f1f1;
//           }
//         `}
//       </style>
//       <Modal
//         open={isOpen}
//         onCancel={onClose}
//         footer={null}
//         width={800}
//         className="ai-chat-modal"
//       >
//         <div
//           className="calendly-inline-widget"
//           data-url={calendlyUrl}
//           style={{ height: "100%", minWidth: "320px" }}
//         />
//       </Modal>
//     </>
//   );
// };

// export default CalendlyModal;
