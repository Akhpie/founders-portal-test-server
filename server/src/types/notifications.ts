export type NotificationPreferences = {
  emailNotifications: {
    newOpportunities: boolean;
    newsletter: boolean;
    applicationUpdates: boolean;
    investorMessages: boolean;
  };
  systemNotifications: {
    taskReminders: boolean;
    deadlineAlerts: boolean;
    newsUpdates: boolean;
  };
};

export type NotificationSection = keyof NotificationPreferences;
export type EmailNotificationKey =
  keyof NotificationPreferences["emailNotifications"];
export type SystemNotificationKey =
  keyof NotificationPreferences["systemNotifications"];
export type NotificationKey = EmailNotificationKey | SystemNotificationKey;

export interface UpdateNotificationRequest {
  section: NotificationSection;
  key: NotificationKey;
  value: boolean;
}
