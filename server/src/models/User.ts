import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  isVerified: boolean;
  phone: string;
  location: string;
  companyName: string;
  foundedYear: Number;
  linkedinUrl: string;
  industry: string;
  companyDescription: string;
  currentStage: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  isAdmin: boolean;
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

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    companyName: { type: String, required: true },
    foundedYear: { type: Number, required: true },
    linkedinUrl: { type: String, required: false },
    industry: { type: String, required: true },
    companyDescription: { type: String, required: true },
    currentStage: { type: String, required: true },
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

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
