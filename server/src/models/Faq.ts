import mongoose, { Document, Schema } from "mongoose";

export interface IFaq extends Document {
  category: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema(
  {
    category: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IFaq>("Faq", FaqSchema);
