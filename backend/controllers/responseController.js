import Response from '../models/Response.js';
import Form from '../models/Form.js';
import mongoose from 'mongoose';

export const submitResponse = async (req, res) => {
  // Checkpoint 1: Did the function start?
  console.log("--- Step 1: submitResponse function started ---");

  try {
    // Checkpoint 2: Did we get the request body?
    console.log("Step 2: Request body received:", req.body);
    const { formId, answers, userEmail } = req.body;

    // Checkpoint 3: Is the formId valid?
    console.log("Step 3: Searching for form with ID:", formId);
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Checkpoint: Is the form still accepting responses?
    const settings = form.settings || {};
    if (settings.acceptingResponses === false) {
      return res.status(403).json({ message: 'This form is no longer accepting responses.' });
    }
    if (settings.expiresAt && new Date(settings.expiresAt) < new Date()) {
      return res.status(403).json({ message: 'This form has expired.' });
    }

    // Enforce email collection
    if (settings.collectEmail && !userEmail) {
      return res.status(400).json({ message: 'Email address is required for this form.' });
    }

    // Enforce 1 response limit
    if (settings.limitOneResponse) {
      if (!userEmail) {
        return res.status(400).json({ message: 'Sign-in (email) is required to limit responses.' });
      }
      const existing = await Response.findOne({ formId, userEmail });
      if (existing) {
        return res.status(403).json({ message: 'You have already submitted a response to this form.' });
      }
    }

    // Checkpoint 4: Found the form, preparing to create response.
    console.log("Step 4: Form found. Creating new response object.");
    const newResponse = new Response({
      formId,
      userEmail, // ADDED: Pass the email to the new response object
      answers,
    });

    // Checkpoint 5: Is the new response object valid?
    console.log("Step 5: Response object created:", newResponse);

    // Checkpoint 6: Attempting to save to database.
    console.log("Step 6: Saving response to database...");
    await newResponse.save();
    console.log("Step 7: Response saved successfully.");
    res.status(201).json({ message: 'Response submitted successfully!' });

  } catch (error) {
    console.error("Error in submitResponse:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

export const getResponseById = async (req, res) => {
  try {
    const { id } = req.params; // This is the response ID

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid response ID format.' });
    }

    const response = await Response.findById(id)
                                    .populate({
                                      path: 'formId',
                                      model: 'Form',
                                      select: 'title description questions headerImage'
                                    })
                                    .lean();

    if (!response) {
      return res.status(404).json({ message: 'Response not found.' });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getResponseById:', error);
    res.status(500).json({ message: error.message || 'Server error fetching response.' });
  }
};

export const getResponsesByFormId = async (req, res) => {
  try {
    const { formId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';

    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ message: 'Invalid form ID format.' });
    }

    const responses = await Response.find({ formId })
      .populate({ path: 'formId', model: 'Form', select: 'title description questions headerImage settings' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Response.countDocuments({ formId });
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      data: responses || [],
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error in getResponsesByFormId:', error);
    res.status(500).json({ message: error.message || 'Server error fetching responses for form.' });
  }
};

export const deleteResponse = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid response ID format.' });
    }
    const deleted = await Response.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Response not found.' });
    res.status(200).json({ message: 'Response deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteResponse:', error);
    res.status(500).json({ message: error.message || 'Server error deleting response.' });
  }
};

