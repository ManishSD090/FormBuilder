import mongoose from "mongoose";

const subQuestionSchema = new mongoose.Schema({
  // Mongoose automatically adds a default '_id' field to sub-documents in arrays.
  // The 'id: String' field here might be redundant if '_id' is used as the primary identifier.
  // If 'id' is for a custom, non-MongoDB unique identifier, keep it. Otherwise, consider removing.
  id: String, 
  question: String,
  answer: String // could be multiple lines for options
}, { /* Removed _id: false */ }); // Mongoose will now generate _id by default

const questionSchema = new mongoose.Schema({
  // Mongoose automatically adds a default '_id' field to documents/sub-documents.
  // The 'id: String' field here might be redundant if '_id' is used as the primary identifier.
  // If 'id' is for a custom, non-MongoDB unique identifier, keep it. Otherwise, consider removing.
  id: String, 
  type: { type: String, enum: ["categorize", "cloze", "comprehension"], required: true },
  title: String,
  description: String,
  image: String, // URL to question image

  // Categorize specific fields
  categories: [String],
  items: [String],

  // Cloze specific fields
  text: String, // Text with [BLANK] markers

  // Comprehension specific fields
  passage: String,
  subQuestions: [subQuestionSchema] // Each subQuestion will now also get an _id
}, { /* Removed _id: false */ }); // Mongoose will now generate _id by default

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  headerImage: String, // URL to header image
  questions: [questionSchema], // Each question will now get an _id
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Form", formSchema);