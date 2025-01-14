import mongoose, { Document, Schema } from "mongoose";

interface IChecklistItem extends Document {
  userId: mongoose.Types.ObjectId;
  text: string;
  done: boolean;
  category: string;
}

const ChecklistItemSchema = new Schema<IChecklistItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    done: { type: Boolean, default: false },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

const ChecklistItem = mongoose.model<IChecklistItem>(
  "ChecklistItem",
  ChecklistItemSchema
);

export default ChecklistItem;
