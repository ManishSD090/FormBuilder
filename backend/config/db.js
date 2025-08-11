import mongoose from "mongoose";
// import { initGridFS } from "../controllers/formController.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // mongoose.connection.once("open", () => {
    //   initGridFS(); // ✅ Initialize GridFS after connection opens
    // });

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
