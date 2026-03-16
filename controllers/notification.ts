import Notification from "../models/notification.js";
import User from "../models/user.js";
import { Request, Response } from "express";

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query as { page?: string; limit?: string };
    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find({ recipientId: req.user!.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({ notifications });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user!.id,
      read: false,
    });
    res.status(200).json({ count });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user!.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.status(200).json({ notification });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { recipientId: req.user!.id, read: false },
      { read: true }
    );
    res.status(200).json({ message: "All marked as read" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const registerFcmToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body as { token?: string };
    console.log("Registering FCM token:", token);
    if (!token) {
      res.status(400).json({ message: "Token required" });
      return;
    }

    await User.findByIdAndUpdate(req.user!.id, { $set: { fcmTokens: [token] } });

    res.status(200).json({ message: "FCM token registered" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFcmToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body as { token?: string };
    if (!token) {
      res.status(400).json({ message: "Token required" });
      return;
    }

    await User.findByIdAndUpdate(req.user!.id, { $pull: { fcmTokens: token } });

    res.status(200).json({ message: "FCM token removed" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
