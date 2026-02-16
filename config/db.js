import mongoose from "mongoose";

export const connectDB = async (uri) => {
  try {
    const connectionString = uri || process.env.MONGO_URI;
    console.log("Connecting with URI:", connectionString?.substring(0, 20) + "...");
    await mongoose.connect(connectionString);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};