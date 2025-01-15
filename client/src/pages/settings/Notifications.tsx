import { Typography, Card, Switch, message, Spin } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";

const { Title } = Typography;

type NotificationSection = "emailNotifications" | "systemNotifications";

interface EmailNotifications {
  newOpportunities: boolean;
  newsletter: boolean;
  applicationUpdates: boolean;
  investorMessages: boolean;
}

interface SystemNotifications {
  taskReminders: boolean;
  deadlineAlerts: boolean;
  newsUpdates: boolean;
}

interface NotificationPreferences {
  emailNotifications: EmailNotifications;
  systemNotifications: SystemNotifications;
}

type EmailNotificationKey = keyof EmailNotifications;
type SystemNotificationKey = keyof SystemNotifications;
type NotificationKey = EmailNotificationKey | SystemNotificationKey;

interface NotificationItem {
  key: NotificationKey;
  label: string;
}

interface NotificationSectionConfig {
  title: string;
  section: NotificationSection;
  items: NotificationItem[];
}

const Notifications = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [userType, setUserType] = useState<"founder" | "visitor" | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Get user type from localStorage
    const storedUserType = localStorage.getItem("userType") as
      | "founder"
      | "visitor";
    setUserType(storedUserType);

    window.addEventListener("resize", handleResize);
    handleResize();
    fetchNotificationPreferences();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getNotificationsEndpoint = () => {
    const baseUrl = "https://founders-portal-test-server-apii.onrender.com/api";
    return userType === "visitor"
      ? `${baseUrl}/visitor/notifications`
      : `${baseUrl}/notifications`;
  };

  const fetchNotificationPreferences = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<{
        success: boolean;
        data: NotificationPreferences;
      }>(getNotificationsEndpoint(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setPreferences(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      message.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (
    section: NotificationSection,
    key: NotificationKey,
    checked: boolean
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put<{
        success: boolean;
        data: NotificationPreferences;
      }>(
        getNotificationsEndpoint(),
        {
          section,
          key,
          value: checked,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setPreferences(response.data.data);
        message.success("Notification preference updated");
      }
    } catch (error) {
      console.error("Error updating preference:", error);
      message.error("Failed to update notification preference");
    }
  };

  const getPreferenceValue = (
    section: NotificationSection,
    key: NotificationKey
  ): boolean => {
    if (!preferences) return false;

    if (section === "emailNotifications") {
      return preferences.emailNotifications[key as keyof EmailNotifications];
    }
    return preferences.systemNotifications[key as keyof SystemNotifications];
  };

  const notifications: NotificationSectionConfig[] = [
    {
      title: "Email Notifications",
      section: "emailNotifications",
      items: [
        {
          key: "newOpportunities",
          label: "New Investment Opportunities",
        },
        {
          key: "newsletter",
          label: "NewsLetters",
        },
        {
          key: "applicationUpdates",
          label: "Application Status Updates",
        },
        {
          key: "investorMessages",
          label: "Investor Messages",
        },
      ],
    },
    {
      title: "System Notifications",
      section: "systemNotifications",
      items: [
        {
          key: "taskReminders",
          label: "Task Reminders",
        },
        {
          key: "deadlineAlerts",
          label: "Deadline Alerts",
        },
        {
          key: "newsUpdates",
          label: "Industry News & Updates",
        },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Notification Preferences</Title>

      {notifications.map((section) => (
        <Card key={section.title} title={section.title} className="mt-6">
          <div
            className={`flex flex-col ${
              isMobile ? "items-start" : "items-center"
            }`}
          >
            {section.items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between w-full mb-4"
              >
                <div>{item.label}</div>
                <Switch
                  checked={getPreferenceValue(section.section, item.key)}
                  onChange={(checked) =>
                    handleToggle(section.section, item.key, checked)
                  }
                />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Notifications;
