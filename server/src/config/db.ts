import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === "development"
        ? process.env.MONGO_URI
        : process.env.MONGO_DEV_URI;

    await mongoose.connect(mongoURI as string, {
      // Optional Mongoose configurations
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
