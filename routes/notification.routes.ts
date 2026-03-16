import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  registerFcmToken,
  removeFcmToken,
} from "../controllers/notification.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getNotifications);
router.get("/unread-count", auth, getUnreadCount);
router.patch("/read-all", auth, markAllAsRead);
router.patch("/:id/read", auth, markAsRead);
router.post("/fcm-token", auth, registerFcmToken);
router.delete("/fcm-token", auth, removeFcmToken);

export default router;
