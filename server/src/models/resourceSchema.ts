import mongoose from "mongoose";

const resourceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // downloads: { type: String, required: true },
  downloads: { type: Number, default: 0 },
  rating: { type: Number, required: true },
  fileType: { type: String, required: true },
  preview: { type: Boolean, default: false },
  fileUrl: { type: String },
});

const resourceCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  description: { type: String, required: true },
  color: { type: String, required: true },
  items: [resourceItemSchema],
});

export const ResourceCategory = mongoose.model(
  "ResourceCategory",
  resourceCategorySchema
);
