import Voice from "../models/voice.js";

export const uploadVoice = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No audio file uploaded" });
        }

        const voice = await Voice.create({
            userId: req.user.id, 
            audioUrl: `/uploads/${req.file.filename}`,
            duration: req.body.duration,
        });

        res.status(201).json({
            message: "Voice uploaded",
            voice,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};