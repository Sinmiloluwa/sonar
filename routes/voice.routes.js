import express from "express";
import { upload } from "../middleware/upload.js";
import { feed, uploadVoice, userUploads } from "../controllers/voice.js";
import { toggleReaction } from "../controllers/reaction.js";
import { postQR } from "../controllers/qr.js";
import auth from "../middleware/auth.js";
import { validate } from '../middleware/validation.js';
import { voiceUploadSchema, reactionSchema } from '../schema.js';

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
router.post('/:postId/react', auth, validate(reactionSchema), toggleReaction)
router.get('/:postId/qr', auth, postQR)

export default router;
