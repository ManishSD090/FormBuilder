import mongoose from "mongoose";

const subQuestionSchema = new mongoose.Schema({
  id: String, 
  question: String,
  answer: String 
});

const questionSchema = new mongoose.Schema({
  id: String, 
  type: { type: String, required: true }, // Removed strict enum to allow all 14 generic types
  title: String,
  description: String,
  image: String,
  
  // --- NEW GENERIC FIELDS ---
  required: { type: Boolean, default: false },
  options: [String], // For multiple_choice, checkboxes, dropdown
  validation: { type: mongoose.Schema.Types.Mixed },
  sectionId: { type: String },
  logic: { type: [mongoose.Schema.Types.Mixed], default: [] }, // Conditional branching rules

  // --- LEGACY FIELDS (Categorize, Cloze, Comprehension) ---
  categories: [String],
  items: [String],
  text: String, 
  passage: String,
  subQuestions: [subQuestionSchema] 
});

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  headerImage: String, 
  
  // --- NEW FORM STRUCTURE ---
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  sections: { type: [{
    id: String,
    title: String,
    description: String,
    order: Number
  }], default: [] },
  
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Form", formSchema);