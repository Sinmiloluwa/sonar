import express from "express";
import { upload } from "../middleware/upload.js";
import { feed, uploadVoice, userUploads } from "../controllers/voice.js";
import auth from "../middleware/auth.js";
import { validate } from '../middleware/validation.js';
import { voiceUploadSchema } from '../schema.js';

const router = express.Router();

router.post(
  "/upload",
  auth,
  upload.single("audio"),
  validate(voiceUploadSchema),
  uploadVoice
);

router.get('/my-uploads', auth, userUploads)
router.get('/feed', auth, feed)

export default router;
