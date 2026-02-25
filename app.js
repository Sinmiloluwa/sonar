import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js"
import voiceRoutes from "./routes/voice.routes.js"
import searchRoutes from "./routes/search.routes.js"
import userRoutes from "./routes/user.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import categoryRoutes from "./routes/category.routes.js"
import { initFirebase } from "./services/firebase.js";
import { startWorker } from "./services/worker.js";
import { seedCategories } from "./seeders/categories.js"
import cors from "cors";
import { v2 as cloudinary } from 'cloudinary';
import { Router } from 'express';

const apiRouter = Router();

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const mongoUri = process.env.MONGO_URI?.replace(/^["']|["']$/g, '');
console.log("Cleaned MONGO_URI first 20 chars:", mongoUri?.substring(0, 20));

const app = express();

connectDB(mongoUri).then(() => seedCategories());
initFirebase();
startWorker();

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

apiRouter.use("/auth", authRoutes);
apiRouter.use("/voice", voiceRoutes);
apiRouter.use("/search", searchRoutes);
apiRouter.use("/user", userRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/categories", categoryRoutes);

app.use("/api",apiRouter);

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ 
    error: "Internal server error", 
    message: err.message 
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
