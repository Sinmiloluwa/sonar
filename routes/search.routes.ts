import express from "express";
import { search } from "../controllers/search.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get('/', auth, search);

export default router;
