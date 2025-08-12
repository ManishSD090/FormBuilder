import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createForm,
  getForms,
  upload,
  // uploadImage,
  // getImage,
  deleteForm,
  getFormById,
  updateForm // <-- NEW: Import the updateForm function
} from "../controllers/formController.js";
import * as formController from "../controllers/formController.js";


const router = express.Router();

// Form CRUD
router.post("/", protect, createForm);
router.get("/", protect, getForms);

// NEW: Route for updating a form by ID
router.put("/:id", protect, updateForm); // <-- ADDED: This handles PUT requests for editing forms

// // Image upload — make sure field name is "image"
// router.post("/upload", upload.single("image"), formController.uploadImage);

// // Retrieve image
// router.get("/image/:id", getImage);

// Get form by ID and Delete form
// Note: router.route('/:id') groups methods for the same path
router.route('/:id')
  .get(getFormById)
  .put(protect, updateForm)
  .delete(protect, deleteForm);

export default router;