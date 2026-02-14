import Follow from "../models/follow.js";
import User from "../models/user.js";

export const followUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId === req.user.id) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingFollow = await Follow.findOne({
            follower: req.user.id,
            following: userId
        });

        if (existingFollow) {
            return res.status(400).json({ message: "Already following this user" });
        }

        await Follow.create({
            follower: req.user.id,
            following: userId
        });

        res.status(201).json({ message: "Followed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await Follow.findOneAndDelete({
            follower: req.user.id,
            following: userId
        });

        if (!result) {
            return res.status(404).json({ message: "You are not following this user" });
        }

        res.status(200).json({ message: "Unfollowed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const following = await Follow.find({ follower: req.user.id })
            .populate("following", "username displayName profilePicture")
            .sort({ createdAt: -1 });

        const users = following.map(f => f.following);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
