import Follow from "../models/follow.js";
import User from "../models/user.js";
import { notifyNewFollower } from "../services/notificationService.js";
import { Request, Response } from "express";

export const followUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (userId === req.user!.id) {
            res.status(400).json({ message: "You cannot follow yourself" });
            return;
        }

        const userExists = await User.findById(userId);
        if (!userExists) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const existingFollow = await Follow.findOne({
            follower: req.user!.id,
            following: userId
        });

        if (existingFollow) {
            res.status(400).json({ message: "Already following this user" });
            return;
        }

        await Follow.create({
            follower: req.user!.id,
            following: userId
        });

        notifyNewFollower(userId as string, req.user!.id);

        res.status(201).json({ message: "Followed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const unfollowUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const result = await Follow.findOneAndDelete({
            follower: req.user!.id,
            following: userId
        });

        if (!result) {
            res.status(404).json({ message: "You are not following this user" });
            return;
        }

        res.status(200).json({ message: "Unfollowed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getFollowing = async (req: Request, res: Response): Promise<void> => {
    try {
        const following = await Follow.find({ follower: req.user!.id })
            .populate("following", "username displayName profilePicture")
            .sort({ createdAt: -1 });

        const users = following.map(f => f.following);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
