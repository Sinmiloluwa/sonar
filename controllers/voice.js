import Voice from "../models/voice.js";
import Follow from "../models/follow.js";
import { uploadToCloudinary } from "../services/cloudinary.js";
import { sendErrorEmail } from "../sendUploadErrorMail.js";
import { notifyUploadComplete, notifyFollowersNewPost } from "../services/notificationService.js";

export const uploadVoice = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ message: "No audio file" });

        res.status(202).json({ message: "Upload started in background" });

        const { duration, tags, category, description } = req.body;

        const normalizedTags = tags
            ? [...new Set(tags.map(tag => tag.trim().toLowerCase()))]
            : [];

        uploadToCloudinary(req.file.path).then(async (result) => {
            const voicePost = await Voice.create({
                userId: req.user.id,
                audioUrl: result.secure_url,
                duration,
                tags: normalizedTags,
                category,
                description,
                status: "completed"
            });
            console.log("Background upload finished.");
            notifyUploadComplete(req.user.id);
            notifyFollowersNewPost(req.user.id, voicePost._id);
        }).catch(async (err) => {
            console.error("Background upload failed:", err)
            sendErrorEmail(req.user.email, "Audio Upload Failed", {
                message: "Your recent audio upload failed to process. Please try again.",
                error: err.message
            }).catch((mailErr) => {
                console.error("Notification email failed:", mailErr.message);
            });
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const userUploads = async (req, res) => {
    try {
        const userId = req.user.id;
        const voicePosts = await Voice.find({ userId: userId })
        if (!voicePosts) {
            return res.status(200).json({ message: "No voice posts" })
        }

        return res.status(200).json({ message: "Voice posts", voicePosts: voicePosts })
    } catch {
        res.status(500).json({ message: "Server error" })
    }
}

export const feed = async (req, res) => {
    try {
        const { category, userId } = req.query;
        const filter = req.query.filter
            || ("trending" in req.query && "trending")
            || ("following" in req.query && "following")
            || "for-you";
        const baseQuery = {};

        if (category) {
            baseQuery.category = category;
        }

        if (userId) {
            baseQuery.userId = userId;
        }

        const populateFields = "username displayName profilePicture";

        if (filter === "trending") {
            const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

            const matchStage = { ...baseQuery, createdAt: { $gte: cutoff } };

            const voices = await Voice.aggregate([
                { $match: matchStage },
                {
                    $addFields: {
                        engagementScore: {
                            $add: [
                                "$reactions.fire",
                                "$reactions.heart",
                                "$reactions.clap",
                                "$plays"
                            ]
                        }
                    }
                },
                { $sort: { engagementScore: -1 } },
                { $limit: 50 }
            ]);

            await Voice.populate(voices, {
                path: "userId",
                select: populateFields
            });

            return res.status(200).json(voices);
        }

        if (filter === "following") {
            const following = await Follow.find({ follower: req.user.id }).select("following");
            const followingIds = following.map(f => f.following);

            const voices = await Voice.find({ ...baseQuery, userId: { $in: followingIds } })
                .sort({ createdAt: -1 })
                .limit(50)
                .populate("userId", populateFields);

            return res.status(200).json(voices);
        }

        // filter === "for-you" (default)
        const following = await Follow.find({ follower: req.user.id }).select("following");
        const followingIds = following.map(f => f.following);

        const followingPosts = followingIds.length > 0
            ? await Voice.find({ ...baseQuery, userId: { $in: followingIds } })
                .sort({ createdAt: -1 })
                .limit(30)
                .populate("userId", populateFields)
            : [];

        const followingPostIds = followingPosts.map(p => p._id);
        const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const trendingPosts = await Voice.aggregate([
            {
                $match: {
                    ...baseQuery,
                    _id: { $nin: followingPostIds },
                    createdAt: { $gte: cutoff }
                }
            },
            {
                $addFields: {
                    engagementScore: {
                        $add: [
                            "$reactions.fire",
                            "$reactions.heart",
                            "$reactions.clap",
                            "$plays"
                        ]
                    }
                }
            },
            { $sort: { engagementScore: -1 } },
            { $limit: 20 }
        ]);

        await Voice.populate(trendingPosts, {
            path: "userId",
            select: populateFields
        });

        const voices = [...followingPosts, ...trendingPosts];

        res.status(200).json(voices);
    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
}