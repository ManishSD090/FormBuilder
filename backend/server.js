import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import responseRoutes from "./routes/responseRoutes.js";
// import { initGridFS } from "./controllers/formController.js";
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();

// Allowed origins
const allowedOrigins = [
  "https://form-builder-three-gray.vercel.app", // your Vercel frontend
   "http://localhost:5173"
];

const corsOptions = {
  origin: (origin, callback) => {
    console.log("CORS Origin:", origin);
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(
        new Error(`CORS policy does not allow origin: ${origin}`),
        false
      );
    }
    return callback(null, true);
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOptions));
app.options("/*", cors(corsOptions)); // ✅ fixed for Express 5+
app.use(express.json());
app.use('/api/upload', uploadRoutes);


// Health check
app.get("/", (req, res) => {
  res.send("Backend API is live! 🚀");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);

// Start server after DB is connected
const startServer = async () => {
  await connectDB(); // ✅ Wait for DB connection
  // initGridFS(); // ✅ Initialize GridFS after DB connection is ready

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
