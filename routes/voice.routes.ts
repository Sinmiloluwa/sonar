import express from "express";
import { upload } from "../middleware/upload.js";
import { feed, uploadVoice, userUploads, voiceDetails, recordPlay } from "../controllers/voice.js";
import { toggleReaction } from "../controllers/reaction.js";
import { addComment, getComments, deleteComment } from "../controllers/comment.js";
import { postQR } from "../controllers/qr.js";
import auth from "../middleware/auth.js";
import { validate } from '../middleware/validation.js';
import { voiceUploadSchema, reactionSchema } from '../schema.js';

const router = express.Router();

router.post(
  "/upload",
  auth,
  upload.single("audio"),
  validate(voiceUploadSchema as any),
  uploadVoice
);

router.get('/my-uploads', auth, userUploads);
router.get('/feed', auth, feed);
router.get('/:postId', auth, voiceDetails);
router.post('/:postId/play', auth, recordPlay);
router.post('/:postId/react', auth, validate(reactionSchema as any), toggleReaction);
router.get('/:postId/qr', auth, postQR);

router.post('/:postId/comments', auth, upload.single("audio"), addComment);
router.get('/:postId/comments', auth, getComments);
router.delete('/:postId/comments/:commentId', auth, deleteComment);

export default router;
