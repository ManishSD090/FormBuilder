import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  submitResponse,
  getResponseById,
  getResponsesByFormId // Import the new function
} from '../controllers/responseController.js';

const router = express.Router();

router.route('/').post(submitResponse);

// Order matters: More specific routes should come before less specific ones.
// This ensures '/form/:formId' doesn't get caught by '/:id'
router.get('/form/:formId', protect, getResponsesByFormId); // Correctly positioned route for list of responses
router.get('/:id', protect, getResponseById); // Route for a single response by its ID

export default router;