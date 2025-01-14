// models/Influencer.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IInfluencer extends Document {
  name: string;
  youtubeUrl: string;
  linkedinUrl: string;
  bio: string;
  focus: string[];
  description: string;
  imageUrl?: string;
}

const InfluencerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    linkedinUrl: { type: String, required: true },
    bio: { type: String, required: true },
    focus: { type: [String], required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IInfluencer>("Influencer", InfluencerSchema);
