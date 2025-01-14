// models/Influencer.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IStartupInfluencer extends Document {
  name: string;
  linkedinUrl: string;
  bio: string;
  focus: string[];
  description: string;
  imageUrl?: string;
}

const StartupInfluencerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    linkedinUrl: { type: String, required: false },
    bio: { type: String, required: true },
    focus: { type: [String], required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStartupInfluencer>(
  "StartupInfluencer",
  StartupInfluencerSchema
);
