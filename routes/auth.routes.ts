import express from "express";
import { register, login, googleAuth } from "../controllers/auth.js";
import { validate } from '../middleware/validation.js';
import { registerSchema, loginSchema, googleAuthSchema } from '../schema.js';

const router = express.Router();

router.post("/register", validate(registerSchema as any), register);
router.post("/login", validate(loginSchema as any), login);
router.post("/google", validate(googleAuthSchema as any), googleAuth);

export default router;
