import express from "express";
import { register, login, googleAuth } from "../controllers/auth.js";
import { validate } from '../middleware/validation.js';
import { registerSchema, loginSchema, googleAuthSchema } from '../schema.js';

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/google", validate(googleAuthSchema), googleAuth);

export default router;
