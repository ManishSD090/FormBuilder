import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  submitResponse,
  getResponseById,
  getResponsesByFormId
} from '../controllers/responseController.js';

const router = express.Router();

router.post('/', submitResponse);

// Consolidate routes with the same base path
router.get('/form/:formId', protect, getResponsesByFormId);
router.get('/:id', protect, getResponseById);

export default router;