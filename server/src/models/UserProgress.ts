// * THIS IS PRESENT IN MONGODB
import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChecklistTemplate",
    required: true,
  },
  done: { type: Boolean, default: false },
});

// Compound index to ensure unique combination of userId and templateId
userProgressSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export default mongoose.model("UserProgress", userProgressSchema);
