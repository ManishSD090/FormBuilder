import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import Form from "../models/Form.js";
import Response from "../models/Response.js"; // <-- This import is crucial for counting responses

let gfs;
mongoose.connection.once("open", () => {
  gfs = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
});

const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Create form
export const createForm = async (req, res) => {
  try {
    let { title, description, questions, headerImage } = req.body;

    // Ensure questions is parsed if it comes as a string (e.g., from FormData)
    if (typeof questions === "string") {
      questions = JSON.parse(questions);
    }

    const form = await Form.create({
      title,
      description,
      questions,
      headerImage,
      createdBy: req.user._id
    });

    res.status(201).json(form);
  } catch (error) {
    console.error("Error in createForm:", error); // Added console.error for debugging
    res.status(500).json({ message: error.message || "Server error creating form." });
  }
};

// Get all forms for logged-in user with dynamic response counts
export const getForms = async (req, res) => {
  try {
    // Fetch forms created by the logged-in user.
    // .lean() is used here for performance, returning plain JavaScript objects
    // instead of Mongoose documents, which is efficient when not modifying and saving back.
    const forms = await Form.find({ createdBy: req.user._id }).lean(); 
    
    // Use Promise.all to concurrently fetch response counts for all forms.
    // This significantly speeds up the process compared to fetching counts sequentially.
    const formsWithCounts = await Promise.all(
      forms.map(async (form) => {
        let responseCount = 0;
        // Validate form._id before using it to count responses.
        // This prevents potential errors if a form has an invalid or malformed ID.
        if (mongoose.Types.ObjectId.isValid(form._id)) {
            responseCount = await Response.countDocuments({ formId: form._id });
        } else {
            // Log a warning for debugging if an invalid ID is encountered
            console.warn(`Skipping response count for form with invalid _id: ${form._id}`);
        }
        
        // Return a new object that includes all original form properties
        // plus the newly calculated 'responsesCount'.
        return {
          ...form, 
          responsesCount: responseCount, 
        };
      })
    );

    // CRITICAL FIX: Send the 'formsWithCounts' array, which now includes the response counts.
    res.json(formsWithCounts);
  } catch (error) {
    console.error("Error in getForms:", error); // Added console.error for debugging
    res.status(500).json({ message: error.message || "Server error fetching forms." });
  }
};

// NEW FUNCTION: Update a form by ID
export const updateForm = async (req, res) => {
  try {
    const { id } = req.params; // Form ID from URL
    const { title, description, questions, headerImage } = req.body; // Updated form data

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid form ID format.' });
    }

    let form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    // Security Check: Ensure the user updating the form is the one who created it
    if (form.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this form.' });
    }

    // Update form fields
    form.title = title;
    form.description = description;
    form.questions = questions; // Directly assign the updated questions array
    form.headerImage = headerImage; // Assign the updated header image path

    const updatedForm = await form.save(); // Save the updated form

    res.status(200).json(updatedForm); // Send back the updated form
  } catch (error) {
    console.error("Error in updateForm:", error);
    res.status(500).json({ message: error.message || "Server error updating form." });
  }
};


// Upload image
export const uploadImage = (req, res) => { 
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    if (!gfs) {
      if (!mongoose.connection.db) {
        return res.status(500).json({ message: "MongoDB connection not ready" });
      }
      gfs = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    }

    const uploadStream = gfs.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    const fileId = uploadStream.id;

    uploadStream.on('error', (error) => {
      res.status(500).json({ message: `Upload Error: ${error.message}` });
    });

    uploadStream.on('finish', () => {
      res.status(200).json({ imageUrl: `/api/forms/image/${fileId}` });
    });

    uploadStream.end(req.file.buffer);
    
  } catch (error) {
    console.error("Error in uploadImage:", error);
    res.status(500).json({ message: error.message || "Server error uploading image." });
  }
};

// Get image by ID
export const getImage = async (req, res) => {
  try {
    if (!gfs) {
      gfs = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = gfs.openDownloadStream(fileId);

    downloadStream.on("error", () =>
      res.status(404).json({ message: "Image not found" })
    );

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error in getImage:", error);
    res.status(500).json({ message: error.message || "Server error getting image." });
  }
};

// Delete form
export const deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Security Check: Make sure the user deleting the form is the one who created it
    if (form.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this form' });
    }

    // If the user is authorized, delete the form
    await Form.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Form deleted successfully' });

  } catch (error) {
    console.error("Error in deleteForm:", error);
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// Get form by ID
export const getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // This route is public, so we don't check for ownership
    res.json(form);

  } catch (error) {
    console.error("Error in getFormById:", error);
    res.status(500).json({ message: error.message || "Server error getting form by ID." });
  }
};