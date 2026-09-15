import multer from "multer";
import mongoose from "mongoose";
// import { GridFSBucket } from "mongodb";
import Form from "../models/Form.js";
import Response from "../models/Response.js"; // <-- This import is crucial for counting responses
import { Readable } from 'stream';




// Global GridFS variable
// let gfs;

// export const initGridFS = () => {
//   if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
//     throw new Error("MongoDB connection not ready yet");
//   }
//   gfs = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
//   console.log("✅ GridFS initialized");
// };



// export const getGfs = () => gfs;
// const grid = getGfs(); // now calls the locally defined function

// REMOVED: Old gfs initialization that only ran once.
// mongoose.connection.once("open", ...) has been removed.

// ADDED: Robust GridFS Initializer
// This function initializes GFS if the connection is ready, preventing race conditions.
// function getGridFS() {
//   if (!gfs && mongoose.connection.readyState === 1) {
//     gfs = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
//     console.log("🔄 GridFS initialized");
//   }
//   return gfs;
// }


const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Create form
// Replace your existing createForm function with this one
export const createForm = async (req, res) => {
  console.log("--- createForm controller initiated ---"); // Log start

  try {
    let { title, description, questions, headerImage } = req.body;

    // 1. Log the raw data received from the frontend
    console.log("1. Data received in req.body:", req.body);

    // Ensure questions is an array
    if (typeof questions === "string") {
      try {
        questions = JSON.parse(questions);
        console.log("2. 'questions' field parsed successfully.");
      } catch (parseError) {
        console.error("ERROR: Failed to parse 'questions' JSON string.", parseError);
        // Send an error response immediately if JSON is invalid
        return res.status(400).json({ message: "Invalid format for questions data." });
      }
    }

    console.log("3. Attempting to create form in database...");

    const form = await Form.create({
      title,
      description,
      questions,
      headerImage,
      createdBy: req.user._id
    });

    console.log("4. Form created successfully in database:", form);

    res.status(201).json(form);
    console.log("5. Sent success response to client.");

  } catch (error) {
    // This will catch any errors from Form.create()
    console.error("--- ERROR in createForm ---:", error);
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
    const { id } = req.params; 
    const { title, description, headerImage, settings, sections, questions } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid form ID format.' });
    }

    let form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    if (form.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this form.' });
    }

    form.title = title !== undefined ? title : form.title;
    form.description = description !== undefined ? description : form.description;
    form.headerImage = headerImage !== undefined ? headerImage : form.headerImage;
    form.settings = settings !== undefined ? settings : form.settings;
    form.sections = sections !== undefined ? sections : form.sections;
    form.questions = questions !== undefined ? questions : form.questions;

    const updatedForm = await form.save(); 

    res.status(200).json(updatedForm); 
  } catch (error) {
    console.error("Error in updateForm:", error);
    res.status(500).json({ message: error.message || "Server error updating form." });
  }
};

// NEW FUNCTION: Autosave a form (essentially partial update)
export const autosaveForm = async (req, res) => {
  try {
    const { id } = req.params; 
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid form ID format.' });
    }

    let form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }
    if (form.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this form.' });
    }

    // Apply partial updates
    const updates = req.body;
    if (updates.title !== undefined) form.title = updates.title;
    if (updates.description !== undefined) form.description = updates.description;
    if (updates.headerImage !== undefined) form.headerImage = updates.headerImage;
    if (updates.settings !== undefined) form.settings = updates.settings;
    if (updates.sections !== undefined) form.sections = updates.sections;
    if (updates.questions !== undefined) form.questions = updates.questions;

    const updatedForm = await form.save();
    res.status(200).json(updatedForm);
  } catch (error) {
    console.error("Error in autosaveForm:", error);
    res.status(500).json({ message: error.message || "Server error autosaving form." });
  }
};


// export const uploadImage = (req, res) => {
//   const grid = getGfs(); // ✅ Use getter
//   if (!grid) {
//     return res.status(500).json({ message: "GridFS is not ready." });
//   }
  
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   const readableStream = new Readable();
//   readableStream.push(req.file.buffer);
//   readableStream.push(null);

//   const uploadStream = grid.openUploadStream(req.file.originalname, {
//     contentType: req.file.mimetype,
//   });

//   uploadStream.on("finish", () => {
//     console.log("✅ Upload finished!");
//     res.status(200).json({ imageUrl: `/api/forms/image/${uploadStream.id}` });
//   });

//   uploadStream.on("error", (err) => {
//     console.error("❌ Upload error:", err);
//     res.status(500).json({ message: err.message });
//   });

//   readableStream.pipe(uploadStream);
// };

// export const getImage = async (req, res) => {
//   try {
//     const grid = getGfs(); // ✅ Use getter
//     if (!grid) {
//       return res.status(500).json({ message: "GridFS is not ready." });
//     }

//     const fileId = new mongoose.Types.ObjectId(req.params.id);
//     const downloadStream = grid.openDownloadStream(fileId);

//     downloadStream.on("error", () =>
//       res.status(404).json({ message: "Image not found" })
//     );

//     downloadStream.pipe(res);
//   } catch (error) {
//     console.error("Error in getImage:", error);
//     res.status(500).json({ message: error.message || "Server error getting image." });
//   }
// };

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

// Duplicate form
export const duplicateForm = async (req, res) => {
  try {
    const original = await Form.findById(req.params.id).lean();
    if (!original) {
      return res.status(404).json({ message: 'Form not found.' });
    }
    if (original.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to duplicate this form.' });
    }

    // Deep-clone without the mongo _id fields so Mongoose generates fresh ones
    const { _id, createdAt, updatedAt, __v, ...rest } = original;

    // Strip _id from questions and sections too
    const cleanQuestions = (rest.questions || []).map(({ _id: qid, ...q }) => q);
    const cleanSections = (rest.sections || []).map(({ _id: sid, ...s }) => s);

    const duplicate = new Form({
      ...rest,
      title: `Copy of ${original.title}`,
      questions: cleanQuestions,
      sections: cleanSections,
      createdBy: req.user._id,
      // Reset status flags on the duplicate
      settings: {
        ...(rest.settings || {}),
        acceptingResponses: true,
        expiresAt: undefined,
      },
    });

    const saved = await duplicate.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error in duplicateForm:", error);
    res.status(500).json({ message: error.message || "Server error duplicating form." });
  }
};