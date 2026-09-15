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
  updateForm,
  autosaveForm,
  duplicateForm
} from "../controllers/formController.js";
import * as formController from "../controllers/formController.js";


const router = express.Router();

// Form CRUD
router.post("/", protect, createForm);
router.get("/", protect, getForms);

// NEW: Routes for updating forms
router.put("/:id", protect, updateForm); 
router.put("/:id/autosave", protect, autosaveForm);

// Duplicate form
router.post("/:id/duplicate", protect, duplicateForm);

// // Image upload — make sure field name is "image"
// router.post("/upload", upload.single("image"), formController.uploadImage);

// // Retrieve image
// router.get("/image/:id", getImage);

// Get form by ID and Delete form
// Note: router.route('/:id') groups methods for the same path
router.route('/:id')
  .get(getFormById)
  .delete(protect, deleteForm);

export default router;