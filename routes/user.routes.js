import express from "express";
import { followUser, unfollowUser, getFollowing } from "../controllers/follow.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post('/follow/:userId', auth, followUser);
router.delete('/follow/:userId', auth, unfollowUser);
router.get('/following', auth, getFollowing);

export default router;
