import mongoose, { Document, Schema } from "mongoose";

interface IVisitor extends Document {
  fullName: string;
  email: string;
  password: string;
  isVerified: boolean;
  phone: string;
  location: string;
  companyWorkingAt: string;
  linkedinUrl: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  notificationPreferences: {
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
}

const VisitorSchema = new Schema<IVisitor>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    companyWorkingAt: { type: String, required: true },
    linkedinUrl: { type: String, required: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    notificationPreferences: {
      emailNotifications: {
        newOpportunities: { type: Boolean, default: false },
        newsletter: { type: Boolean, default: false },
        applicationUpdates: { type: Boolean, default: false },
        investorMessages: { type: Boolean, default: false },
      },
      systemNotifications: {
        taskReminders: { type: Boolean, default: false },
        deadlineAlerts: { type: Boolean, default: false },
        newsUpdates: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

const Visitor = mongoose.model<IVisitor>("Visitor", VisitorSchema);
export default Visitor;
