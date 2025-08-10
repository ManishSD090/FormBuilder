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
    const { formId } = req.params; // This is the form ID

    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ message: 'Invalid form ID format.' });
    }

    // Find all responses linked to this formId
    const responses = await Response.find({ formId: formId })
                                    .populate({
                                      path: 'formId', // Populate the form details for each response
                                      model: 'Form',
                                      select: 'title description questions headerImage'
                                    })
                                    .lean(); // Use .lean() for performance

    if (!responses || responses.length === 0) {
      // Return 200 with an empty array if no responses, not 404, as the form exists.
      return res.status(200).json([]);
    }

    res.status(200).json(responses);
  } catch (error) {
    console.error('Error in getResponsesByFormId:', error);
    res.status(500).json({ message: error.message || 'Server error fetching responses for form.' });
  }
};

