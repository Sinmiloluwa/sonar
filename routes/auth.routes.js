import express from "express";
import { anonymousAuth, googleAuth } from "../controllers/auth.js";
import { validate } from '../middleware/validation.js';
import { userSchema, googleAuthSchema } from '../schema.js';

const router = express.Router();

router.post("/anonymous", validate(userSchema), anonymousAuth);
router.post("/google", validate(googleAuthSchema), googleAuth);

export default router;
