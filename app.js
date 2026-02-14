import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js"
import voiceRoutes from "./routes/voice.routes.js"
import searchRoutes from "./routes/search.routes.js"
import userRoutes from "./routes/user.routes.js"
import cors from "cors";
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/voice", voiceRoutes);
app.use("/search", searchRoutes);
app.use("/user", userRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
