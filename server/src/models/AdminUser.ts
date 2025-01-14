import mongoose, { Document } from "mongoose";

export interface IAdminUser extends Document {
  adminemail: string;
  adminname: string;
  adminrole: "super_admin" | "admin";
  status: "active" | "inactive";
  addedBy: string;
  dateAdded: Date;
  lastLogin?: Date;
  profilePic?: string;
}

const adminUserSchema = new mongoose.Schema<IAdminUser>({
  adminemail: { type: String, required: true, unique: true },
  adminname: { type: String, required: true },
  adminrole: { type: String, enum: ["super_admin", "admin"], default: "admin" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  addedBy: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  profilePic: { type: String },
});

export default mongoose.model<IAdminUser>("AdminUser", adminUserSchema);
