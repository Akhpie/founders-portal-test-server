import mongoose, { Document, Schema } from "mongoose";

interface ITemplate extends Document {
  name: string;
  description: string;
  category: "general" | "seasonal" | "holiday" | "event";
  content: string;
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["general", "seasonal", "holiday", "event"],
      default: "general",
    },
    content: { type: String, required: true },
    thumbnail: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Template = mongoose.model<ITemplate>("Template", TemplateSchema);
export default Template;
