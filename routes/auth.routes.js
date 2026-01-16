import express from "express";
import { anonymousAuth } from "../controllers/auth.js";
import { validate } from '../middleware/validation.js';
import { userSchema } from '../schema.js';

const router = express.Router();

router.post("/anonymous", validate(userSchema), anonymousAuth);

export default router;
