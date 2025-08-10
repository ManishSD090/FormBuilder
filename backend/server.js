import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import responseRoutes from "./routes/responseRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Allowed frontend origins (local + deployed)
const allowedOrigins = [
  "https://form-builder-ffrxbvthr-manishdarge2-gmailcoms-projects.vercel.app",
  "https://form-builder-git-main-manishdarge2-gmailcoms-projects.vercel.app",
  "http://localhost:3000"  // if you test locally
];

// CORS setup
app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS origin:', origin);
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      console.error(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));


app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend API is live! 🚀');
});


// API routes
app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
