import Voice from "../models/voice.js";
import { uploadToCloudinary } from "../services/cloudinary.js";
import { sendErrorEmail } from "../sendUploadErrorMail.js";

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
            await Voice.create({
                userId: req.user.id,
                audioUrl: result.secure_url,
                duration,
                tags: normalizedTags,
                category,
                description,
                status: "completed"
            });
            console.log("Background upload finished.");
        }).catch(async (err) => {
            console.error("Background upload failed:", err)
            sendErrorEmail(req.user.email, "Audio Upload Failed", {
                message: "Your recent audio upload failed to process. Please try again.",
                error: err.message
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
        const query = {};

        if (category) {
            query.category = category;
        }

        if (userId) {
            query.userId = userId;
        }

        const voices = await Voice.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("userId", "username displayName profilePicture");

        res.status(200).json(voices);
    } catch {
        res.status(500).json({ message: "Server error " })
    }
}