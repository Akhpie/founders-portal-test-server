// * THIS IS PRESENT IN THE MONGO DB DATABASE
import mongoose from "mongoose";

const checklistTemplateSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String, required: true },
});

export default mongoose.model("ChecklistTemplateMain", checklistTemplateSchema);
