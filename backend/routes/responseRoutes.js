import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  submitResponse,
  getResponseById,
  getResponsesByFormId,
  deleteResponse,
} from '../controllers/responseController.js';

const router = express.Router();

router.route('/').post(submitResponse);
router.get('/form/:formId', protect, getResponsesByFormId);
router.get('/:id', protect, getResponseById);
router.delete('/:id', protect, deleteResponse);

export default router;