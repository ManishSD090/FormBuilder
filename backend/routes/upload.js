import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const router = express.Router();
const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  try {
    res.json({
      success: true,
      url: req.file.path, // Cloudinary's public URL
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
