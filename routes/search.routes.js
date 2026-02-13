import express from "express";
import { searchUsers, searchVoicePosts, getTags } from "../controllers/search.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get('/users', auth, searchUsers);
router.get('/posts', auth, searchVoicePosts);
router.get('/tags', auth, getTags);

export default router;
