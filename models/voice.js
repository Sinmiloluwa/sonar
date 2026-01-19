import mongoose from "mongoose";

const VoicePostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  audioUrl: String,
  duration: Number,
  reactions: {
    fire: { type: Number, default: 0 },
    heart: { type: Number, default: 0 },
    clap: { type: Number, default: 0 },
  },
  plays: { type: Number, default: 0 },
  reports: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("VoicePost", VoicePostSchema);
