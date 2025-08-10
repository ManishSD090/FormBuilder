import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ import middleware

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, (req, res) => {
  res.json({
    fullName: req.user.fullName, // ✅ match your model
    role: req.user.role || "User" // ✅ fallback if role not set
  });
});

export default router;
