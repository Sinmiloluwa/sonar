import express from "express";
import { followUser, unfollowUser, getFollowing } from "../controllers/follow.js";
import { getProfile, updateEmail, updateLocation, getNearbyUsers} from "../controllers/user.js";
import { myProfileQR, userProfileQR } from "../controllers/qr.js";
import auth from "../middleware/auth.js";
import { updateEmailSchema } from "../schema.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

router.post('/follow/:userId', auth, followUser);
router.delete('/follow/:userId', auth, unfollowUser);
router.get('/following', auth, getFollowing);
router.patch('/email', auth, validate(updateEmailSchema), updateEmail);
router.get('/profile', auth, getProfile);
router.get('/profile/qr', auth, myProfileQR);
router.get('/:userId/qr', auth, userProfileQR);
router.put('/location', auth, updateLocation);
router.get('/nearby', auth, getNearbyUsers);

export default router;
