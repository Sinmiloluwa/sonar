import User from "../models/user.js";
import Voice from "../models/voice.js";

export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ message: "Search query required" });
        }

        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        })
        .select('username displayName profilePicture')
        .limit(20)
        .sort({ username: 1 });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const searchVoicePosts = async (req, res) => {
    try {
        const { q, tag, category, userId, page = 1 } = req.query;
        const limit = 20;
        const skip = (page - 1) * limit;

        const query = {};

        if (q) {
            query.$or = [
                { description: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } }
            ];
        }

        if (tag) {
            query.tags = tag.toLowerCase();
        }

        if (category) {
            query.category = category;
        }

        if (userId) {
            query.userId = userId;
        }

        const voices = await Voice.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("userId", "username displayName profilePicture");

        const total = await Voice.countDocuments(query);

        res.status(200).json({
            voices,
            pagination: {
                page: parseInt(page),
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getTags = async (req, res) => {
    try {
        const tags = await Voice.aggregate([
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 50 },
            { $project: { tag: "$_id", count: 1, _id: 0 } }
        ]);

        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
