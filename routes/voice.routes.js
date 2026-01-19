import express from "express";
import { upload } from "../middleware/upload.js";
import { uploadVoice } from "../controllers/voice.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/upload",
  auth,
  upload.single("audio"),
  uploadVoice
);

export default router;
