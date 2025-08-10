import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true,
  },
  // ADDED: A field to store the email of the person submitting the form.
  userEmail: {
    type: String,
    // You can add validation here if you want:
    // match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  answers: [
    {
      questionId: { type: String, required: true },
      questionType: { type: String, required: true },
      answer: { type: mongoose.Schema.Types.Mixed, required: true },
    },
  ],
}, { timestamps: true });

const Response = mongoose.model('Response', responseSchema);

export default Response;
